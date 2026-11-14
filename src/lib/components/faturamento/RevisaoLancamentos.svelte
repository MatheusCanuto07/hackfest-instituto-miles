<script lang="ts">
	import {
		CheckCheck,
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight,
		CircleCheck,
		CircleQuestionMark,
		FileText,
		Printer,
		RotateCcw,
		Save,
		Search,
		SkipForward,
		Undo2
	} from '@lucide/svelte';
	import { untrack } from 'svelte';
	import CapaAtendimento from './CapaAtendimento.svelte';
	import { COMPETENCIA, PROCEDIMENTOS, prestadores } from '#lib/data/faturamento.js';
	import { pacientes } from '#lib/data/paciente.js';
	import {
		ROTULO_STATUS,
		alertasDoPaciente,
		descartarAlerta,
		incluirAlerta,
		mudarStatus,
		revisao,
		salvarRevisao,
		type StatusLancamento
	} from '#lib/revisao.svelte.js';

	let { onaviso }: { onaviso: (mensagem: string) => void } = $props();

	const COR_STATUS: Record<StatusLancamento, string> = {
		pendente: 'bg-amber-100 text-amber-800 border-amber-300',
		aprovado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
		devolvido: 'bg-red-100 text-red-700 border-red-300'
	};

	const digitos = (s: string) => s.replace(/\D/g, '');
	const pendentesDe = (pacienteId: string) =>
		revisao.itens.filter((i) => i.pacienteId === pacienteId && i.status === 'pendente');

	let pacienteId = $state(
		untrack(() => pacientes.find((p) => pendentesDe(p.id).length)?.id ?? pacientes[0].id)
	);
	let linhaId = $state<string | null>(null);
	let devolvendo = $state(false);
	let motivo = $state('');
	const inicio = Date.now();
	let agoraMs = $state(Date.now());

	const posicaoPaciente = $derived(pacientes.findIndex((p) => p.id === pacienteId));
	const paciente = $derived(pacientes[posicaoPaciente]);
	const linhas = $derived(
		revisao.itens.filter((i) => i.pacienteId === pacienteId).sort((a, b) => a.numero - b.numero)
	);
	const indiceLinha = $derived(linhas.findIndex((l) => l.id === linhaId));
	const linha = $derived(linhas[indiceLinha] ?? null);
	const procedimento = $derived(PROCEDIMENTOS.find((p) => p.id === linha?.procedimentoId));
	const prestador = $derived(prestadores.find((p) => p.codigo === linha?.prestadorCodigo));

	const contagemPagina = $derived({
		pendente: linhas.filter((l) => l.status === 'pendente').length,
		aprovado: linhas.filter((l) => l.status === 'aprovado').length,
		devolvido: linhas.filter((l) => l.status === 'devolvido').length
	});
	const statusPagina = $derived.by((): StatusLancamento | null => {
		if (!linhas.length) return null;
		if (contagemPagina.pendente) return 'pendente';
		if (contagemPagina.devolvido) return 'devolvido';
		return 'aprovado';
	});
	const totalPendentes = $derived(revisao.itens.filter((i) => i.status === 'pendente').length);
	const pacientesPendentes = $derived(
		pacientes.filter((p) =>
			revisao.itens.some((i) => i.pacienteId === p.id && i.status === 'pendente')
		)
	);
	const alertas = $derived(alertasDoPaciente(pacienteId));
	const totalAlertas = $derived(revisao.alertas.filter((a) => a.status === 'pendente').length);

	const tempo = $derived.by(() => {
		const s = Math.floor((agoraMs - inicio) / 1000);
		return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
	});

	$effect(() => {
		const id = setInterval(() => (agoraMs = Date.now()), 1000);
		return () => clearInterval(id);
	});

	$effect(() => {
		if (indiceLinha === -1) linhaId = linhas[0]?.id ?? null;
	});

	function irPara(id: string) {
		pacienteId = id;
		devolvendo = false;
	}

	function irParaPosicao(posicao: number) {
		const alvo = pacientes[Math.max(0, Math.min(posicao, pacientes.length - 1))];
		if (alvo) irPara(alvo.id);
	}

	function proximoPendente() {
		const depois = [
			...pacientes.slice(posicaoPaciente + 1),
			...pacientes.slice(0, posicaoPaciente)
		];
		const alvo = depois.find((p) => pendentesDe(p.id).length);
		if (alvo) irPara(alvo.id);
		else onaviso('Não há outros pacientes com procedimentos pendentes de revisão.');
	}

	function aprovar() {
		if (!linha) return;
		mudarStatus([linha.id], 'aprovado');
		const proxima = linhas.find((l) => l.status === 'pendente');
		if (proxima) linhaId = proxima.id;
	}

	function aprovarPaciente() {
		const ids = linhas.filter((l) => l.status === 'pendente').map((l) => l.id);
		if (!ids.length) return;
		mudarStatus(ids, 'aprovado');
		onaviso(`${ids.length} procedimento(s) de ${paciente.nome} aprovado(s).`);
	}

	function devolver() {
		if (!linha || !motivo.trim()) return;
		mudarStatus([linha.id], 'devolvido', motivo.trim());
		onaviso('Procedimento devolvido ao médico.');
		devolvendo = false;
		motivo = '';
	}

	function reabrir() {
		if (linha) mudarStatus([linha.id], 'pendente');
	}

	const campo =
		'h-6 border border-slate-400 bg-white px-1.5 text-[11px] text-slate-900 focus:border-orange-400 focus:outline-none';
	const somenteLeitura =
		'h-6 border border-slate-300 bg-[#f3f5f7] px-1.5 text-[11px] leading-6 truncate';
	const rotulo = 'flex flex-col gap-0.5 text-[10px] text-slate-600';
	const botaoBarra = 'p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30';
</script>

<section class="flex h-full min-h-[640px] flex-col border border-slate-300 bg-white">
	<div class="flex items-center gap-0.5 border-b border-slate-300 bg-[#f3f5f7] px-2 py-1">
		<button type="button" title="Pesquisar" class={botaoBarra}><Search size={16} /></button>
		<button
			type="button"
			title="Salvar"
			onclick={() => {
				salvarRevisao();
				onaviso('Registros salvos com sucesso.');
			}}
			class={botaoBarra}
		>
			<Save size={16} />
		</button>
		<span class="mx-1 h-5 w-px bg-slate-300"></span>
		<button
			type="button"
			title="Primeiro paciente"
			disabled={posicaoPaciente <= 0}
			onclick={() => irParaPosicao(0)}
			class={botaoBarra}
		>
			<ChevronsLeft size={16} />
		</button>
		<button
			type="button"
			title="Paciente anterior"
			disabled={posicaoPaciente <= 0}
			onclick={() => irParaPosicao(posicaoPaciente - 1)}
			class={botaoBarra}
		>
			<ChevronLeft size={16} />
		</button>
		<button
			type="button"
			title="Próximo paciente"
			disabled={posicaoPaciente >= pacientes.length - 1}
			onclick={() => irParaPosicao(posicaoPaciente + 1)}
			class={botaoBarra}
		>
			<ChevronRight size={16} />
		</button>
		<button
			type="button"
			title="Último paciente"
			disabled={posicaoPaciente >= pacientes.length - 1}
			onclick={() => irParaPosicao(pacientes.length - 1)}
			class={botaoBarra}
		>
			<ChevronsRight size={16} />
		</button>
		<span class="mx-1 h-5 w-px bg-slate-300"></span>
		<button
			type="button"
			onclick={aprovarPaciente}
			disabled={!contagemPagina.pendente}
			class="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-30"
		>
			<CheckCheck size={16} /> Aprovar todos deste paciente ({contagemPagina.pendente})
		</button>
		<button
			type="button"
			onclick={proximoPendente}
			class="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-200"
		>
			<SkipForward size={16} /> Próximo paciente pendente
		</button>
		<div class="ml-auto flex items-center gap-0.5">
			<button type="button" title="Imprimir" disabled class={botaoBarra}>
				<Printer size={16} />
			</button>
			<button type="button" title="Ajuda" class={botaoBarra}>
				<CircleQuestionMark size={16} />
			</button>
		</div>
	</div>

	<div class="flex flex-wrap items-end gap-3 border-b border-slate-200 px-3 py-2">
		<span class={rotulo}>
			Fatura
			<span class="flex gap-1">
				<span class={[somenteLeitura, 'w-12']}>541</span>
				<span class={[somenteLeitura, 'w-56']}>FATURA SUS {COMPETENCIA} · BPA</span>
			</span>
		</span>
		<span class={rotulo}>
			Remessa
			<span class={[somenteLeitura, 'w-16']}>1747</span>
		</span>
		<span
			class="ml-auto border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800"
		>
			Fatura: {totalPendentes} procedimento(s) pendente(s) de revisão em {pacientesPendentes.length}
			paciente(s)
			{#if totalAlertas}
				· {totalAlertas} alerta(s) de citação
			{/if}
		</span>
	</div>

	<CapaAtendimento {paciente} onir={irPara}>
		{#snippet extra()}
			{#if statusPagina}
				<span
					class={['border px-2 py-0.5 text-[10px] font-bold uppercase', COR_STATUS[statusPagina]]}
				>
					Atendimento: {ROTULO_STATUS[statusPagina]}
				</span>
			{:else}
				<span
					class="border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase"
				>
					Sem procedimentos do prontuário
				</span>
			{/if}
		{/snippet}
	</CapaAtendimento>

	{#if alertas.length}
		<section class="mx-3 mt-2 border border-amber-400 bg-amber-50">
			<header class="border-b border-amber-300 bg-amber-100 px-2 py-1.5">
				<h2 class="text-[11px] font-bold text-amber-950">
					Possível exame no prontuário sem lançamento
					<span class="ml-1 border border-amber-400 bg-amber-200 px-1.5 text-[10px] font-bold">
						{alertas.length}
					</span>
				</h2>
				<p class="text-[11px] text-amber-800">
					Médico citou no texto e não colocou na lista de exames complementares
				</p>
			</header>
			<ul class="divide-y divide-amber-200">
				{#each alertas as alerta (alerta.id)}
					<li class="flex flex-wrap items-start gap-2 px-2 py-1.5">
						<span
							class="border border-amber-400 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 uppercase"
						>
							{alerta.categoria}
						</span>
						<div class="min-w-0 flex-1">
							<p class="text-[11px] font-semibold text-amber-950">
								{alerta.exameNome}
								<span class="font-mono font-normal text-slate-600">· SIGTAP {alerta.sigtap}</span>
							</p>
							<p class="text-[11px] text-amber-900">“{alerta.trecho}”</p>
							<p class="text-[10px] text-slate-600">{alerta.autor} · {alerta.data}</p>
						</div>
						<div class="flex flex-wrap gap-1">
							<button
								type="button"
								onclick={() => {
									incluirAlerta(alerta.id);
									onaviso(`Procedimento incluído: ${alerta.exameNome}.`);
								}}
								class="border border-emerald-600 bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
							>
								Incluir procedimento
							</button>
							<button
								type="button"
								onclick={() => descartarAlerta(alerta.id)}
								class="border border-slate-400 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
							>
								Descartar
							</button>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<div class="flex items-center gap-3 px-3 pt-2 text-[11px]">
		<span class="-mb-px border border-slate-300 border-b-white bg-white px-3 py-1 font-semibold">
			Procedimentos ({linhas.length})
		</span>
		<span class="text-amber-800">{contagemPagina.pendente} pendente(s)</span>
		<span class="text-emerald-800">{contagemPagina.aprovado} aprovado(s)</span>
		<span class="text-red-700">{contagemPagina.devolvido} devolvido(s)</span>
	</div>

	<div class="mx-3 flex min-h-36 flex-1 flex-col border border-slate-300">
		<div class="min-h-0 flex-1 overflow-y-scroll">
			<table class="w-full text-[11px] whitespace-nowrap">
				<thead class="sticky top-0 bg-[#e3e7eb] text-left text-slate-700">
					<tr>
						{#each ['Seq.', 'Status', 'Procedimento', 'Descrição', 'Tipo', 'Data', 'Qtde.', 'CID', 'Prest.', 'CBO'] as coluna (coluna)}
							<th class="border-r border-slate-300 px-2 py-1 font-semibold">{coluna}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each linhas as l, i (l.id)}
						{@const proc = PROCEDIMENTOS.find((x) => x.id === l.procedimentoId)}
						{@const prest = prestadores.find((x) => x.codigo === l.prestadorCodigo)}
						<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
						<tr
							onclick={() => {
								linhaId = l.id;
								devolvendo = false;
							}}
							class={[
								'cursor-default border-b border-slate-200',
								l.id === linhaId ? 'bg-[#8fb6e3] text-slate-900' : 'hover:bg-slate-50'
							]}
						>
							<td class="px-2 py-px leading-4">{i + 1}</td>
							<td class="px-2 py-px leading-4">
								<span
									class={['border px-1 text-[10px] font-semibold uppercase', COR_STATUS[l.status]]}
								>
									{ROTULO_STATUS[l.status]}
								</span>
							</td>
							<td class="px-2 py-px font-mono leading-4">{proc ? digitos(proc.sigtap) : ''}</td>
							<td class="max-w-64 truncate px-2 py-px leading-4 uppercase">{proc?.nome}</td>
							<td class="px-2 py-px leading-4"
								>{proc?.categoria === 'Consulta' ? 'Consulta' : 'Exame'}</td
							>
							<td class="px-2 py-px leading-4">{l.data}</td>
							<td class="px-2 py-px text-right leading-4">{l.quantidade}</td>
							<td class="px-2 py-px leading-4">{l.cid}</td>
							<td class="px-2 py-px leading-4">{l.prestadorCodigo ?? ''}</td>
							<td class="px-2 py-px leading-4">{prest?.cbo ?? ''}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="10" class="px-3 py-6 text-center text-slate-500">
								Nenhum procedimento gerado pelo prontuário para este paciente ainda. Quando o médico
								assinar o registro, a consulta e os exames aparecem aqui como pendentes de revisão.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	{#if linha}
		<div class="mx-3 my-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<div class="grid content-start gap-2 border border-slate-300 p-3">
				<p class="text-[10px] font-semibold text-slate-500 uppercase">
					Procedimento selecionado ({indiceLinha + 1} de {linhas.length})
				</p>
				<div class="flex flex-wrap items-end gap-2">
					<span class={rotulo}>
						Procedimento
						<span class={[somenteLeitura, 'w-24 font-mono']}>
							{digitos(procedimento?.sigtap ?? '')}
						</span>
					</span>
					<span class={rotulo}>
						Descrição
						<span class={[somenteLeitura, 'w-72 uppercase']}>{procedimento?.nome}</span>
					</span>
					<label class={rotulo}>
						Qtde.
						<input
							type="number"
							min="1"
							bind:value={linha.quantidade}
							onchange={salvarRevisao}
							class={[campo, 'w-14 text-right']}
						/>
					</label>
				</div>
				<div class="flex flex-wrap items-end gap-2">
					<label class={rotulo}>
						Prestador
						<select
							bind:value={linha.prestadorCodigo}
							onchange={salvarRevisao}
							class={[campo, 'w-52']}
						>
							<option value={null}></option>
							{#each prestadores as p (p.codigo)}
								<option value={p.codigo}>{p.codigo} · {p.nome}</option>
							{/each}
						</select>
					</label>
					<span class={rotulo}>
						CBO
						<span class={[somenteLeitura, 'w-44 uppercase']}>
							{prestador ? `${prestador.cbo} ${prestador.cboDescricao}` : ''}
						</span>
					</span>
					<label class={rotulo}>
						CID
						<input
							bind:value={linha.cid}
							onchange={salvarRevisao}
							class={[campo, 'w-16 uppercase']}
						/>
					</label>
					<span class={rotulo}>
						Data
						<span class={[somenteLeitura, 'w-24']}>{linha.data}</span>
					</span>
				</div>
			</div>

			<div class="flex flex-col gap-2 border border-slate-300 p-3">
				<div class="flex items-center gap-2">
					<FileText size={14} class="text-sky-700" />
					<p class="text-[10px] font-semibold text-slate-500 uppercase">Origem no prontuário</p>
					<span
						class={[
							'ml-auto border px-1.5 text-[10px] font-semibold uppercase',
							COR_STATUS[linha.status]
						]}
					>
						{ROTULO_STATUS[linha.status]}
					</span>
				</div>
				<p class="text-[11px] text-slate-600">
					{linha.origem.tipo} · {linha.origem.data} · {linha.origem.autor}
				</p>
				{#if linha.origem.fonte === 'analise'}
					<p class="border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] text-sky-900">
						Identificado no texto pelo assistente · confiança
						<strong>{Math.round((linha.origem.confianca ?? 0) * 100)}%</strong>
						{#if linha.origem.motivo}· {linha.origem.motivo}{/if}
					</p>
				{/if}
				<div class="space-y-0.5 border border-emerald-200 bg-emerald-50 p-2">
					{#each linha.origem.linhas as texto, i (i)}
						<p class="font-mono text-[11px] break-words text-emerald-900">{texto}</p>
					{/each}
				</div>

				{#if linha.status === 'devolvido' && linha.motivo}
					<p class="border border-red-200 bg-red-50 p-2 text-[11px] text-red-800">
						<strong>Motivo da devolução:</strong>
						{linha.motivo}
					</p>
				{/if}

				{#if devolvendo}
					<label class="text-[11px] text-slate-700">
						Motivo da devolução ao médico
						<textarea
							rows="2"
							bind:value={motivo}
							placeholder="Ex.: confirmar se o exame foi realizado ou apenas solicitado."
							class="mt-1 block w-full border border-slate-400 p-1.5 text-[11px] focus:border-orange-400 focus:outline-none"
						></textarea>
					</label>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={devolver}
							disabled={!motivo.trim()}
							class="bg-red-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-800 disabled:opacity-40"
						>
							Confirmar devolução
						</button>
						<button
							type="button"
							onclick={() => (devolvendo = false)}
							class="border border-slate-400 px-3 py-1.5 text-[11px] hover:bg-slate-100"
						>
							Cancelar
						</button>
					</div>
				{:else}
					<div class="mt-auto flex flex-wrap gap-2">
						{#if linha.status !== 'aprovado'}
							<button
								type="button"
								onclick={aprovar}
								class="flex items-center gap-1.5 bg-emerald-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-800"
							>
								<CircleCheck size={14} /> Aprovar
							</button>
						{/if}
						{#if linha.status !== 'devolvido'}
							<button
								type="button"
								onclick={() => (devolvendo = true)}
								class="flex items-center gap-1.5 border border-red-400 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-50"
							>
								<Undo2 size={14} /> Devolver ao médico
							</button>
						{/if}
						{#if linha.status !== 'pendente'}
							<button
								type="button"
								onclick={reabrir}
								class="flex items-center gap-1.5 border border-slate-400 px-3 py-1.5 text-[11px] hover:bg-slate-100"
							>
								<RotateCcw size={14} /> Voltar para revisão
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div
		class="mt-auto flex items-center gap-4 border-t border-slate-300 bg-[#f3f5f7] px-3 py-1 text-[11px] text-slate-600"
	>
		<span>Paciente {posicaoPaciente + 1}/{pacientes.length}</span>
		<span>Procedimento {indiceLinha + 1}/{linhas.length}</span>
		<span>Tempo de revisão: <span class="font-mono">{tempo}</span></span>
		<span class="ml-auto">Procedimentos gerados automaticamente a partir do prontuário</span>
	</div>
</section>
