<script lang="ts">
	import JanelaSistema, { type Janela } from '#lib/components/JanelaSistema.svelte';
	import ConsultaProntuario from '#lib/components/faturamento/ConsultaProntuario.svelte';
	import LancamentoProcedimentos from '#lib/components/faturamento/LancamentoProcedimentos.svelte';
	import { pacientes } from '#lib/data/paciente.js';
	import { retirarTarefa } from '#lib/robo.js';

	const JANELAS: Janela[] = [
		{ id: 'lancamentos', titulo: 'Lançamento de BPA' },
		{ id: 'prontuario', titulo: 'Consulta Prontuário' }
	];

	let ativa = $state('lancamentos');
	let pacienteId = $state(pacientes[0].id);
	let aviso = $state<string | null>(null);
	let lancamento = $state<LancamentoProcedimentos>();

	function mostrarAviso(mensagem: string) {
		aviso = mensagem;
		setTimeout(() => (aviso = null), 4000);
	}

	$effect(() => {
		if (!lancamento || !new URLSearchParams(location.search).has('robo')) return;
		history.replaceState(null, '', location.pathname);
		const tarefa = retirarTarefa();
		if (!tarefa) return;
		ativa = 'lancamentos';
		lancamento.executarRobo(tarefa);
	});
</script>

<JanelaSistema
	titulo="Faturamento"
	cenario="atual"
	usuario="Carla Nunes"
	janelas={JANELAS}
	{ativa}
	onativar={(id) => (ativa = id)}
	{aviso}
>
	<div class={['h-full', ativa !== 'lancamentos' && 'hidden']}>
		<LancamentoProcedimentos
			bind:this={lancamento}
			bind:pacienteId
			onabrirProntuario={() => (ativa = 'prontuario')}
			onaviso={mostrarAviso}
		/>
	</div>
	<div class={['h-full', ativa !== 'prontuario' && 'hidden']}>
		<ConsultaProntuario
			bind:pacienteId
			onlancar={(id) => {
				ativa = 'lancamentos';
				lancamento?.novo(id);
			}}
			onaviso={mostrarAviso}
		/>
	</div>
</JanelaSistema>
