<script lang="ts">
	import { Bot, LoaderCircle, Play, Sparkles, X } from '@lucide/svelte';
	import CartaoAchado from './CartaoAchado.svelte';
	import TextoDestacado from './TextoDestacado.svelte';
	import { prestadores } from '#lib/data/faturamento.js';
	import { pacientes } from '#lib/data/paciente.js';
	import { analisarTexto, motor, type Achado } from '#lib/motor.js';
	import { agendarTarefa } from '#lib/robo.js';

	let { onfechar }: { onfechar: () => void } = $props();

	let pacienteId = $state(pacientes[0].id);
	let prestadorCodigo = $state<string | null>(prestadores[0].codigo);
	let texto = $state('');
	let processando = $state(false);
	let achados = $state<Achado[] | null>(null);
	let roboIniciado = $state(false);

	const realizados = $derived((achados ?? []).filter((a) => a.situacao === 'realizado'));

	async function processar() {
		processando = true;
		achados = await analisarTexto(texto);
		processando = false;
	}

	function comecarScraping() {
		agendarTarefa({
			pacienteId,
			prestadorCodigo,
			itens: realizados.map((a) => ({ exameId: a.exame.id, quantidade: a.quantidade }))
		});
		window.open('/atual/faturamento?robo=1', 'sistema-faturamento');
		roboIniciado = true;
	}
</script>

<div class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-6">
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="titulo-importar"
		class="w-full max-w-5xl rounded-xl bg-white shadow-2xl"
	>
		<header class="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
			<h2 id="titulo-importar" class="text-lg font-semibold text-slate-900">Importar prontuário</h2>
			{#if !motor.conectado}
				<span class="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
					Motor provisório: qualquer texto retorna 3 exames
				</span>
			{/if}
			<button
				type="button"
				aria-label="Fechar"
				onclick={onfechar}
				class="ml-auto rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
			>
				<X size={20} />
			</button>
		</header>

		<div class="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<section class="space-y-4">
				<div class="grid gap-3 sm:grid-cols-2">
					<label class="block text-sm text-slate-700">
						Atendimento (paciente)
						<select
							bind:value={pacienteId}
							class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
						>
							{#each pacientes as p (p.id)}
								<option value={p.id}>{p.atendimento} · {p.nome}</option>
							{/each}
						</select>
					</label>
					<label class="block text-sm text-slate-700">
						Médico (prestador)
						<select
							bind:value={prestadorCodigo}
							class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
						>
							{#each prestadores as p (p.codigo)}
								<option value={p.codigo}>{p.codigo} · {p.nome}</option>
							{/each}
						</select>
					</label>
				</div>

				{#if achados}
					<div class="rounded-lg border border-slate-200 p-4">
						<TextoDestacado {texto} {achados} />
					</div>
					<button
						type="button"
						onclick={() => {
							achados = null;
							roboIniciado = false;
						}}
						class="text-sm text-sky-700 hover:underline"
					>
						Editar o texto
					</button>
				{:else}
					<label class="block text-sm text-slate-700">
						Texto do prontuário
						<textarea
							rows="10"
							bind:value={texto}
							placeholder="Cole aqui o texto do prontuário, de qualquer sistema. Use apenas dados fictícios."
							class="mt-1 block w-full rounded-lg border border-slate-300 p-3 text-[15px] leading-7 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
						></textarea>
					</label>
					<button
						type="button"
						onclick={processar}
						disabled={!texto.trim() || processando}
						class="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-40"
					>
						{#if processando}
							<LoaderCircle size={16} class="animate-spin" /> Processando…
						{:else}
							<Sparkles size={16} /> Processar texto
						{/if}
					</button>
				{/if}
			</section>

			<section class="space-y-3">
				<h3 class="text-sm font-semibold text-slate-700">Exames realizados encontrados</h3>
				{#if achados}
					{#each realizados as achado (achado.exame.id)}
						<CartaoAchado {achado} />
					{:else}
						<p class="text-sm text-slate-500">Nenhum exame realizado encontrado.</p>
					{/each}

					{#if realizados.length}
						<button
							type="button"
							onclick={comecarScraping}
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
						>
							<Play size={16} /> Começar scraping
						</button>
						<p class="flex items-start gap-1.5 text-xs text-slate-500">
							<Bot size={14} class="mt-0.5 shrink-0" />
							Abre o sistema de faturamento em outra aba e um robô lança os {realizados.length}
							exames, um por um, como a faturista faria à mão.
						</p>
						{#if roboIniciado}
							<p class="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
								Robô iniciado na aba "Sistema de faturamento". Se a aba não abriu, permita pop-ups
								para este site.
							</p>
						{/if}
					{/if}
				{:else}
					<p class="text-sm text-slate-500">Cole o texto e clique em Processar.</p>
				{/if}
			</section>
		</div>
	</div>
</div>
