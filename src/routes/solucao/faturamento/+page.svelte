<script lang="ts">
	import JanelaSistema, { type Janela } from '#lib/components/JanelaSistema.svelte';
	import RevisaoLancamentos from '#lib/components/faturamento/RevisaoLancamentos.svelte';

	const JANELAS: Janela[] = [{ id: 'revisao', titulo: 'Lançamento de BPA · Revisão' }];

	let aviso = $state<string | null>(null);

	function mostrarAviso(mensagem: string) {
		aviso = mensagem;
		setTimeout(() => (aviso = null), 4000);
	}
</script>

<JanelaSistema
	titulo="Faturamento"
	cenario="solucao"
	usuario="Carla Nunes"
	janelas={JANELAS}
	ativa="revisao"
	onativar={() => {}}
	{aviso}
>
	<RevisaoLancamentos onaviso={mostrarAviso} />
</JanelaSistema>
