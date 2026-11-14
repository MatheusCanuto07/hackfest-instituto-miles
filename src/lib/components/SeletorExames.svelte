<script lang="ts">
	import { ChevronDown, Search } from '@lucide/svelte';
	import { CATEGORIAS, EXAMES, type Exame } from '#lib/data/exames.js';
	import { buscarExames } from '#lib/prontuario.js';

	let { onadicionar }: { onadicionar: (exame: Exame) => void } = $props();

	let busca = $state('');
	let aberto = $state(false);
	let destacado = $state(0);
	let lista = $state<HTMLUListElement>();

	const grupos = $derived(
		busca.trim()
			? [{ rotulo: 'Resultados', itens: buscarExames(busca, EXAMES.length) }]
			: [
					{ rotulo: 'Mais usados', itens: EXAMES.filter((e) => e.frequente) },
					...CATEGORIAS.map((c) => ({
						rotulo: c,
						itens: EXAMES.filter((e) => e.categoria === c && !e.frequente)
					}))
				].filter((g) => g.itens.length)
	);
	const opcoes = $derived(grupos.flatMap((g) => g.itens));
	const inicioDoGrupo = $derived(
		grupos.map((_, i) => grupos.slice(0, i).reduce((total, g) => total + g.itens.length, 0))
	);

	function abrir() {
		aberto = true;
	}

	function escolher(exame: Exame) {
		onadicionar(exame);
		busca = '';
		destacado = 0;
		aberto = false;
	}

	function mover(passo: number) {
		if (!opcoes.length) return;
		aberto = true;
		destacado = (destacado + passo + opcoes.length) % opcoes.length;
		lista?.querySelector(`[data-indice="${destacado}"]`)?.scrollIntoView({ block: 'nearest' });
	}

	function teclado(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			mover(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			mover(-1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (aberto && opcoes[destacado]) escolher(opcoes[destacado]);
			else abrir();
		} else if (e.key === 'Escape') {
			aberto = false;
		}
	}
</script>

<div class="relative">
	<label class="relative block">
		<span class="sr-only">Adicionar exame realizado</span>
		<Search
			size={14}
			class="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-slate-400"
		/>
		<input
			type="text"
			role="combobox"
			autocomplete="off"
			aria-expanded={aberto}
			aria-controls="opcoes-exames"
			aria-autocomplete="list"
			aria-activedescendant={aberto && opcoes[destacado]
				? `opcao-${opcoes[destacado].id}`
				: undefined}
			bind:value={busca}
			oninput={() => {
				destacado = 0;
				abrir();
			}}
			onclick={abrir}
			onfocus={abrir}
			onblur={() => (aberto = false)}
			onkeydown={teclado}
			placeholder="Digite para buscar o exame realizado (ex.: tono, oct, campo visual)…"
			class="h-8 w-full border border-slate-400 bg-white pr-8 pl-7 text-[13px] focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
		/>
		<ChevronDown
			size={16}
			class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-500"
		/>
	</label>

	{#if aberto}
		<ul
			bind:this={lista}
			id="opcoes-exames"
			role="listbox"
			aria-label="Exames oftalmológicos"
			class="absolute z-30 mt-0.5 max-h-80 w-full overflow-y-auto border border-slate-400 bg-white shadow-lg"
		>
			{#each grupos as grupo, g (grupo.rotulo)}
				<li
					role="presentation"
					class="sticky top-0 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
				>
					{grupo.rotulo}
				</li>
				{#each grupo.itens as exame, i (exame.id)}
					{@const indice = inicioDoGrupo[g] + i}
					<li
						id="opcao-{exame.id}"
						role="option"
						aria-selected={indice === destacado}
						data-indice={indice}
						onmousedown={(e) => {
							e.preventDefault();
							escolher(exame);
						}}
						onmouseenter={() => (destacado = indice)}
						class={[
							'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[13px]',
							indice === destacado ? 'bg-sky-100 text-sky-900' : 'text-slate-700'
						]}
					>
						<span class="min-w-0 flex-1 truncate">{exame.nome}</span>
						<span class="shrink-0 font-mono text-[11px] text-slate-400">{exame.sigtap}</span>
					</li>
				{/each}
			{:else}
				<li class="px-3 py-2 text-[13px] text-slate-500">
					Nenhum exame encontrado para “{busca}”.
				</li>
			{/each}
		</ul>
	{/if}
</div>
