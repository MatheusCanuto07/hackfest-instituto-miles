export interface TarefaRobo {
	pacienteId: string;
	prestadorCodigo: string | null;
	itens: { exameId: string; quantidade: number }[];
}

const CHAVE = 'pep:robo:tarefa';

export function agendarTarefa(tarefa: TarefaRobo) {
	localStorage.setItem(CHAVE, JSON.stringify(tarefa));
}

/** Lê e consome a tarefa, para o robô não repetir os lançamentos ao recarregar a página. */
export function retirarTarefa(): TarefaRobo | null {
	const salvo = localStorage.getItem(CHAVE);
	localStorage.removeItem(CHAVE);
	try {
		return salvo ? JSON.parse(salvo) : null;
	} catch {
		return null;
	}
}
