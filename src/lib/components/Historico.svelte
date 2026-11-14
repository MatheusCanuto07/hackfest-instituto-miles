<script lang="ts">
	import { List, Search } from '@lucide/svelte';
	import type { Evolucao } from '#lib/data/paciente.js';
	import { examesLancados, normalizar } from '#lib/prontuario.js';

	interface Props {
		evolucoes: Evolucao[];
		selecionada: string | null;
		onselecionar: (id: string) => void;
		analise?: boolean;
	}

	let { evolucoes, selecionada, onselecionar, analise = true }: Props = $props();

	let busca = $state('');
	const filtradas = $derived(
		evolucoes.filter((e) =>
			normalizar(`${e.data} ${e.autor} ${e.tipo} ${e.texto}`).includes(normalizar(busca))
		)
	);
</script>

<aside class="hidden w-60 shrink-0 flex-col border-l border-slate-300 bg-white xl:flex">
	<header class="flex items-center justify-between px-3 pt-3 pb-2">
		<h2 class="text-sm text-slate-600">Histórico</h2>
		<List size={18} class="text-sky-700" />
	</header>
	<label class="relative mx-3 mb-2 block">
		<span class="sr-only">Buscar no histórico</span>
		<input
			type="search"
			bind:value={busca}
			class="w-full border border-slate-300 py-1 pr-2 pl-7 text-xs focus:border-orange-400 focus:outline-none"
		/>
		<Search size={14} class="absolute top-1/2 left-2 -translate-y-1/2 text-slate-400" />
	</label>

	<ul class="flex-1 overflow-y-auto">
		{#each filtradas as evolucao (evolucao.id)}
			<li>
				<button
					type="button"
					onclick={() => onselecionar(evolucao.id)}
					class={[
						'w-full border-b border-slate-100 px-3 py-2 text-left',
						selecionada === evolucao.id ? 'bg-sky-100' : 'hover:bg-slate-50'
					]}
				>
					<p class="text-xs font-semibold text-slate-500">{evolucao.data}</p>
					<p class="text-[11px] text-slate-700 uppercase">{evolucao.tipo}</p>
					<p class="text-[11px] text-slate-500 uppercase">{evolucao.autor}</p>
					{#if analise}
						{@const padronizados = examesLancados(evolucao.texto).length}
						{#if padronizados}
							<div class="mt-1 flex flex-wrap gap-1">
								<span class="bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-800">
									{padronizados} padronizado{padronizados > 1 ? 's' : ''}
								</span>
							</div>
						{/if}
					{/if}
				</button>
			</li>
		{:else}
			<li class="px-3 py-2 text-xs text-slate-500">Nada encontrado.</li>
		{/each}
	</ul>
</aside>
