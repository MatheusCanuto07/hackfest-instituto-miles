import './armazenamento.js';
import type { Evolucao } from './data/paciente.js';
import type { ResultadoExtracao } from './extracao.js';

interface EstadoIA {
	resultados: Record<string, ResultadoExtracao>;
	enviados: string[];
	colados: Evolucao[];
}

const CHAVE = 'pep:ia';

function carregar(): EstadoIA {
	try {
		const salvo = localStorage.getItem(CHAVE);
		if (salvo) return JSON.parse(salvo);
	} catch {
		// dados corrompidos: começa vazio
	}
	return { resultados: {}, enviados: [], colados: [] };
}

export const ia = $state<EstadoIA>(carregar());

export function salvarIA() {
	localStorage.setItem(CHAVE, JSON.stringify(ia));
}

export function chaveEnvio(registroId: string, exameId: string) {
	return `${registroId}:${exameId}`;
}

export async function processar(registro: Evolucao): Promise<ResultadoExtracao> {
	const resposta = await fetch('/api/extrair', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ texto: registro.texto })
	});
	const resultado = (await resposta.json()) as ResultadoExtracao;
	ia.resultados[registro.id] = resultado;
	salvarIA();
	return resultado;
}

export function restaurarIA() {
	ia.resultados = {};
	ia.enviados = [];
	ia.colados = [];
	salvarIA();
}
