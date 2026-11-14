import './armazenamento.js';
import { evolucoesIniciais, type Evolucao } from './data/paciente.js';
import { restaurarLancamentos } from './lancamentos.svelte.js';
import { importarEvolucao, restaurarRevisao } from './revisao.svelte.js';

const CHAVE = 'pep:evolucoes';

function carregar(): Evolucao[] {
	try {
		const salvo = localStorage.getItem(CHAVE);
		if (salvo) return JSON.parse(salvo);
	} catch {
		// dados corrompidos: volta para a demonstração
	}
	return structuredClone(evolucoesIniciais);
}

export const evolucoes = $state<Evolucao[]>(carregar());

function persistir() {
	localStorage.setItem(CHAVE, JSON.stringify(evolucoes));
}

export function adicionarEvolucao(
	evolucao: Omit<Evolucao, 'id'>,
	{ gerarLancamentos = true }: { gerarLancamentos?: boolean } = {}
) {
	const nova = { ...evolucao, id: crypto.randomUUID() };
	evolucoes.unshift(nova);
	persistir();
	if (gerarLancamentos) importarEvolucao(nova);
}

export function evolucoesDoPaciente(pacienteId: string) {
	return evolucoes.filter((e) => e.pacienteId === pacienteId);
}

export function restaurarDemonstracao() {
	evolucoes.splice(0, evolucoes.length, ...structuredClone(evolucoesIniciais));
	persistir();
	restaurarLancamentos();
	restaurarRevisao();
	for (const chave of Object.keys(localStorage)) {
		if (chave.startsWith('pep:rascunho')) localStorage.removeItem(chave);
	}
}

export function agora() {
	return new Date()
		.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
		.replace(',', '');
}
