<script lang="ts">
	import { textoAnamnese, type Anamnese } from '#lib/anamnese.js';
	import { PREFIXO_EXAME, examesLancados } from '#lib/prontuario.js';

	let { anamnese }: { anamnese: Anamnese } = $props();

	const texto = $derived(textoAnamnese(anamnese));
	const lancados = $derived(examesLancados(texto));
</script>

<aside class="flex w-full flex-col gap-3 lg:sticky lg:top-0 lg:w-80 lg:shrink-0">
	<section class="border border-slate-400 bg-white">
		<header
			class="flex items-center justify-between border-b border-slate-300 bg-[#e3e7eb] px-2 py-1.5"
		>
			<h2 class="text-xs font-bold text-slate-700 uppercase">Vai para o faturamento</h2>
			<span class="bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
				{anamnese.exames.length} procedimento(s)
			</span>
		</header>
		{#if lancados.length}
			<ul class="divide-y divide-slate-100">
				{#each lancados as { exame, quantidade } (exame.id)}
					<li class="flex items-center gap-2 px-2 py-1.5">
						<span class="size-2 shrink-0 bg-emerald-500" aria-hidden="true"></span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs text-slate-800">{exame.nome}</p>
							<p class="font-mono text-[11px] text-slate-500">SIGTAP {exame.sigtap}</p>
						</div>
						<span class="text-xs font-semibold text-slate-600">× {quantidade}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="px-2 py-3 text-xs text-slate-500">
				Adicione os exames realizados em <strong>Exames complementares</strong>.
			</p>
		{/if}
	</section>

	<details class="border border-slate-400 bg-white" open>
		<summary
			class="cursor-pointer border-b border-slate-300 bg-[#e3e7eb] px-2 py-1.5 text-xs font-bold text-slate-700 uppercase"
		>
			Texto gravado no prontuário
		</summary>
		<div class="max-h-72 overflow-y-auto p-2 text-[11px] leading-5 text-slate-700">
			{#if texto}
				{#each texto.split('\n') as linha, i (i)}
					<p class={linha.startsWith(PREFIXO_EXAME) ? 'font-mono text-emerald-800' : ''}>
						{linha}
					</p>
				{/each}
			{:else}
				<p class="text-slate-400">O texto aparece aqui conforme o preenchimento.</p>
			{/if}
		</div>
	</details>
</aside>
