import { EXAMES, type Exame } from './data/exames.js';

export const PREFIXO_EXAME = '[EXAME]';

const RE_LINHA_EXAME = /^\[EXAME\][^\n]*\(SIGTAP\s+(\d{2}\.\d{2}\.\d{2}\.\d{3}-\d)\)/gm;

export function normalizar(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

export function linhaExame(exame: Exame): string {
	return `${PREFIXO_EXAME} ${exame.nome} (SIGTAP ${exame.sigtap})`;
}

export interface ExameLancado {
	exame: Exame;
	quantidade: number;
}

export function examesLancados(texto: string): ExameLancado[] {
	const porCodigo = new Map<string, ExameLancado>();
	for (const [, codigo] of texto.matchAll(RE_LINHA_EXAME)) {
		const atual = porCodigo.get(codigo);
		if (atual) {
			atual.quantidade++;
			continue;
		}
		const exame = EXAMES.find((e) => e.sigtap === codigo);
		if (exame) porCodigo.set(codigo, { exame, quantidade: 1 });
	}
	return [...porCodigo.values()];
}

export interface ExameCitado {
	exame: Exame;
	trecho: string;
	linha: number;
}

function regexTermo(termo: string): RegExp {
	const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(?<![\\p{L}\\d/])${escapado}(?![\\p{L}\\d])`, 'u');
}

/** Exames mencionados em texto livre que ainda não têm linha [EXAME] padronizada. */
export function examesCitadosSemPadrao(texto: string): ExameCitado[] {
	const lancados = new Set(examesLancados(texto).map((l) => l.exame.id));
	const linhas = texto.split('\n');
	const citados: ExameCitado[] = [];

	for (const exame of EXAMES) {
		if (lancados.has(exame.id)) continue;
		encontrar: for (const [i, linha] of linhas.entries()) {
			if (linha.startsWith(PREFIXO_EXAME)) continue;
			const normalizada = normalizar(linha);
			for (const termo of exame.sinonimos) {
				const achado = regexTermo(normalizar(termo)).exec(normalizada);
				if (achado) {
					citados.push({
						exame,
						trecho: linha.slice(achado.index, achado.index + achado[0].length),
						linha: i
					});
					break encontrar;
				}
			}
		}
	}
	return citados.sort((a, b) => a.linha - b.linha);
}

export function inserirLinha(texto: string, inicio: number, fim: number, linha: string) {
	const antes = texto.slice(0, inicio);
	const depois = texto.slice(fim);
	const prefixo = antes === '' || antes.endsWith('\n') ? '' : '\n';
	const sufixo = depois.startsWith('\n') ? '' : '\n';
	const inserido = antes + prefixo + linha + sufixo;
	return {
		texto: inserido + depois,
		cursor: inserido.length + (sufixo ? 0 : 1)
	};
}

export function padronizarCitacao(texto: string, citado: ExameCitado): string {
	const linhas = texto.split('\n');
	linhas.splice(citado.linha + 1, 0, linhaExame(citado.exame));
	return linhas.join('\n');
}

export function removerExame(texto: string, exame: Exame): string {
	return texto
		.split('\n')
		.filter((l) => !(l.startsWith(PREFIXO_EXAME) && l.includes(`(SIGTAP ${exame.sigtap})`)))
		.join('\n');
}

export function buscarExames(consulta: string, limite = 8): Exame[] {
	const q = normalizar(consulta.trim());
	if (!q) return EXAMES.filter((e) => e.frequente).slice(0, limite);
	const pontuar = (e: Exame) => {
		if (e.atalho.startsWith(q)) return 0;
		if (normalizar(e.nome).startsWith(q)) return 1;
		if (e.sinonimos.some((s) => normalizar(s).startsWith(q))) return 2;
		if (normalizar(e.nome).includes(q)) return 3;
		if (e.sinonimos.some((s) => normalizar(s).includes(q))) return 4;
		return -1;
	};
	return EXAMES.map((e) => ({ e, p: pontuar(e) }))
		.filter(({ p }) => p >= 0)
		.sort((a, b) => a.p - b.p)
		.slice(0, limite)
		.map(({ e }) => e);
}
