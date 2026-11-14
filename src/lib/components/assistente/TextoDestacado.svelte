<script lang="ts">
	import type { Achado, Situacao } from '#lib/motor.js';

	let { texto, achados }: { texto: string; achados: Achado[] } = $props();

	const COR: Record<Situacao, string> = {
		realizado: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
		solicitado: 'bg-sky-100 text-sky-900 ring-sky-300',
		negado: 'bg-slate-200 text-slate-600 line-through ring-slate-300'
	};

	const partes = $derived.by(() => {
		const marcas = achados
			.flatMap((a) => a.mencoes.map((m) => ({ ...m, situacao: a.situacao, nome: a.exame.nome })))
			.sort((a, b) => a.inicio - b.inicio);
		const resultado: { texto: string; situacao?: Situacao; nome?: string }[] = [];
		let cursor = 0;
		for (const m of marcas) {
			if (m.inicio < cursor) continue;
			if (m.inicio > cursor) resultado.push({ texto: texto.slice(cursor, m.inicio) });
			resultado.push({ texto: texto.slice(m.inicio, m.fim), situacao: m.situacao, nome: m.nome });
			cursor = m.fim;
		}
		resultado.push({ texto: texto.slice(cursor) });
		return resultado;
	});
</script>

<p class="text-[15px] leading-8 whitespace-pre-line text-slate-800">
	{#each partes as parte, i (i)}
		{#if parte.situacao}
			<mark
				title="{parte.nome} · {parte.situacao}"
				class={['rounded px-1 py-0.5 ring-1', COR[parte.situacao]]}>{parte.texto}</mark
			>
		{:else}
			{parte.texto}
		{/if}
	{/each}
</p>
