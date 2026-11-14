<script lang="ts">
	import { Search, X } from '@lucide/svelte';
	import { PROCEDIMENTOS } from '#lib/data/faturamento.js';
	import type { Exame } from '#lib/data/exames.js';
	import { normalizar } from '#lib/prontuario.js';

	let { onescolher, onfechar }: { onescolher: (p: Exame) => void; onfechar: () => void } = $props();

	let busca = $state('');

	// Como na tabela oficial: só encontra pelo nome do procedimento ou pelo código.
	const resultados = $derived.by(() => {
		const q = normalizar(busca.trim());
		const digitos = q.replace(/\D/g, '');
		if (!q) return PROCEDIMENTOS;
		return PROCEDIMENTOS.filter(
			(p) =>
				normalizar(p.nome).includes(q) ||
				(digitos.length >= 2 && p.sigtap.replace(/\D/g, '').includes(digitos))
		);
	});
</script>

<div
	class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30"
	role="presentation"
>
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="titulo-lov"
		class="w-[560px] border border-slate-500 bg-white shadow-xl"
	>
		<header class="flex items-center bg-[#1f3d63] px-3 py-1.5 text-white">
			<h2 id="titulo-lov" class="flex-1 text-xs font-semibold uppercase">
				Lista de valores · Procedimentos SIGTAP
			</h2>
			<button type="button" aria-label="Fechar" onclick={onfechar}><X size={16} /></button>
		</header>
		<div class="p-2">
			<label class="relative block">
				<span class="sr-only">Localizar procedimento</span>
				<input
					{@attach (no) => no.focus()}
					type="search"
					bind:value={busca}
					onkeydown={(e) => e.key === 'Escape' && onfechar()}
					placeholder="Localizar: nome oficial ou código"
					class="w-full border border-slate-400 py-1 pr-2 pl-7 text-xs focus:border-orange-400 focus:outline-none"
				/>
				<Search size={14} class="absolute top-1/2 left-2 -translate-y-1/2 text-slate-400" />
			</label>
			<div class="mt-2 h-72 overflow-y-auto border border-slate-300">
				<div
					class="sticky top-0 grid grid-cols-[6.5rem_1fr] bg-[#e3e7eb] text-left text-[11px] font-semibold"
				>
					<span class="px-2 py-1">Código</span>
					<span class="px-2 py-1">Descrição</span>
				</div>
				<ul class="text-[11px]">
					{#each resultados as p (p.id)}
						<li>
							<button
								type="button"
								onclick={() => onescolher(p)}
								class="grid w-full grid-cols-[6.5rem_1fr] border-t border-slate-100 text-left hover:bg-sky-100"
							>
								<span class="px-2 py-1 font-mono">{p.sigtap.replace(/\D/g, '')}</span>
								<span class="px-2 py-1 uppercase">{p.nome}</span>
							</button>
						</li>
					{:else}
						<li class="px-2 py-3 text-slate-500">Nenhum registro encontrado.</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
