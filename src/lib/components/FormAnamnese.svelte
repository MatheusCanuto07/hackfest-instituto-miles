<script lang="ts">
	import { Check, Copy, X } from '@lucide/svelte';
	import { tick } from 'svelte';
	import SeletorExames from './SeletorExames.svelte';
	import { anamneseParaCopiar, type Anamnese, type ContextoAnamnese } from '#lib/anamnese.js';
	import { EXAMES, type Exame } from '#lib/data/exames.js';

	interface Props {
		anamnese: Anamnese;
		contexto: ContextoAnamnese;
		/** Mostra a seção de Exames complementares (só na nossa solução). */
		comExames?: boolean;
	}

	let { anamnese = $bindable(), contexto, comExames = true }: Props = $props();

	let copiado = $state<'ok' | 'erro' | null>(null);

	async function copiar() {
		const texto = anamneseParaCopiar(anamnese, contexto, comExames);
		try {
			await navigator.clipboard.writeText(texto);
			copiado = 'ok';
		} catch {
			copiado = 'erro';
		}
		setTimeout(() => (copiado = null), 2500);
	}

	export async function adicionarExame(exame: Exame) {
		const uid = crypto.randomUUID();
		anamnese.exames.push({ uid, exameId: exame.id, detalhes: '' });
		await tick();
		document.getElementById(`detalhes-${uid}`)?.focus();
	}

	function removerExame(uid: string) {
		anamnese.exames = anamnese.exames.filter((e) => e.uid !== uid);
	}

	const area =
		'block w-full resize-y border border-slate-400 bg-white p-2 text-[13px] leading-6 text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none';
	const titulo = 'mb-1 block text-xs font-bold underline';
</script>

<div class="min-w-0 flex-1 border border-slate-700 bg-white">
	<div class="relative flex items-center border-b border-slate-700 px-3 py-2">
		<h2 class="flex-1 text-center text-[15px] font-bold">ANAMNESE</h2>
		<button
			type="button"
			onclick={copiar}
			title="Copia todos os campos da anamnese, formatados, para colar em outro lugar"
			class={[
				'absolute right-3 flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold',
				copiado === 'ok'
					? 'border-emerald-500 bg-emerald-50 text-emerald-800'
					: copiado === 'erro'
						? 'border-red-400 bg-red-50 text-red-700'
						: 'border-slate-400 bg-[#e3e7eb] text-slate-700 hover:bg-[#d8dde2]'
			]}
		>
			{#if copiado === 'ok'}
				<Check size={14} /> Copiado!
			{:else if copiado === 'erro'}
				Não foi possível copiar
			{:else}
				<Copy size={14} /> Copiar anamnese
			{/if}
		</button>
	</div>

	<div class="border-b border-slate-700 px-3 py-2">
		<label for="qp" class={titulo}>Queixa atual:</label>
		<textarea id="qp" rows="2" bind:value={anamnese.qp} class={area}></textarea>
	</div>

	<div class={['px-3 py-2', comExames && 'border-b border-slate-700']}>
		<label for="hma" class={titulo}>História da moléstia atual (HMA):</label>
		<textarea id="hma" rows={comExames ? 6 : 14} bind:value={anamnese.hma} class={area}></textarea>
	</div>

	{#if comExames}
		<section class="bg-sky-50/40 px-3 py-2" aria-labelledby="titulo-exames">
			<div class="mb-1 flex items-center gap-2">
				<h3 id="titulo-exames" class="text-xs font-bold underline">Exames complementares:</h3>
				<span class="text-[11px] text-slate-500">
					{anamnese.exames.length
						? `${anamnese.exames.length} exame(s) realizado(s)`
						: 'Nenhum exame adicionado'}
				</span>
			</div>

			{#if anamnese.exames.length}
				<ol class="mb-2 space-y-2">
					{#each anamnese.exames as realizado, i (realizado.uid)}
						{@const exame = EXAMES.find((e) => e.id === realizado.exameId)}
						<li class="relative border border-slate-300 bg-white p-2">
							<div class="mb-1 flex items-center gap-2">
								<span class="text-[11px] font-semibold text-slate-400">{i + 1}.</span>
								<span class="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">
									{exame?.nome}
								</span>
								<span class="font-mono text-[11px] text-emerald-700">SIGTAP {exame?.sigtap}</span>
								<button
									type="button"
									aria-label="Remover {exame?.nome}"
									onclick={() => removerExame(realizado.uid)}
									class="p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-700"
								>
									<X size={14} />
								</button>
							</div>
							<label class="sr-only" for="detalhes-{realizado.uid}">
								Detalhes de {exame?.nome}
							</label>
							<textarea
								id="detalhes-{realizado.uid}"
								rows="2"
								bind:value={realizado.detalhes}
								placeholder="Detalhes do exame: resultado, achados, observações…"
								class={area}></textarea>
						</li>
					{/each}
				</ol>
			{/if}

			<SeletorExames onadicionar={adicionarExame} />
		</section>
	{/if}
</div>
