import { EXAMES, type Exame } from './data/exames.js';
import { normalizar } from './prontuario.js';

export type Situacao = 'realizado' | 'solicitado' | 'negado';
export type Olho = 'OD' | 'OE' | 'AO';

export interface Mencao {
	inicio: number;
	fim: number;
}

export interface Achado {
	exame: Exame;
	situacao: Situacao;
	olho: Olho | null;
	quantidade: number;
	confianca: number;
	trecho: string;
	motivo: string;
	mencoes: Mencao[];
}

export const motor = {
	conectado: false,
	nome: 'Motor de leitura não conectado',
	descricao:
		'A leitura automática (algoritmo ou IA local) ainda não foi implementada. A tela mostra resultados de exemplo fixos.'
};

type Exemplo = [
	exameId: string,
	situacao: Situacao,
	termo: string,
	olho: Olho | null,
	quantidade: number,
	confianca: number,
	motivo: string
];

// Resultados de exemplo, escritos à mão para as evoluções de demonstração.
// Quando o motor de leitura existir, `analisarTexto` passa a calculá-los a partir do texto.
const EXEMPLOS: Record<string, Exemplo[]> = {
	'ev-p1-2': [
		['tonometria', 'realizado', 'tono', 'AO', 1, 0.9, 'execução descrita no texto ("Feito")'],
		['gonioscopia', 'realizado', 'Gonio', 'AO', 1, 0.7, 'resultado descrito: conferir'],
		['campimetria', 'solicitado', 'campo visual', null, 1, 0.85, 'pedido de exame ("Solicito")'],
		['oct', 'solicitado', 'OCT', null, 1, 0.85, 'pedido de exame ("Solicito")']
	],
	'ev-p1-1': [
		['fundoscopia', 'realizado', 'FO', 'AO', 1, 0.8, 'resultado descrito após o exame'],
		['tonometria', 'realizado', 'aplanação', null, 1, 0.7, 'medida de pressão descrita: conferir']
	],
	'ev-p2-1': [
		[
			'mapeamento-retina',
			'realizado',
			'Mapeamento de retina',
			'AO',
			2,
			0.85,
			'resultado descrito; exame monocular nos dois olhos'
		],
		['oct', 'realizado', 'OCT', 'OD', 1, 0.6, 'citado sem indicação clara: conferir'],
		[
			'retinografia-colorida',
			'solicitado',
			'retinografia colorida',
			null,
			1,
			0.85,
			'pedido de exame ("Solicitada")'
		],
		[
			'retinografia-fluorescente',
			'solicitado',
			'angio',
			null,
			1,
			0.85,
			'pedido de exame ("Solicitada")'
		]
	],
	'ev-p3-1': [
		[
			'topografia-cornea',
			'realizado',
			'topografia de córnea',
			'AO',
			1,
			0.9,
			'execução descrita ("Realizadas")'
		],
		['ceratometria', 'realizado', 'ceratometria', 'AO', 1, 0.9, 'execução descrita ("Realizadas")'],
		['schirmer', 'realizado', 'Schirmer', null, 1, 0.7, 'resultado descrito: conferir']
	],
	'ev-p4-1': [
		['biometria', 'realizado', 'Biometria', 'OD', 1, 0.7, 'citado com finalidade: conferir'],
		[
			'microscopia-especular',
			'realizado',
			'Microscopia especular',
			null,
			1,
			0.8,
			'resultado descrito após o exame'
		],
		['tonometria', 'realizado', 'Tonometria', null, 1, 0.8, 'resultado descrito ("normal")']
	]
};

function montar(texto: string, exemplos: Exemplo[]): Achado[] {
	const normalizado = normalizar(texto);
	return exemplos.flatMap(([exameId, situacao, termo, olho, quantidade, confianca, motivo]) => {
		const exame = EXAMES.find((e) => e.id === exameId);
		if (!exame) return [];
		const inicio = normalizado.indexOf(normalizar(termo));
		const fim = inicio + termo.length;
		const linha = inicio >= 0 ? texto.slice(0, inicio).split(/[.\n]/).length - 1 : -1;
		const trecho =
			linha >= 0
				? (texto.split(/[.\n]/)[linha] ?? termo).trim()
				: 'resultado padrão do motor provisório';
		return [
			{
				exame,
				situacao,
				olho,
				quantidade,
				confianca,
				motivo,
				trecho,
				mencoes: inicio >= 0 ? [{ inicio, fim }] : []
			}
		];
	});
}

export function temExemplo(registroId: string) {
	return registroId in EXEMPLOS;
}

// Motor provisório: qualquer texto sem exemplo próprio "encontra" estes 3 exames.
const PADRAO: Exemplo[] = [
	['tonometria', 'realizado', 'tono', 'AO', 1, 0.9, 'motor provisório (resultado padrão)'],
	[
		'mapeamento-retina',
		'realizado',
		'mapeamento',
		'AO',
		2,
		0.85,
		'motor provisório (resultado padrão)'
	],
	['oct', 'realizado', 'oct', 'OD', 1, 0.8, 'motor provisório (resultado padrão)']
];

/** Ponto único de troca: hoje devolve exemplos fixos; depois, o algoritmo ou a IA local. */
export async function analisarTexto(texto: string, registroId?: string): Promise<Achado[]> {
	await new Promise((r) => setTimeout(r, 400));
	if (!texto.trim()) return [];
	return montar(texto, (registroId && EXEMPLOS[registroId]) || PADRAO);
}

export function exemplosSincronos(texto: string, registroId: string): Achado[] {
	return EXEMPLOS[registroId] ? montar(texto, EXEMPLOS[registroId]) : [];
}
