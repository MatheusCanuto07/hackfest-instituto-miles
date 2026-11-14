import './armazenamento.js';
import { lancamentosIniciais, REMESSA, type Lancamento } from './data/faturamento.js';
import { pacientes } from './data/paciente.js';

const CHAVE = 'pep:lancamentos';

function carregar(): Lancamento[] {
	try {
		const salvo = localStorage.getItem(CHAVE);
		if (salvo) return JSON.parse(salvo);
	} catch {
		// dados corrompidos: volta para a demonstração
	}
	return structuredClone(lancamentosIniciais);
}

export const lancamentos = $state<Lancamento[]>(carregar());

const estado = $state({ salvo: JSON.stringify(lancamentos) });

export function haAlteracoes() {
	return JSON.stringify(lancamentos) !== estado.salvo;
}

export function salvarLancamentos() {
	estado.salvo = JSON.stringify(lancamentos);
	localStorage.setItem(CHAVE, estado.salvo);
}

/** Lançamentos já gravados e com procedimento informado. */
export function lancadosDoPaciente(pacienteId: string): Lancamento[] {
	const gravados: Lancamento[] = JSON.parse(estado.salvo);
	return gravados.filter((l) => l.pacienteId === pacienteId && l.procedimentoId);
}

export function novoLancamento(pacienteId: string): Lancamento {
	const paciente = pacientes.find((p) => p.id === pacienteId)!;
	const numero = Math.max(279600, ...lancamentos.map((l) => l.numero)) + 1;
	const lancamento: Lancamento = {
		id: crypto.randomUUID(),
		numero,
		remessa: REMESSA,
		pacienteId,
		data: paciente.admissao,
		hora: new Date().toLocaleTimeString('pt-BR', { timeStyle: 'short' }),
		procedimentoId: null,
		cid: paciente.cid.split(' ')[0].replace('.', ''),
		prestadorCodigo: null,
		quantidade: 1
	};
	lancamentos.push(lancamento);
	return lancamento;
}

export function excluirLancamento(id: string) {
	const i = lancamentos.findIndex((l) => l.id === id);
	if (i >= 0) lancamentos.splice(i, 1);
}

export function restaurarLancamentos() {
	lancamentos.splice(0, lancamentos.length, ...structuredClone(lancamentosIniciais));
	salvarLancamentos();
}
