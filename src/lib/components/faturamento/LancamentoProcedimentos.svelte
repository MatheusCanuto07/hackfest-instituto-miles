<script lang="ts">
	import {
		Bot,
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight,
		CircleQuestionMark,
		Ellipsis,
		FileOutput,
		FolderSearch,
		Funnel,
		Plus,
		Printer,
		Save,
		Search,
		Trash2
	} from '@lucide/svelte';
	import { tick } from 'svelte';
	import CapaAtendimento from './CapaAtendimento.svelte';
	import ListaProcedimentos from './ListaProcedimentos.svelte';
	import type { Exame } from '#lib/data/exames.js';
	import type { TarefaRobo } from '#lib/robo.js';
	import { COMPETENCIA, PROCEDIMENTOS, prestadores } from '#lib/data/faturamento.js';
	import { pacientes } from '#lib/data/paciente.js';
	import { evolucoes } from '#lib/evolucoes.svelte.js';
	import {
		excluirLancamento,
		haAlteracoes,
		lancadosDoPaciente,
		lancamentos,
		novoLancamento,
		salvarLancamentos
	} from '#lib/lancamentos.svelte.js';

	interface Props {
		pacienteId: string;
		onabrirProntuario: () => void;
		onaviso: (mensagem: string) => void;
	}

	let { pacienteId = $bindable(), onabrirProntuario, onaviso }: Props = $props();

	const digitos = (s: string) => s.replace(/\D/g, '');

	let linhaId = $state<string | null>(null);
	let aba = $state<'Procedimentos' | 'Críticas'>('Procedimentos');
	let lovAberto = $state(false);
	let codigoDigitado = $state('');
	let erroCodigo = $state(false);
	let campoCodigo = $state<HTMLInputElement>();
	const inicio = Date.now();
	let agoraMs = $state(Date.now());

	const alterado = $derived(haAlteracoes());
	const posicaoPaciente = $derived(pacientes.findIndex((p) => p.id === pacienteId));
	const paciente = $derived(pacientes[posicaoPaciente]);
	const linhas = $derived(
		lancamentos.filter((l) => l.pacienteId === pacienteId).sort((a, b) => a.numero - b.numero)
	);
	const indiceLinha = $derived(linhas.findIndex((l) => l.id === linhaId));
	const linha = $derived(linhas[indiceLinha] ?? null);
	const procedimento = $derived(PROCEDIMENTOS.find((p) => p.id === linha?.procedimentoId));
	const prestador = $derived(prestadores.find((p) => p.codigo === linha?.prestadorCodigo));

	const criticas = $derived.by(() => {
		const lista: string[] = [];
		for (const [i, l] of linhas.entries()) {
			if (!l.procedimentoId) lista.push(`Procedimento ${i + 1}: código não informado.`);
			if (!l.prestadorCodigo) lista.push(`Procedimento ${i + 1}: prestador não informado.`);
		}
		const temEvolucao = evolucoes.some((e) => e.pacienteId === pacienteId);
		if (temEvolucao && lancadosDoPaciente(pacienteId).length === 0)
			lista.push('Atendimento com registro no prontuário e nenhum procedimento lançado.');
		return lista;
	});

	const tempo = $derived.by(() => {
		const s = Math.floor((agoraMs - inicio) / 1000);
		return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
	});

	$effect(() => {
		const id = setInterval(() => (agoraMs = Date.now()), 1000);
		return () => clearInterval(id);
	});

	$effect(() => {
		if (!alterado) return;
		const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
		addEventListener('beforeunload', avisar);
		return () => removeEventListener('beforeunload', avisar);
	});

	$effect(() => {
		if (indiceLinha === -1) linhaId = linhas[0]?.id ?? null;
	});

	$effect(() => {
		codigoDigitado = procedimento ? digitos(procedimento.sigtap) : '';
		erroCodigo = false;
	});

	function irParaPaciente(posicao: number) {
		const alvo = pacientes[Math.max(0, Math.min(posicao, pacientes.length - 1))];
		if (alvo) pacienteId = alvo.id;
	}

	export async function novo(id = pacienteId) {
		pacienteId = id;
		const lancamento = novoLancamento(id);
		linhaId = lancamento.id;
		aba = 'Procedimentos';
		await tick();
		campoCodigo?.focus();
	}

	function excluir() {
		if (!linha || !confirm(`Excluir o procedimento ${indiceLinha + 1} deste atendimento?`)) return;
		excluirLancamento(linha.id);
	}

	function salvar() {
		salvarLancamentos();
		onaviso('Registros salvos com sucesso.');
	}

	function aplicarCodigo() {
		if (!linha) return;
		if (!codigoDigitado.trim()) {
			linha.procedimentoId = null;
			return;
		}
		const achado = PROCEDIMENTOS.find((p) => digitos(p.sigtap) === digitos(codigoDigitado));
		erroCodigo = !achado;
		if (achado) linha.procedimentoId = achado.id;
	}

	function escolherProcedimento(p: Exame) {
		lovAberto = false;
		if (linha) linha.procedimentoId = p.id;
	}

	type FocoRobo = 'novo' | 'codigo' | 'qtde' | 'prestador' | 'salvar' | null;
	let robo = $state<{ mensagem: string; atual: number; total: number; concluido?: boolean } | null>(
		null
	);
	let focoRobo = $state<FocoRobo>(null);
	const destaque = (alvo: FocoRobo) =>
		focoRobo === alvo && 'ring-2 ring-orange-500 ring-offset-1 bg-orange-50';

	/** Lança os exames como a faturista faria, passo a passo e devagar, para a demonstração. */
	export async function executarRobo(tarefa: TarefaRobo) {
		const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
		const total = tarefa.itens.length;

		robo = { mensagem: 'Abrindo o atendimento do paciente…', atual: 0, total };
		await espera(1200);
		pacienteId = tarefa.pacienteId;
		await espera(1000);

		for (const [i, item] of tarefa.itens.entries()) {
			const exame = PROCEDIMENTOS.find((p) => p.id === item.exameId);
			if (!exame) continue;
			robo = { mensagem: `Lançando ${exame.nome}`, atual: i + 1, total };

			focoRobo = 'novo';
			await espera(700);
			await novo(tarefa.pacienteId);

			focoRobo = 'codigo';
			await espera(400);
			codigoDigitado = '';
			for (const caractere of digitos(exame.sigtap)) {
				codigoDigitado += caractere;
				await espera(120);
			}
			aplicarCodigo();
			await espera(600);

			if (item.quantidade > 1 && linha) {
				focoRobo = 'qtde';
				await espera(400);
				linha.quantidade = item.quantidade;
				await espera(500);
			}
			if (tarefa.prestadorCodigo && linha) {
				focoRobo = 'prestador';
				await espera(400);
				linha.prestadorCodigo = tarefa.prestadorCodigo;
				await espera(600);
			}
		}

		focoRobo = 'salvar';
		await espera(800);
		salvarLancamentos();
		focoRobo = null;
		robo = {
			mensagem: `Concluído: ${total} procedimento(s) lançado(s) e salvo(s).`,
			atual: total,
			total,
			concluido: true
		};
		setTimeout(() => (robo = null), 6000);
	}

	const campo =
		'h-6 border border-slate-400 bg-white px-1.5 text-[11px] text-slate-900 focus:border-orange-400 focus:outline-none disabled:bg-slate-100';
	const somenteLeitura =
		'h-6 border border-slate-300 bg-[#f3f5f7] px-1.5 text-[11px] leading-6 truncate';
	const rotulo = 'flex flex-col gap-0.5 text-[10px] text-slate-600';
	const botaoBarra = 'p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30';
</script>

{#if robo}
	<div
		role="status"
		class="fixed top-14 left-1/2 z-50 w-[28rem] -translate-x-1/2 rounded-lg border border-orange-300 bg-white p-3 shadow-xl"
	>
		<p class="flex items-center gap-2 text-sm font-semibold text-slate-900">
			<Bot
				size={18}
				class={robo.concluido ? 'text-emerald-600' : 'animate-pulse text-orange-600'}
			/>
			Robô de lançamento
			<span class="ml-auto text-xs font-normal text-slate-500">{robo.atual} de {robo.total}</span>
		</p>
		<p class="mt-1 text-xs text-slate-600">{robo.mensagem}</p>
		<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
			<div
				class={['h-full transition-all', robo.concluido ? 'bg-emerald-500' : 'bg-orange-500']}
				style:width="{robo.total ? (robo.atual / robo.total) * 100 : 0}%"
			></div>
		</div>
	</div>
{/if}

<section class="flex h-full min-h-[640px] flex-col border border-slate-300 bg-white">
	<div class="flex items-center gap-0.5 border-b border-slate-300 bg-[#f3f5f7] px-2 py-1">
		<button type="button" title="Pesquisar" class={botaoBarra}><Search size={16} /></button>
		<button type="button" title="Salvar" onclick={salvar} class={[botaoBarra, destaque('salvar')]}>
			<Save size={16} />
		</button>
		<span class="mx-1 h-5 w-px bg-slate-300"></span>
		<button
			type="button"
			title="Primeiro paciente"
			disabled={posicaoPaciente <= 0}
			onclick={() => irParaPaciente(0)}
			class={botaoBarra}
		>
			<ChevronsLeft size={16} />
		</button>
		<button
			type="button"
			title="Paciente anterior"
			disabled={posicaoPaciente <= 0}
			onclick={() => irParaPaciente(posicaoPaciente - 1)}
			class={botaoBarra}
		>
			<ChevronLeft size={16} />
		</button>
		<button
			type="button"
			title="Próximo paciente"
			disabled={posicaoPaciente >= pacientes.length - 1}
			onclick={() => irParaPaciente(posicaoPaciente + 1)}
			class={botaoBarra}
		>
			<ChevronRight size={16} />
		</button>
		<button
			type="button"
			title="Último paciente"
			disabled={posicaoPaciente >= pacientes.length - 1}
			onclick={() => irParaPaciente(pacientes.length - 1)}
			class={botaoBarra}
		>
			<ChevronsRight size={16} />
		</button>
		<span class="mx-1 h-5 w-px bg-slate-300"></span>
		<button
			type="button"
			title="Novo procedimento"
			onclick={() => novo()}
			class={[botaoBarra, destaque('novo')]}
		>
			<Plus size={16} />
		</button>
		<button
			type="button"
			title="Excluir procedimento"
			onclick={excluir}
			disabled={!linha}
			class={botaoBarra}
		>
			<Trash2 size={16} />
		</button>
		<div class="ml-auto flex items-center gap-0.5">
			<button
				type="button"
				title="Abrir prontuário do paciente"
				onclick={onabrirProntuario}
				class="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-200"
			>
				<FolderSearch size={16} /> Prontuário
			</button>
			<button type="button" title="Imprimir" disabled class={botaoBarra}>
				<Printer size={16} />
			</button>
			<button type="button" title="Filtrar" class={botaoBarra}><Funnel size={16} /></button>
			<button type="button" title="Exportar" class={botaoBarra}><FileOutput size={16} /></button>
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
	</div>

	<CapaAtendimento {paciente} onir={(id) => (pacienteId = id)} />

	<div role="tablist" class="flex gap-0.5 px-3 pt-2">
		{#each ['Procedimentos', 'Críticas'] as const as nome (nome)}
			<button
				type="button"
				role="tab"
				aria-selected={aba === nome}
				onclick={() => (aba = nome)}
				class={[
					'-mb-px border border-slate-300 px-3 py-1 text-[11px]',
					aba === nome ? 'border-b-white bg-white font-semibold' : 'bg-[#eef1f4] text-slate-600'
				]}
			>
				{nome}
				{#if nome === 'Procedimentos'}({linhas.length}){/if}
				{#if nome === 'Críticas' && criticas.length}
					<span class="ml-1 bg-red-600 px-1 text-[10px] font-bold text-white">
						{criticas.length}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<div class="mx-3 flex min-h-40 flex-1 flex-col border border-slate-300">
		{#if aba === 'Procedimentos'}
			<div class="min-h-0 flex-1 overflow-y-scroll">
				<table class="w-full text-[11px] whitespace-nowrap">
					<thead class="sticky top-0 bg-[#e3e7eb] text-left text-slate-700">
						<tr>
							{#each ['Seq.', 'Procedimento', 'Descrição', 'Tipo', 'Data', 'Hora', 'Qtde.', 'CID', 'Prest.', 'CBO'] as coluna (coluna)}
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
								onclick={() => (linhaId = l.id)}
								class={[
									'cursor-default border-b border-slate-200',
									l.id === linhaId ? 'bg-[#8fb6e3] text-slate-900' : 'hover:bg-slate-50'
								]}
							>
								<td class="px-2 py-px leading-4">{i + 1}</td>
								<td class="px-2 py-px font-mono leading-4">{proc ? digitos(proc.sigtap) : ''}</td>
								<td class="max-w-72 truncate px-2 py-px leading-4 uppercase">{proc?.nome ?? ''}</td>
								<td class="px-2 py-px leading-4">
									{proc ? (proc.categoria === 'Consulta' ? 'Consulta' : 'Exame') : ''}
								</td>
								<td class="px-2 py-px leading-4">{l.data}</td>
								<td class="px-2 py-px leading-4">{l.hora}</td>
								<td class="px-2 py-px text-right leading-4">{l.quantidade}</td>
								<td class="px-2 py-px leading-4">{l.cid}</td>
								<td class="px-2 py-px leading-4">{l.prestadorCodigo ?? ''}</td>
								<td class="px-2 py-px leading-4">{prest?.cbo ?? ''}</td>
							</tr>
						{/each}
						{#each { length: Math.max(0, 8 - linhas.length) }, i (i)}
							<tr class="border-b border-slate-100"><td colspan="10" class="h-[19px]"></td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<ul class="min-h-0 flex-1 overflow-y-auto p-2 text-[11px]">
				{#each criticas as critica, i (i)}
					<li class="border-b border-slate-100 py-1 text-red-700">{critica}</li>
				{:else}
					<li class="text-slate-500">Nenhuma crítica para este atendimento.</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="mx-3 my-3 grid gap-2 border border-slate-300 p-3">
		<p class="text-[10px] font-semibold text-slate-500 uppercase">
			Procedimento selecionado {linha ? `(${indiceLinha + 1} de ${linhas.length})` : ''}
		</p>
		{#if linha}
			<div class="flex flex-wrap items-end gap-2">
				<label class={rotulo}>
					Procedimento
					<span class="flex gap-1">
						<input
							bind:this={campoCodigo}
							bind:value={codigoDigitado}
							onchange={aplicarCodigo}
							onkeydown={(e) => {
								if (e.key === 'Enter') aplicarCodigo();
								if (e.key === 'F9') {
									e.preventDefault();
									lovAberto = true;
								}
							}}
							inputmode="numeric"
							class={[
								campo,
								'w-28 font-mono',
								erroCodigo && 'border-red-500! bg-red-50',
								destaque('codigo')
							]}
						/>
						<button
							type="button"
							title="Lista de valores (F9)"
							onclick={() => (lovAberto = true)}
							class="flex h-6 w-6 items-center justify-center border border-slate-400 bg-[#e3e7eb] hover:bg-[#d8dde2]"
						>
							<Ellipsis size={14} />
						</button>
					</span>
				</label>
				<span class={rotulo}>
					Descrição do procedimento
					<span class={[somenteLeitura, 'w-96 uppercase', erroCodigo && 'text-red-700']}>
						{erroCodigo ? 'Procedimento não encontrado na tabela' : (procedimento?.nome ?? '')}
					</span>
				</span>
				<label class={rotulo}>
					Qtde.
					<input
						type="number"
						min="1"
						bind:value={linha.quantidade}
						class={[campo, 'w-14 text-right', destaque('qtde')]}
					/>
				</label>
			</div>
			<div class="flex flex-wrap items-end gap-2">
				<label class={rotulo}>
					Prestador
					<select bind:value={linha.prestadorCodigo} class={[campo, 'w-56', destaque('prestador')]}>
						<option value={null}></option>
						{#each prestadores as p (p.codigo)}
							<option value={p.codigo}>{p.codigo} · {p.nome}</option>
						{/each}
					</select>
				</label>
				<span class={rotulo}>
					CBO
					<span class="flex gap-1">
						<span class={[somenteLeitura, 'w-16']}>{prestador?.cbo ?? ''}</span>
						<span class={[somenteLeitura, 'w-48 uppercase']}>{prestador?.cboDescricao ?? ''}</span>
					</span>
				</span>
				<label class={rotulo}>
					CID
					<input bind:value={linha.cid} class={[campo, 'w-16 uppercase']} />
				</label>
				<label class={rotulo}>
					Data
					<input bind:value={linha.data} class={[campo, 'w-24']} />
				</label>
			</div>
		{:else}
			<p class="text-[11px] text-slate-500">
				Nenhum procedimento lançado para este paciente. Use <strong>+</strong> para lançar a consulta
				e cada exame realizado.
			</p>
		{/if}
	</div>

	<div
		class="mt-auto flex items-center gap-4 border-t border-slate-300 bg-[#f3f5f7] px-3 py-1 text-[11px] text-slate-600"
	>
		<span>Paciente {posicaoPaciente + 1}/{pacientes.length}</span>
		<span>Procedimento {indiceLinha + 1}/{linhas.length}</span>
		<span>Tempo de lançamento: <span class="font-mono">{tempo}</span></span>
		{#if alterado}
			<span class="font-semibold text-orange-600">Alterações não salvas</span>
		{/if}
		<span class="ml-auto">Lancamento_BPA · F9 = lista de valores</span>
	</div>
</section>

{#if lovAberto}
	<ListaProcedimentos onescolher={escolherProcedimento} onfechar={() => (lovAberto = false)} />
{/if}
