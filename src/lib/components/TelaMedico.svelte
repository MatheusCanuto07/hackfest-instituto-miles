<script lang="ts">
	import { FileCheck, FilePlus, Printer, Save } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import AbaForaDoEscopo from './AbaForaDoEscopo.svelte';
	import AbasAtendimento from './AbasAtendimento.svelte';
	import BarraPaciente from './BarraPaciente.svelte';
	import type { Cenario } from './BarraSuperior.svelte';
	import EditorEvolucao from './EditorEvolucao.svelte';
	import FormAnamnese from './FormAnamnese.svelte';
	import Historico from './Historico.svelte';
	import ListaAnamneses from './ListaAnamneses.svelte';
	import PainelExames from './PainelExames.svelte';
	import ResumoAnamnese from './ResumoAnamnese.svelte';
	import TelaPEP from './TelaPEP.svelte';
	import VisualizarEvolucao from './VisualizarEvolucao.svelte';
	import {
		anamnesePreenchida,
		anamneseExemplo,
		eExemploIntocado,
		textoAnamnese,
		type Anamnese
	} from '#lib/anamnese.js';
	import { menuMedico } from '#lib/data/menus.js';
	import { pacientes, profissional } from '#lib/data/paciente.js';
	import { adicionarEvolucao, agora, evolucoesDoPaciente } from '#lib/evolucoes.svelte.js';
	import { PREFIXO_EXAME, examesLancados, removerExame } from '#lib/prontuario.js';

	let { cenario }: { cenario: Cenario } = $props();

	const solucao = $derived(cenario === 'solucao');
	const chaveRascunho = $derived(`pep:rascunho:${cenario}`);
	const MODELO_SOAP = 'S: \nO: \nA: \nP: ';
	const TIPOS = ['Evolução médica', 'Admissão', 'Intercorrência', 'Interconsulta'];

	const chaveAnamnese = $derived(`pep:rascunho:anamnese:${cenario}`);
	const abaPrincipal = 'Anamnese';

	function carregarAnamnese(): Anamnese {
		const exemplo = anamneseExemplo(pacientes[0].id);
		try {
			const salvo = JSON.parse(localStorage.getItem(chaveAnamnese) ?? '{}');
			const rascunho: Anamnese = {
				qp: salvo.qp ?? '',
				hma: salvo.hma ?? '',
				exames: salvo.exames ?? []
			};
			return anamnesePreenchida(rascunho) ? rascunho : exemplo;
		} catch {
			return exemplo;
		}
	}

	const MINHAS = 'Minhas anamneses';
	let tela = $state('Atendimento médico');
	let aba = $state(abaPrincipal);
	let texto = $state(untrack(() => localStorage.getItem(chaveRascunho) ?? ''));
	let anamnese = $state<Anamnese>(untrack(carregarAnamnese));
	let formAnamnese = $state<FormAnamnese>();
	let tipo = $state(TIPOS[0]);
	let selecionadaId = $state<string | null>(null);
	let salvoEm = $state<string | null>(null);
	let aviso = $state<string | null>(null);
	let dataHora = $state(agora());
	let editor = $state<EditorEvolucao>();

	let pacienteId = $state(pacientes[0].id);
	const paciente = $derived(pacientes.find((p) => p.id === pacienteId) ?? pacientes[0]);
	const historico = $derived(evolucoesDoPaciente(paciente.id));
	const selecionada = $derived(historico.find((e) => e.id === selecionadaId) ?? null);
	const emAnamnese = $derived(aba === 'Anamnese' && !selecionada);
	const podeAssinar = $derived(
		!selecionada &&
			(emAnamnese ? anamnesePreenchida(anamnese) : aba === 'Evolução' && texto.trim() !== '')
	);
	const hora = () => new Date().toLocaleTimeString('pt-BR', { timeStyle: 'short' });

	$effect(() => {
		const atual = JSON.stringify(anamnese);
		const chave = chaveAnamnese;
		const id = setTimeout(() => {
			localStorage.setItem(chave, atual);
			if (anamnesePreenchida(anamnese)) salvoEm = hora();
		}, 600);
		return () => clearTimeout(id);
	});

	$effect(() => {
		const id = setInterval(() => (dataHora = agora()), 15_000);
		return () => clearInterval(id);
	});

	$effect(() => {
		const atual = texto;
		const chave = chaveRascunho;
		const id = setTimeout(() => {
			localStorage.setItem(chave, atual);
			if (atual) salvoEm = hora();
		}, 600);
		return () => clearTimeout(id);
	});

	function mostrarAviso(mensagem: string) {
		aviso = mensagem;
		setTimeout(() => (aviso = null), 4000);
	}

	function voltarParaEvolucao() {
		aba = abaPrincipal;
		selecionadaId = null;
	}

	function assinar() {
		if (!podeAssinar) return;
		if (emAnamnese) {
			adicionarEvolucao(
				{
					pacienteId: paciente.id,
					data: agora(),
					autor: profissional.nome,
					tipo: 'Anamnese',
					texto: textoAnamnese(anamnese),
					cenario,
					anamnese: $state.snapshot(anamnese)
				},
				{ gerarLancamentos: solucao }
			);
			const total = anamnese.exames.length;
			anamnese = anamneseExemplo(paciente.id);
			salvoEm = null;
			mostrarAviso(
				solucao
					? `Anamnese assinada. ${total} ${total === 1 ? 'exame enviado' : 'exames enviados'} ao faturamento para revisão.`
					: 'Anamnese assinada.'
			);
			return;
		}
		adicionarEvolucao({
			pacienteId: paciente.id,
			data: agora(),
			autor: profissional.nome,
			tipo,
			texto: texto.trim()
		});
		const total = examesLancados(texto).length;
		texto = '';
		dataHora = agora();
		salvoEm = null;
		mostrarAviso(
			solucao
				? `Evolução assinada. ${total} ${total === 1 ? 'exame enviado' : 'exames enviados'} ao faturamento para revisão.`
				: 'Evolução assinada.'
		);
	}
</script>

<TelaPEP
	titulo="Atendimento médico"
	modulo="Atendimento médico"
	{cenario}
	menu={menuMedico}
	usuario={`Médico PEP · ${profissional.nome} · ${profissional.registro}`}
	{aviso}
	menuAtivo={tela}
	onmenu={(rotulo) => {
		if (rotulo === MINHAS || rotulo === 'Atendimento médico') tela = rotulo;
	}}
>
	{#if tela === MINHAS}
		<ListaAnamneses
			{cenario}
			onnova={() => {
				tela = 'Atendimento médico';
				voltarParaEvolucao();
			}}
		/>
	{:else}
		<label
			class="flex shrink-0 items-center gap-2 border-b border-slate-300 bg-white px-3 py-1 text-xs text-slate-600"
		>
			Paciente em atendimento:
			<select
				value={pacienteId}
				onchange={(e) => {
					const anterior = pacienteId;
					pacienteId = e.currentTarget.value;
					selecionadaId = null;
					if (eExemploIntocado(anamnese, anterior)) anamnese = anamneseExemplo(pacienteId);
				}}
				class="h-6 border border-slate-400 bg-white px-1 text-xs focus:border-orange-400 focus:outline-none"
			>
				{#each pacientes as p (p.id)}
					<option value={p.id}>{p.nome} · Atend. {p.atendimento}</option>
				{/each}
			</select>
			<span class="text-slate-400">(fila do ambulatório, dados fictícios)</span>
		</label>
		<BarraPaciente {paciente} />
		<AbasAtendimento bind:aba onmudar={() => (selecionadaId = null)} />

		<main class="relative min-h-0 flex-1 overflow-y-auto p-4">
			{#if selecionada}
				<div class="mx-auto max-w-4xl border border-slate-700 bg-white">
					<div class="flex items-center border-b border-slate-700 px-3 py-2">
						<h2 class="flex-1 text-center text-[15px] font-bold uppercase">
							{selecionada.tipo} · visualização
						</h2>
						<button
							type="button"
							onclick={voltarParaEvolucao}
							class="border border-slate-400 bg-[#e3e7eb] px-2 py-0.5 text-xs hover:bg-[#d8dde2]"
						>
							Voltar ao registro
						</button>
					</div>
					<VisualizarEvolucao evolucao={selecionada} analise={solucao} />
				</div>
			{:else if emAnamnese}
				<div class="flex flex-col gap-4 lg:flex-row lg:items-start">
					<FormAnamnese
						bind:this={formAnamnese}
						bind:anamnese
						comExames={solucao}
						contexto={{
							paciente: paciente.nome,
							prontuario: paciente.prontuario,
							atendimento: paciente.atendimento,
							medico: `${profissional.nome} (${profissional.registro})`,
							dataHora
						}}
					/>
					{#if solucao}
						<ResumoAnamnese {anamnese} />
					{/if}
				</div>
			{:else if aba === 'Evolução'}
				<div class="flex flex-col gap-4 lg:flex-row lg:items-start">
					<div class="min-w-0 flex-1 border border-slate-700 bg-white">
						<h2 class="border-b border-slate-700 py-2 text-center text-[15px] font-bold">
							EVOLUÇÃO MÉDICA
						</h2>

						<div
							class="grid grid-cols-1 gap-3 border-b border-slate-700 px-3 py-2 text-xs sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1.4fr)]"
						>
							<div>
								<p class="font-bold underline">Data/Hora:</p>
								<p class="mt-1 border border-slate-300 bg-slate-50 px-2 py-1">{dataHora}</p>
							</div>
							<label class="block">
								<span class="font-bold underline">Tipo:</span>
								<select
									bind:value={tipo}
									class="mt-1 block w-full border border-slate-300 bg-white px-1 py-1 text-xs focus:border-orange-400 focus:outline-none"
								>
									{#each TIPOS as t (t)}
										<option>{t}</option>
									{/each}
								</select>
							</label>
							<div>
								<p class="font-bold underline">Profissional:</p>
								<p class="mt-1 truncate border border-slate-300 bg-slate-50 px-2 py-1">
									{profissional.nome} · {profissional.registro}
								</p>
							</div>
						</div>

						<div class="px-3 py-2">
							{#if solucao}
								<div class="mb-1 flex items-center gap-2">
									<p class="text-xs font-bold underline">Descrição da evolução:</p>
									<button
										type="button"
										disabled={texto.trim() !== ''}
										title={texto.trim() ? 'Disponível com o texto vazio' : undefined}
										onclick={() => editor?.usarModelo(MODELO_SOAP)}
										class="ml-auto border border-slate-400 bg-[#e3e7eb] px-2 py-0.5 text-[11px] hover:bg-[#d8dde2] disabled:cursor-not-allowed disabled:opacity-40"
									>
										Modelo SOAP
									</button>
								</div>
								<EditorEvolucao bind:this={editor} bind:texto />
								<p class="mt-1.5 text-[11px] text-slate-500">
									Digite <kbd class="border border-slate-300 bg-slate-50 px-1 font-mono">/</kbd>
									seguido do nome ou atalho do exame (ex.: /tono, /oct, /campo). A linha
									<code class="bg-slate-100 px-1 font-mono">{PREFIXO_EXAME}</code> segue no texto e é
									lida automaticamente pelo faturamento.
								</p>
							{:else}
								<label for="evolucao-atual" class="mb-1 block text-xs font-bold underline">
									Evolução e exames realizados:
								</label>
								<textarea
									id="evolucao-atual"
									bind:value={texto}
									class="block min-h-[400px] w-full resize-y border border-slate-400 bg-white p-2 text-[13px] leading-6 text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
								></textarea>
							{/if}
						</div>
					</div>

					{#if solucao}
						<PainelExames
							{texto}
							oninserir={(exame) => editor?.inserirExame(exame)}
							onremover={(exame) => (texto = removerExame(texto, exame))}
						/>
					{/if}
				</div>
			{:else}
				<AbaForaDoEscopo {aba} foco={abaPrincipal} onvoltar={voltarParaEvolucao} />
			{/if}
		</main>

		<div
			class="flex shrink-0 items-center gap-1 border-t border-slate-300 bg-[#e3e7eb] px-3 py-1.5 text-slate-600"
		>
			<button
				type="button"
				title="Novo registro (descarta o rascunho)"
				aria-label="Novo registro"
				onclick={() => {
					if (emAnamnese) {
						if (anamnesePreenchida(anamnese) && !confirm('Descartar a anamnese em andamento?'))
							return;
						anamnese = anamneseExemplo(paciente.id);
						return;
					}
					if (texto.trim() && !confirm('Descartar o rascunho atual?')) return;
					texto = '';
					voltarParaEvolucao();
				}}
				class="p-1.5 hover:bg-white"
			>
				<FilePlus size={22} />
			</button>
			<button
				type="button"
				title="Salvar rascunho"
				aria-label="Salvar rascunho"
				onclick={() => {
					localStorage.setItem(chaveRascunho, texto);
					localStorage.setItem(chaveAnamnese, JSON.stringify(anamnese));
					salvoEm = hora();
					mostrarAviso('Rascunho salvo.');
				}}
				class="p-1.5 hover:bg-white"
			>
				<Save size={22} />
			</button>
			<button
				type="button"
				title="Assinar e finalizar"
				onclick={assinar}
				disabled={!podeAssinar}
				class="flex items-center gap-1.5 p-1.5 text-sky-800 hover:bg-white disabled:opacity-40"
			>
				<FileCheck size={22} />
				<span class="text-xs font-semibold">Assinar</span>
			</button>
			<button
				type="button"
				title="Imprimir"
				aria-label="Imprimir"
				disabled
				class="p-1.5 opacity-40"
			>
				<Printer size={22} />
			</button>
			<span class="ml-auto text-[11px]">
				{salvoEm ? `Rascunho salvo às ${salvoEm}` : 'Sem rascunho'}
			</span>
		</div>
	{/if}

	{#snippet lateral()}
		{#if tela !== MINHAS}
			<Historico
				evolucoes={historico}
				selecionada={selecionadaId}
				onselecionar={(id) => (selecionadaId = id)}
				analise={solucao}
			/>
		{/if}
	{/snippet}
</TelaPEP>
