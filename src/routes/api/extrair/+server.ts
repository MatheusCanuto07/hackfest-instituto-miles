import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EXAMES } from '#lib/data/exames.js';
import {
	extrairPorRegras,
	quantidadePara,
	type ItemExtraido,
	type Olho,
	type ResultadoExtracao,
	type Situacao
} from '#lib/extracao.js';

const OLLAMA = 'http://127.0.0.1:11434';
const MODELO = 'qwen2.5:3b';

const ESQUEMA = {
	type: 'object',
	properties: {
		itens: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					n: { type: 'integer' },
					situacao: { type: 'string', enum: ['realizado', 'solicitado', 'negado'] },
					olho: { type: 'string', enum: ['OD', 'OE', 'AO', 'nao_informado'] },
					confianca: { type: 'number' }
				},
				required: ['n', 'situacao', 'olho', 'confianca']
			}
		}
	},
	required: ['itens']
};

const INSTRUCOES = `Você revisa registros de um ambulatório de oftalmologia do SUS para o faturamento.
Para cada exame da lista, decida, lendo o TRECHO e o REGISTRO completo:
- "realizado": o exame foi feito nesta consulta, inclusive quando o texto só descreve o resultado
  (ex.: "Feito tono: PIO 24 mmHg", "Tonometria normal", "Mapeamento de retina AO: microaneurismas", "Gonio com ângulo aberto");
- "solicitado": foi pedido, agendado ou ficou para depois (ex.: "Solicito campo visual", "Retorno com campimetria", "Programado");
- "negado": o texto diz que não foi feito ou não está indicado (ex.: "Sem indicação de OCT", "Não realizado").
Informe também o olho: "OD" (direito), "OE" (esquerdo), "AO" (ambos) ou "nao_informado".
Responda um item para cada número da lista, com confiança de 0 a 1.`;

interface Classificacao {
	n: number;
	situacao: Situacao;
	olho: string;
	confianca: number;
}

/** As regras encontram os exames citados; a IA local decide a situação e o olho de cada um. */
async function classificarComIA(texto: string, candidatos: ItemExtraido[]) {
	if (!candidatos.length) return [];
	const lista = candidatos
		.map((c, i) => {
			const nome = EXAMES.find((e) => e.id === c.exameId)?.nome;
			return `${i + 1}. ${nome}. Trecho: "${c.trecho}"`;
		})
		.join('\n');

	const resposta = await fetch(`${OLLAMA}/api/chat`, {
		method: 'POST',
		signal: AbortSignal.timeout(120_000),
		body: JSON.stringify({
			model: MODELO,
			stream: false,
			format: ESQUEMA,
			options: { temperature: 0, num_ctx: 4096 },
			messages: [
				{ role: 'system', content: INSTRUCOES },
				{ role: 'user', content: `REGISTRO:\n${texto}\n\nEXAMES:\n${lista}` }
			]
		})
	});
	if (!resposta.ok) throw new Error(`Ollama respondeu ${resposta.status}`);
	const { message } = await resposta.json();
	const { itens } = JSON.parse(message.content) as { itens: Classificacao[] };

	const porNumero = new Map(itens.map((c) => [c.n, c]));
	return candidatos.map((candidato, i): ItemExtraido => {
		if (candidato.confianca === 1) return candidato;
		const c = porNumero.get(i + 1);
		if (!c) return candidato;
		const olho = (['OD', 'OE', 'AO'].includes(c.olho) ? c.olho : candidato.olho) as Olho | null;
		return {
			...candidato,
			situacao: c.situacao,
			olho,
			quantidade: quantidadePara(candidato.exameId, olho),
			confianca: Math.max(0, Math.min(1, Number(c.confianca) || 0))
		};
	});
}

export const GET: RequestHandler = async () => {
	try {
		const resposta = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(2_000) });
		const { models } = (await resposta.json()) as { models: { name: string }[] };
		const disponivel = models.some((m) => m.name === MODELO || m.name.startsWith(`${MODELO}:`));
		return json({ online: disponivel, modelo: MODELO });
	} catch {
		return json({ online: false, modelo: MODELO });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const { texto } = (await request.json()) as { texto: string };
	const inicio = Date.now();
	const candidatos = extrairPorRegras(texto);
	try {
		const itens = await classificarComIA(texto, candidatos);
		return json({
			modo: 'ia',
			modelo: MODELO,
			itens,
			ms: Date.now() - inicio
		} satisfies ResultadoExtracao);
	} catch (erro) {
		return json({
			modo: 'regras',
			itens: candidatos,
			ms: Date.now() - inicio,
			aviso: `IA local indisponível (${erro instanceof Error ? erro.message : 'erro'}); usado o leitor por regras.`
		} satisfies ResultadoExtracao);
	}
};
