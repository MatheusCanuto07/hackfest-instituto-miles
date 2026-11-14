<script lang="ts">
	import type { Achado } from '#lib/motor.js';

	interface Props {
		achado: Achado;
		selecionado?: boolean;
		selecionavel?: boolean;
		onalternar?: () => void;
	}

	let { achado, selecionado = false, selecionavel = false, onalternar }: Props = $props();

	const porcentagem = $derived(Math.round(achado.confianca * 100));
	const corConfianca = $derived(
		achado.confianca >= 0.85
			? 'bg-emerald-500'
			: achado.confianca >= 0.7
				? 'bg-amber-400'
				: 'bg-orange-500'
	);
</script>

<svelte:element
	this={selecionavel ? 'label' : 'div'}
	class={[
		'block rounded-lg border bg-white p-3 transition',
		selecionavel && 'cursor-pointer hover:border-sky-400',
		selecionado ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-slate-200'
	]}
>
	<div class="flex items-start gap-3">
		{#if selecionavel}
			<input
				type="checkbox"
				checked={selecionado}
				onchange={onalternar}
				class="mt-1 size-4 accent-emerald-600"
			/>
		{/if}
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
				<p class="font-semibold text-slate-900">{achado.exame.nome}</p>
				<span class="font-mono text-xs text-slate-500">SIGTAP {achado.exame.sigtap}</span>
			</div>
			<div class="mt-1 flex flex-wrap gap-1.5 text-xs">
				{#if achado.olho}
					<span class="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700"
						>Olho: {achado.olho}</span
					>
				{/if}
				<span class="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
					Quantidade: {achado.quantidade}
					{#if achado.quantidade > 1}(exame monocular, ambos os olhos){/if}
				</span>
			</div>
			<p class="mt-2 rounded bg-slate-50 px-2 py-1 text-sm text-slate-600 italic">
				“{achado.trecho}”
			</p>
			<div class="mt-2 flex items-center gap-2 text-xs text-slate-500">
				<span class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
					<span class={['block h-full', corConfianca]} style:width="{porcentagem}%"></span>
				</span>
				<span>Confiança {porcentagem}% · {achado.motivo}</span>
			</div>
		</div>
	</div>
</svelte:element>
