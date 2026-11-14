import type { Anamnese } from '../anamnese.js';

export interface Paciente {
	id: string;
	nome: string;
	idade: number;
	sexo: 'F' | 'M';
	nascimento: string;
	prontuario: string;
	cns: string;
	atendimento: string;
	tipoAtendimento: string;
	setor: string;
	leito: string;
	convenio: string;
	admissao: string;
	cid: string;
	alergias: string[];
}

const ambulatorio = {
	tipoAtendimento: 'Ambulatorial',
	setor: 'Oftalmologia',
	convenio: 'SUS'
};

export const pacientes: Paciente[] = [
	{
		...ambulatorio,
		id: 'p1',
		nome: 'Maria Aparecida dos Santos',
		idade: 67,
		sexo: 'F',
		nascimento: '12/03/1959',
		prontuario: '000.482.917',
		cns: '700 0000 0000 0001',
		atendimento: '2026-114582',
		leito: 'Consultório 03',
		admissao: '14/11/2026',
		cid: 'H40.1 - Glaucoma primário de ângulo aberto',
		alergias: ['Dipirona']
	},
	{
		...ambulatorio,
		id: 'p2',
		nome: 'José Carlos Ferreira',
		idade: 58,
		sexo: 'M',
		nascimento: '02/08/1968',
		prontuario: '000.391.205',
		cns: '700 0000 0000 0002',
		atendimento: '2026-114601',
		leito: 'Consultório 05',
		admissao: '13/11/2026',
		cid: 'H36.0 - Retinopatia diabética',
		alergias: []
	},
	{
		...ambulatorio,
		id: 'p3',
		nome: 'Ana Beatriz Rocha',
		idade: 24,
		sexo: 'F',
		nascimento: '19/05/2002',
		prontuario: '000.517.660',
		cns: '700 0000 0000 0003',
		atendimento: '2026-114623',
		leito: 'Consultório 02',
		admissao: '13/11/2026',
		cid: 'H18.6 - Ceratocone',
		alergias: ['Penicilina']
	},
	{
		...ambulatorio,
		id: 'p4',
		nome: 'Sebastião Alves Pinto',
		idade: 78,
		sexo: 'M',
		nascimento: '30/01/1948',
		prontuario: '000.208.334',
		cns: '700 0000 0000 0004',
		atendimento: '2026-114540',
		leito: 'Consultório 01',
		admissao: '10/11/2026',
		cid: 'H25.9 - Catarata senil não especificada',
		alergias: []
	}
];

export const paciente = pacientes[0];

export const profissional = {
	nome: 'Dr. João Pereira',
	registro: 'CRM-MG 00000',
	especialidade: 'Oftalmologia'
};

export interface Evolucao {
	id: string;
	pacienteId: string;
	data: string;
	autor: string;
	tipo: string;
	texto: string;
	/** Tela em que foi assinada. */
	cenario?: 'atual' | 'solucao';
	/** Campos da anamnese como o médico preencheu (só para registros do tipo Anamnese). */
	anamnese?: Anamnese;
}

/** O prontuário começa vazio: as evoluções são lançadas na tela do médico. */
export const evolucoesIniciais: Evolucao[] = [];
