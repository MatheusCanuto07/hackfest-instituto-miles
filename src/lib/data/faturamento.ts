import { EXAMES, type Exame } from './exames.js';

export const CONSULTAS: Exame[] = [
	{
		id: 'consulta-especializada',
		nome: 'Consulta médica em atenção especializada',
		sigtap: '03.01.01.007-2',
		categoria: 'Consulta',
		atalho: 'consulta',
		sinonimos: ['consulta']
	}
];

export const PROCEDIMENTOS: Exame[] = [...CONSULTAS, ...EXAMES];

export interface Prestador {
	codigo: string;
	nome: string;
	cbo: string;
	cboDescricao: string;
}

const oftalmologista = { cbo: '225265', cboDescricao: 'Médico oftalmologista' };

export const prestadores: Prestador[] = [
	{ ...oftalmologista, codigo: '1171', nome: 'Dr. Carlos Souza' },
	{ ...oftalmologista, codigo: '1176', nome: 'Dra. Ana Lima' },
	{ ...oftalmologista, codigo: '1188', nome: 'Dra. Paula Mendes' },
	{ ...oftalmologista, codigo: '1190', nome: 'Dr. Rafael Costa' },
	{ ...oftalmologista, codigo: '1194', nome: 'Dra. Lúcia Prado' },
	{ ...oftalmologista, codigo: '1201', nome: 'Dr. João Pereira' }
];

export const codigosSetor: Record<string, string> = {
	Oftalmologia: '4042'
};

export interface Lancamento {
	id: string;
	numero: number;
	remessa: string;
	pacienteId: string;
	data: string;
	hora: string;
	procedimentoId: string | null;
	cid: string;
	prestadorCodigo: string | null;
	quantidade: number;
}

export const REMESSA = '1747';
export const COMPETENCIA = '11/2026';

/** O sistema começa vazio: os lançamentos são criados durante o uso. */
export const lancamentosIniciais: Lancamento[] = [];
