import { EXAMES, MONOCULARES } from './data/exames.js';
import { PREFIXO_EXAME, normalizar } from './prontuario.js';

export type Situacao = 'realizado' | 'solicitado' | 'negado';
export type Olho = 'OD' | 'OE' | 'AO';

export interface ItemExtraido {
	exameId: string;
	situacao: Situacao;
	olho: Olho | null;
	quantidade: number;
	trecho: string;
	confianca: number;
}

export interface ResultadoExtracao {
	modo: 'ia' | 'regras';
	modelo?: string;
	ms: number;
	itens: ItemExtraido[];
	aviso?: string;
}

export const ROTULO_SITUACAO: Record<Situacao, string> = {
	realizado: 'Realizado',
	solicitado: 'Solicitado',
	negado: 'Não realizado'
};

const SOLICITACAO =
	/(?<![\p{L}\d])(solicit\p{L}*|pe[cç]o|pedid\p{L}*|agend\p{L}*|encaminh\p{L}*|programad\p{L}*|a realizar|retorno com|indico)(?![\p{L}\d])/u;
const NEGACAO = /(?<![\p{L}\d])(sem|nao|nego|dispensad\p{L}*|contraindicad\p{L}*)(?![\p{L}\d])/u;
const OLHO = /(?<![\p{L}\d])(AO|OD|OE)(?![\p{L}\d])/u;

export function quantidadePara(exameId: string, olho: Olho | null) {
	return olho === 'AO' && MONOCULARES.has(exameId) ? 2 : 1;
}

/** Localiza o trecho no texto ignorando acentos e caixa e devolve a grafia original. */
export function trechoOriginal(texto: string, trecho: string): string | null {
	if (!trecho.trim()) return null;
	if (texto.includes(trecho)) return trecho;
	const inicio = normalizar(texto).indexOf(normalizar(trecho.trim()));
	return inicio === -1 ? null : texto.slice(inicio, inicio + trecho.trim().length);
}

function regexTermo(termo: string) {
	const escapado = normalizar(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(?<![\\p{L}\\d/])${escapado}(?![\\p{L}\\d])`, 'u');
}

/** Leitor por regras: plano B quando a IA local não está disponível. */
export function extrairPorRegras(texto: string): ItemExtraido[] {
	const itens = new Map<string, ItemExtraido>();
	const adicionar = (item: ItemExtraido) => {
		const chave = `${item.exameId}:${item.situacao}`;
		if (!itens.has(chave)) itens.set(chave, item);
	};

	for (const linha of texto.split('\n')) {
		if (linha.startsWith(PREFIXO_EXAME)) {
			const exame = EXAMES.find((e) => linha.includes(`(SIGTAP ${e.sigtap})`));
			if (!exame) continue;
			const olho = (OLHO.exec(linha)?.[1] as Olho) ?? null;
			adicionar({
				exameId: exame.id,
				situacao: 'realizado',
				olho,
				quantidade: quantidadePara(exame.id, olho),
				trecho: linha,
				confianca: 1
			});
			continue;
		}

		for (const frase of linha.split(/(?<=[.;])\s+/)) {
			const normalizada = normalizar(frase);
			for (const exame of EXAMES) {
				const termo = exame.sinonimos.find((s) => regexTermo(s).test(normalizada));
				if (!termo) continue;
				const posicao = regexTermo(termo).exec(normalizada)!.index;
				const antes = normalizada.slice(0, posicao);
				const situacao: Situacao = NEGACAO.test(antes.slice(-25))
					? 'negado'
					: SOLICITACAO.test(normalizada)
						? 'solicitado'
						: 'realizado';
				const olho = (OLHO.exec(frase.slice(posicao))?.[1] as Olho) ?? null;
				adicionar({
					exameId: exame.id,
					situacao,
					olho,
					quantidade: quantidadePara(exame.id, olho),
					trecho: frase.trim(),
					confianca: 0.6
				});
			}
		}
	}
	return [...itens.values()];
}
