// Ao mudar a estrutura dos dados salvos, incremente a versão:
// dados antigos salvos no navegador podem não ser mais compatíveis.
const VERSAO = '5';

function apagarTudo() {
	for (const chave of Object.keys(localStorage)) {
		if (chave.startsWith('pep:')) localStorage.removeItem(chave);
	}
	localStorage.setItem('pep:versao', VERSAO);
}

if (localStorage.getItem('pep:versao') !== VERSAO) apagarTudo();

/** Apaga prontuários, lançamentos e rascunhos e recarrega a página com tudo vazio. */
export function limparMemoria() {
	apagarTudo();
	location.reload();
}
