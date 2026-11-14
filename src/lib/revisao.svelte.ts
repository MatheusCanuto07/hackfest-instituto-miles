import './armazenamento.js';
import { EXAMES } from './data/exames.js';
import { CONSULTAS, REMESSA, prestadores, type Lancamento } from './data/faturamento.js';
import { pacientes, type Evolucao } from './data/paciente.js';
import { PREFIXO_EXAME, examesCitadosSemPadrao } from './prontuario.js';

export type StatusLancamento = 'pendente' | 'aprovado' | 'devolvido';
export type StatusAlerta = 'pendente' | 'incluido' | 'descartado';

export const ROTULO_STATUS: Record<StatusLancamento, string> = {
	pendente: 'Pendente de revisão',
	aprovado: 'Aprovado',
	devolvido: 'Devolvido ao médico'
};

export interface Origem {
	tipo: string;
	autor: string;
	data: string;
	linhas: string[];
	fonte?: 'formulario' | 'analise';
	confianca?: number;
	motivo?: string;
}

export interface LancamentoRevisao extends Lancamento {
	status: StatusLancamento;
	origem: Origem;
	motivo?: string;
	evolucaoId?: string;
}

/** Exame citado no texto do prontuário sem lançamento na lista de exames complementares. */
export interface AlertaCitacao {
	id: string;
	evolucaoId: string;
	pacienteId: string;
	exameId: string;
	exameNome: string;
	categoria: string;
	sigtap: string;
	trecho: string;
	data: string;
	autor: string;
	status: StatusAlerta;
}

export function registrosDaEvolucao(evolucaoId: string) {
	return revisao.itens.filter((i) => i.evolucaoId === evolucaoId);
}

export function alertasDoPaciente(pacienteId: string) {
	return revisao.alertas.filter((a) => a.pacienteId === pacienteId && a.status === 'pendente');
}

interface Estado {
	itens: LancamentoRevisao[];
	importadas: string[];
	alertas: AlertaCitacao[];
}

const CHAVE = 'pep:solucao:lancamentos';
const RE_CODIGO = /\(SIGTAP\s+(\d{2}\.\d{2}\.\d{2}\.\d{3}-\d)\)/;
const CONSULTA = CONSULTAS[0];

function cidDoPaciente(pacienteId: string) {
	return pacientes
		.find((p) => p.id === pacienteId)!
		.cid.split(' ')[0]
		.replace('.', '');
}

function carregar(): Estado {
	try {
		const salvo = localStorage.getItem(CHAVE);
		if (salvo) {
			const dados = JSON.parse(salvo);
			return {
				itens: dados.itens ?? [],
				importadas: dados.importadas ?? [],
				alertas: dados.alertas ?? []
			};
		}
	} catch {
		// dados corrompidos: começa vazio
	}
	return { itens: [], importadas: [], alertas: [] };
}

export const revisao = $state<Estado>(carregar());

// Garante campo novo mesmo se o hot-reload trouxer estado antigo em memória.
if (!Array.isArray(revisao.alertas)) revisao.alertas = [];

function persistir() {
	localStorage.setItem(CHAVE, JSON.stringify(revisao));
}

interface RegistroExame {
	exameId: string;
	quantidade: number;
	origem: Partial<Origem> & { linhas: string[] };
}

function registrarAlertas(evolucao: Evolucao) {
	for (const citado of examesCitadosSemPadrao(evolucao.texto)) {
		revisao.alertas.push({
			id: crypto.randomUUID(),
			evolucaoId: evolucao.id,
			pacienteId: evolucao.pacienteId,
			exameId: citado.exame.id,
			exameNome: citado.exame.nome,
			categoria: citado.exame.categoria,
			sigtap: citado.exame.sigtap,
			trecho: citado.trecho,
			data: evolucao.data,
			autor: evolucao.autor,
			status: 'pendente'
		});
	}
}

/**
 * Cada prontuário assinado vira um registro do tipo consulta e um registro do tipo exame
 * para cada exame lançado, todos "pendente de revisão".
 */
function criarRegistros(evolucao: Evolucao, exames: RegistroExame[]) {
	revisao.importadas.push(evolucao.id);

	const [data, hora] = evolucao.data.split(' ');
	const origem = { tipo: evolucao.tipo, autor: evolucao.autor, data: evolucao.data };
	const base = {
		evolucaoId: evolucao.id,
		remessa: REMESSA,
		pacienteId: evolucao.pacienteId,
		data,
		hora,
		cid: cidDoPaciente(evolucao.pacienteId),
		prestadorCodigo: prestadores.find((p) => p.nome === evolucao.autor)?.codigo ?? null,
		status: 'pendente' as const
	};
	let numero = Math.max(280100, ...revisao.itens.map((i) => i.numero));

	revisao.itens.push({
		...base,
		id: crypto.randomUUID(),
		numero: ++numero,
		procedimentoId: CONSULTA.id,
		quantidade: 1,
		origem: {
			...origem,
			linhas: [`${evolucao.tipo} registrada no prontuário por ${evolucao.autor}`]
		}
	});

	for (const exame of exames) {
		revisao.itens.push({
			...base,
			id: crypto.randomUUID(),
			numero: ++numero,
			procedimentoId: exame.exameId,
			quantidade: exame.quantidade,
			origem: { ...origem, ...exame.origem }
		});
	}

	registrarAlertas(evolucao);
	persistir();
}

/** Lê as linhas [EXAME] de um prontuário assinado na nossa solução. */
export function importarEvolucao(evolucao: Evolucao) {
	if (jaEnviada(evolucao.id)) return;

	const exames: RegistroExame[] = [];
	for (const linha of evolucao.texto.split('\n')) {
		if (!linha.startsWith(PREFIXO_EXAME)) continue;
		const codigo = RE_CODIGO.exec(linha)?.[1];
		const exame = EXAMES.find((e) => e.sigtap === codigo);
		if (exame)
			exames.push({
				exameId: exame.id,
				quantidade: 1,
				origem: { linhas: [linha], fonte: 'formulario' }
			});
	}
	if (!exames.length && evolucao.tipo !== 'Anamnese') return;
	criarRegistros(evolucao, exames);
}

export interface ItemAnalise {
	exameId: string;
	quantidade: number;
	trecho: string;
	confianca: number;
	motivo: string;
}

export function jaEnviada(evolucaoId: string) {
	return revisao.importadas.includes(evolucaoId);
}

/** Envia ao faturamento, como "pendente de revisão", os exames confirmados no assistente. */
export function importarAnalise(evolucao: Evolucao, itens: ItemAnalise[]) {
	if (jaEnviada(evolucao.id)) return;
	criarRegistros(
		evolucao,
		itens.map((item) => ({
			exameId: item.exameId,
			quantidade: item.quantidade,
			origem: {
				linhas: [item.trecho],
				fonte: 'analise',
				confianca: item.confianca,
				motivo: item.motivo
			}
		}))
	);
}

export function mudarStatus(ids: string[], status: StatusLancamento, motivo?: string) {
	for (const item of revisao.itens) {
		if (!ids.includes(item.id)) continue;
		item.status = status;
		item.motivo = status === 'devolvido' ? motivo : undefined;
	}
	persistir();
}

/** Inclui o exame do alerta como procedimento pendente de revisão. */
export function incluirAlerta(alertaId: string) {
	const alerta = revisao.alertas.find((a) => a.id === alertaId);
	if (!alerta || alerta.status !== 'pendente') return;

	const base = revisao.itens.find((i) => i.evolucaoId === alerta.evolucaoId);
	if (!base) return;

	const numero = Math.max(280100, ...revisao.itens.map((i) => i.numero)) + 1;
	revisao.itens.push({
		id: crypto.randomUUID(),
		numero,
		remessa: base.remessa,
		pacienteId: base.pacienteId,
		procedimentoId: alerta.exameId,
		quantidade: 1,
		data: base.data,
		hora: base.hora,
		cid: base.cid,
		prestadorCodigo: base.prestadorCodigo,
		status: 'pendente',
		evolucaoId: alerta.evolucaoId,
		origem: {
			tipo: base.origem.tipo,
			autor: base.origem.autor,
			data: base.origem.data,
			linhas: [`Citado no texto: “${alerta.trecho}” → ${alerta.exameNome}`],
			fonte: 'analise',
			motivo: 'Incluído a partir de alerta: citado no prontuário sem lançamento na lista'
		}
	});
	alerta.status = 'incluido';
	persistir();
}

export function descartarAlerta(alertaId: string) {
	const alerta = revisao.alertas.find((a) => a.id === alertaId);
	if (!alerta || alerta.status !== 'pendente') return;
	alerta.status = 'descartado';
	persistir();
}

export function salvarRevisao() {
	persistir();
}

export function restaurarRevisao() {
	revisao.itens = [];
	revisao.importadas = [];
	revisao.alertas = [];
	persistir();
}
