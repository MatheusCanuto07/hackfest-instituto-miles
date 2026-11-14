<script lang="ts">
	import type { Evolucao } from '#lib/data/paciente.js';
	import { PREFIXO_EXAME, examesLancados } from '#lib/prontuario.js';

	let { evolucao, analise = true }: { evolucao: Evolucao; analise?: boolean } = $props();

	const lancados = $derived(examesLancados(evolucao.texto));
</script>

<div class="space-y-3 p-3">
	<dl class="grid grid-cols-3 gap-3 text-xs">
		<div>
			<dt class="font-bold text-slate-700">Data/Hora</dt>
			<dd>{evolucao.data}</dd>
		</div>
		<div>
			<dt class="font-bold text-slate-700">Tipo</dt>
			<dd>{evolucao.tipo}</dd>
		</div>
		<div>
			<dt class="font-bold text-slate-700">Profissional</dt>
			<dd>{evolucao.autor}</dd>
		</div>
	</dl>

	<div class="border border-slate-300 bg-slate-50 p-3 text-[13px] leading-6 text-slate-800">
		{#each evolucao.texto.split('\n') as linha, i (i)}
			{#if analise && linha.startsWith(PREFIXO_EXAME)}
				<p class="font-mono text-xs leading-6 text-emerald-800">
					<span class="bg-emerald-100 px-1">{linha}</span>
				</p>
			{:else}
				<p>{linha || '\u00a0'}</p>
			{/if}
		{/each}
	</div>

	{#if analise}
		<div class="border border-emerald-300 bg-emerald-50 p-2 text-xs">
			<p class="mb-1 font-bold text-emerald-900">Enviados ao faturamento ({lancados.length})</p>
			{#each lancados as { exame } (exame.id)}
				<p class="text-emerald-900">
					{exame.nome} · <span class="font-mono">{exame.sigtap}</span>
				</p>
			{:else}
				<p class="text-emerald-800">Nenhum exame padronizado.</p>
			{/each}
		</div>
	{/if}
</div>
