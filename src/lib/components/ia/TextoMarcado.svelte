<script lang="ts">
	import type { ItemExtraido, Situacao } from '#lib/extracao.js';

	let { texto, itens }: { texto: string; itens: ItemExtraido[] } = $props();

	const COR: Record<Situacao, string> = {
		realizado: 'bg-emerald-100 text-emerald-900 decoration-emerald-500',
		solicitado: 'bg-sky-100 text-sky-900 decoration-sky-500',
		negado: 'bg-slate-200 text-slate-700 decoration-slate-500'
	};

	const partes = $derived.by(() => {
		const marcas = itens
			.map((item) => ({ inicio: texto.indexOf(item.trecho), item }))
			.filter((m) => m.inicio >= 0)
			.sort((a, b) => a.inicio - b.inicio);

		const resultado: { texto: string; situacao?: Situacao }[] = [];
		let cursor = 0;
		for (const { inicio, item } of marcas) {
			if (inicio < cursor) continue;
			resultado.push({ texto: texto.slice(cursor, inicio) });
			resultado.push({ texto: item.trecho, situacao: item.situacao });
			cursor = inicio + item.trecho.length;
		}
		resultado.push({ texto: texto.slice(cursor) });
		return resultado;
	});
</script>

<p class="text-[15px] leading-8 whitespace-pre-wrap text-slate-800">
	{#each partes as parte, i (i)}
		{#if parte.situacao}
			<mark
				class={['rounded px-0.5 underline decoration-2 underline-offset-4', COR[parte.situacao]]}
				>{parte.texto}</mark
			>
		{:else}{parte.texto}{/if}
	{/each}
</p>
