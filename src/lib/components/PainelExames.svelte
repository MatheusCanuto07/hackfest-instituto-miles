<script lang="ts">
	import { CATEGORIAS, EXAMES, type Categoria, type Exame } from '#lib/data/exames.js';
	import { buscarExames, examesLancados } from '#lib/prontuario.js';

	interface Props {
		texto: string;
		oninserir: (exame: Exame) => void;
		onremover: (exame: Exame) => void;
	}

	let { texto, oninserir, onremover }: Props = $props();

	let busca = $state('');
	let categoria = $state<Categoria | 'Frequentes'>('Frequentes');

	const lancados = $derived(examesLancados(texto));
	const idsLancados = $derived(new Set(lancados.map((l) => l.exame.id)));

	const lista = $derived(
		busca.trim()
			? buscarExames(busca, 20)
			: categoria === 'Frequentes'
				? EXAMES.filter((e) => e.frequente)
				: EXAMES.filter((e) => e.categoria === categoria)
	);
</script>

<aside class="flex w-full flex-col gap-3 lg:w-80 lg:shrink-0">
	<section class="border border-slate-400 bg-white">
		<header
			class="flex items-center justify-between border-b border-slate-300 bg-[#e3e7eb] px-2 py-1.5"
		>
			<h2 class="text-xs font-bold text-slate-700 uppercase">Exames desta evolução</h2>
			<span class="bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
				{lancados.length} p/ faturamento
			</span>
		</header>
		{#if lancados.length}
			<ul class="divide-y divide-slate-100">
				{#each lancados as { exame, quantidade } (exame.id)}
					<li class="flex items-center gap-2 px-2 py-1.5">
						<span class="size-2 shrink-0 bg-emerald-500" aria-hidden="true"></span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs text-slate-800">
								{exame.nome}
								{#if quantidade > 1}<span class="text-slate-500">× {quantidade}</span>{/if}
							</p>
							<p class="font-mono text-[11px] text-slate-500">SIGTAP {exame.sigtap}</p>
						</div>
						<button
							type="button"
							onclick={() => onremover(exame)}
							class="px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-red-50 hover:text-red-700"
						>
							Remover
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="px-2 py-3 text-xs text-slate-500">
				Nenhum exame lançado. Use a lista abaixo ou digite <kbd
					class="border border-slate-300 bg-slate-50 px-1 font-mono">/</kbd
				> no texto.
			</p>
		{/if}
	</section>

	<section class="border border-slate-400 bg-white">
		<header class="border-b border-slate-300 bg-[#e3e7eb] px-2 py-1.5">
			<h2 class="text-xs font-bold text-slate-700 uppercase">Lançar exame</h2>
		</header>
		<div class="space-y-2 p-2">
			<label class="block">
				<span class="sr-only">Buscar exame</span>
				<input
					type="search"
					bind:value={busca}
					placeholder="Buscar exame ou atalho…"
					class="w-full border border-slate-300 px-2 py-1 text-xs focus:border-orange-400 focus:outline-none"
				/>
			</label>

			{#if !busca.trim()}
				<div class="flex flex-wrap gap-1" role="tablist" aria-label="Categorias">
					{#each ['Frequentes', ...CATEGORIAS] as const as c (c)}
						<button
							type="button"
							role="tab"
							aria-selected={categoria === c}
							onclick={() => (categoria = c)}
							class={[
								'border px-2 py-0.5 text-[11px]',
								categoria === c
									? 'border-[#3f6687] bg-[#3f6687] text-white'
									: 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
							]}
						>
							{c}
						</button>
					{/each}
				</div>
			{/if}

			<ul class="grid gap-1">
				{#each lista as exame (exame.id)}
					{@const lancado = idsLancados.has(exame.id)}
					<li class="min-w-0">
						<button
							type="button"
							onclick={() => oninserir(exame)}
							class={[
								'flex w-full items-center justify-between gap-2 border px-2 py-1.5 text-left text-xs',
								lancado
									? 'border-emerald-300 bg-emerald-50 text-emerald-900'
									: 'border-slate-200 text-slate-700 hover:border-sky-400 hover:bg-sky-50'
							]}
						>
							<span class="min-w-0 truncate">{lancado ? '✓ ' : '+ '}{exame.nome}</span>
							<span class="shrink-0 font-mono text-[11px] text-slate-400">/{exame.atalho}</span>
						</button>
					</li>
				{:else}
					<li class="text-xs text-slate-500">Nenhum exame encontrado.</li>
				{/each}
			</ul>
		</div>
	</section>
</aside>
