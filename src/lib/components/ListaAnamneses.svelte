<script lang="ts">
	import { Check, Copy, FilePlus, Search } from '@lucide/svelte';
	import type { Cenario } from './BarraSuperior.svelte';
	import { anamneseParaCopiar } from '#lib/anamnese.js';
	import { EXAMES } from '#lib/data/exames.js';
	import { pacientes, profissional, type Evolucao } from '#lib/data/paciente.js';
	import { evolucoes } from '#lib/evolucoes.svelte.js';
	import { normalizar } from '#lib/prontuario.js';
	import {
		ROTULO_STATUS,
		registrosDaEvolucao,
		type StatusLancamento
	} from '#lib/revisao.svelte.js';

	let { cenario, onnova }: { cenario: Cenario; onnova: () => void } = $props();

	const solucao = $derived(cenario === 'solucao');
	const COR_STATUS: Record<StatusLancamento, string> = {
		pendente: 'border-amber-300 bg-amber-50 text-amber-800',
		aprovado: 'border-emerald-300 bg-emerald-50 text-emerald-800',
		devolvido: 'border-red-300 bg-red-50 text-red-700'
	};

	let busca = $state('');
	let selecionadaId = $state<string | null>(null);
	let copiado = $state(false);

	const minhas = $derived(
		evolucoes.filter(
			(e) => e.tipo === 'Anamnese' && e.autor === profissional.nome && e.cenario === cenario
		)
	);
	const filtradas = $derived(
		minhas.filter((e) => {
			const p = pacientes.find((x) => x.id === e.pacienteId);
			return normalizar(`${p?.nome} ${p?.prontuario} ${e.data} ${e.texto}`).includes(
				normalizar(busca)
			);
		})
	);
	const selecionada = $derived(
		filtradas.find((e) => e.id === selecionadaId) ?? filtradas[0] ?? null
	);
	const paciente = $derived(pacientes.find((p) => p.id === selecionada?.pacienteId));
	const registros = $derived(selecionada ? registrosDaEvolucao(selecionada.id) : []);
	const registroConsulta = $derived(
		registros.find((r) => r.procedimentoId === 'consulta-especializada')
	);
	const registrosExames = $derived(
		registros.filter((r) => r.procedimentoId !== 'consulta-especializada')
	);

	function contagem(e: Evolucao) {
		const lista = registrosDaEvolucao(e.id);
		return {
			pendente: lista.filter((r) => r.status === 'pendente').length,
			aprovado: lista.filter((r) => r.status === 'aprovado').length,
			devolvido: lista.filter((r) => r.status === 'devolvido').length
		};
	}

	async function copiar() {
		if (!selecionada?.anamnese || !paciente) return;
		await navigator.clipboard.writeText(
			anamneseParaCopiar(
				selecionada.anamnese,
				{
					paciente: paciente.nome,
					prontuario: paciente.prontuario,
					atendimento: paciente.atendimento,
					medico: `${selecionada.autor} (${profissional.registro})`,
					dataHora: selecionada.data
				},
				solucao
			)
		);
		copiado = true;
		setTimeout(() => (copiado = false), 2500);
	}

	const secao = 'border-b border-slate-700 px-3 py-2';
	const titulo = 'mb-1 text-xs font-bold underline';
</script>

<div class="flex min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row">
	<aside class="flex w-full flex-col border border-slate-400 bg-white lg:w-80 lg:shrink-0">
		<header class="border-b border-slate-300 bg-[#e3e7eb] px-3 py-2">
			<h2 class="text-xs font-bold text-slate-700 uppercase">Minhas anamneses ({minhas.length})</h2>
			<p class="text-[11px] text-slate-500">{profissional.nome} · {profissional.registro}</p>
		</header>
		<label class="relative m-2 block">
			<span class="sr-only">Buscar anamnese</span>
			<input
				type="search"
				bind:value={busca}
				placeholder="Buscar por paciente, data ou texto…"
				class="w-full border border-slate-300 py-1 pr-2 pl-7 text-xs focus:border-orange-400 focus:outline-none"
			/>
			<Search size={14} class="absolute top-1/2 left-2 -translate-y-1/2 text-slate-400" />
		</label>
		<ul class="min-h-0 flex-1 overflow-y-auto">
			{#each filtradas as e (e.id)}
				{@const p = pacientes.find((x) => x.id === e.pacienteId)}
				{@const c = contagem(e)}
				<li>
					<button
						type="button"
						onclick={() => (selecionadaId = e.id)}
						class={[
							'w-full border-b border-slate-100 px-3 py-2 text-left',
							e.id === selecionada?.id ? 'bg-sky-100' : 'hover:bg-slate-50'
						]}
					>
						<p class="text-xs font-semibold text-slate-500">{e.data}</p>
						<p class="truncate text-[11px] font-semibold text-slate-800 uppercase">{p?.nome}</p>
						<p class="text-[11px] text-slate-500">
							{e.anamnese?.exames.length ?? 0} exame(s) complementar(es)
						</p>
						{#if solucao}
							<div class="mt-1 flex flex-wrap gap-1 text-[10px] font-semibold">
								{#if c.pendente}<span class="bg-amber-100 px-1.5 text-amber-800"
										>{c.pendente} pendente(s)</span
									>{/if}
								{#if c.aprovado}<span class="bg-emerald-100 px-1.5 text-emerald-800"
										>{c.aprovado} aprovado(s)</span
									>{/if}
								{#if c.devolvido}<span class="bg-red-100 px-1.5 text-red-700"
										>{c.devolvido} devolvido(s)</span
									>{/if}
							</div>
						{/if}
					</button>
				</li>
			{:else}
				<li class="px-3 py-4 text-xs text-slate-500">
					{minhas.length ? 'Nada encontrado.' : 'Nenhuma anamnese assinada ainda.'}
				</li>
			{/each}
		</ul>
		<button
			type="button"
			onclick={onnova}
			class="m-2 flex items-center justify-center gap-1.5 bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-800"
		>
			<FilePlus size={14} /> Nova anamnese
		</button>
	</aside>

	<section class="min-w-0 flex-1 overflow-y-auto">
		{#if selecionada && paciente}
			<div class="border border-slate-700 bg-white">
				<div class="relative flex items-center border-b border-slate-700 px-3 py-2">
					<h2 class="flex-1 text-center text-[15px] font-bold">ANAMNESE · VISUALIZAÇÃO</h2>
					{#if selecionada.anamnese}
						<button
							type="button"
							onclick={copiar}
							class={[
								'absolute right-3 flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold',
								copiado
									? 'border-emerald-500 bg-emerald-50 text-emerald-800'
									: 'border-slate-400 bg-[#e3e7eb] text-slate-700 hover:bg-[#d8dde2]'
							]}
						>
							{#if copiado}<Check size={14} /> Copiado!{:else}<Copy size={14} /> Copiar anamnese{/if}
						</button>
					{/if}
				</div>

				<dl
					class="grid grid-cols-2 gap-x-6 gap-y-1 border-b border-slate-700 px-3 py-2 text-xs sm:grid-cols-4"
				>
					<div>
						<dt class="font-bold">Paciente</dt>
						<dd class="uppercase">{paciente.nome}</dd>
					</div>
					<div>
						<dt class="font-bold">Prontuário</dt>
						<dd>{paciente.prontuario}</dd>
					</div>
					<div>
						<dt class="font-bold">Data/hora</dt>
						<dd>{selecionada.data}</dd>
					</div>
					<div>
						<dt class="font-bold">Médico</dt>
						<dd>{selecionada.autor}</dd>
					</div>
				</dl>

				{#if selecionada.anamnese}
					<div class={secao}>
						<p class={titulo}>Queixa atual:</p>
						<p class="text-[13px] leading-6 whitespace-pre-line">
							{selecionada.anamnese.qp || '(não preenchido)'}
						</p>
					</div>
					<div class={[secao, !solucao && 'border-b-0']}>
						<p class={titulo}>História da moléstia atual (HMA):</p>
						<p class="text-[13px] leading-6 whitespace-pre-line">
							{selecionada.anamnese.hma || '(não preenchido)'}
						</p>
					</div>

					{#if solucao}
						<div class="px-3 py-2">
							<p class={titulo}>Exames complementares ({selecionada.anamnese.exames.length}):</p>
							{#if selecionada.anamnese.exames.length}
								<table class="mt-1 w-full border border-slate-300 text-xs">
									<thead class="bg-[#e3e7eb] text-left">
										<tr>
											<th class="px-2 py-1">#</th>
											<th class="px-2 py-1">Exame</th>
											<th class="px-2 py-1">SIGTAP</th>
											<th class="px-2 py-1">Detalhes</th>
											<th class="px-2 py-1">Faturamento</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-slate-200">
										{#each selecionada.anamnese.exames as realizado, i (realizado.uid)}
											{@const exame = EXAMES.find((x) => x.id === realizado.exameId)}
											{@const registro = registrosExames[i]}
											<tr class="align-top">
												<td class="px-2 py-1">{i + 1}</td>
												<td class="px-2 py-1 font-semibold">{exame?.nome}</td>
												<td class="px-2 py-1 font-mono whitespace-nowrap">{exame?.sigtap}</td>
												<td class="px-2 py-1">{realizado.detalhes || '—'}</td>
												<td class="px-2 py-1">
													{#if registro}
														<span
															class={[
																'border px-1.5 text-[10px] font-semibold uppercase',
																COR_STATUS[registro.status]
															]}
														>
															{ROTULO_STATUS[registro.status]}
														</span>
														{#if registro.status === 'devolvido' && registro.motivo}
															<p class="mt-1 text-[11px] text-red-700">Motivo: {registro.motivo}</p>
														{/if}
													{:else}
														<span class="text-slate-400">—</span>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{:else}
								<p class="text-[13px] text-slate-500">Nenhum exame lançado.</p>
							{/if}
							{#if registroConsulta}
								<p class="mt-2 text-xs text-slate-600">
									Consulta no faturamento:
									<span
										class={[
											'border px-1.5 text-[10px] font-semibold uppercase',
											COR_STATUS[registroConsulta.status]
										]}
									>
										{ROTULO_STATUS[registroConsulta.status]}
									</span>
								</p>
							{/if}
						</div>
					{/if}
				{:else}
					<div class="px-3 py-2 text-[13px] leading-6 whitespace-pre-line">{selecionada.texto}</div>
				{/if}
			</div>
		{:else}
			<div class="border border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
				Assine uma anamnese na tela de atendimento para ela aparecer aqui.
			</div>
		{/if}
	</section>
</div>
