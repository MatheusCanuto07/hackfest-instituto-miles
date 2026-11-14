<script lang="ts">
	import {
		ArrowLeft,
		Cpu,
		FileSearch,
		ListTodo,
		FileUp,
		LoaderCircle,
		Send,
		Sparkles
	} from '@lucide/svelte';
	import CartaoAchado from '#lib/components/assistente/CartaoAchado.svelte';
	import ImportarProntuario from '#lib/components/assistente/ImportarProntuario.svelte';
	import TextoDestacado from '#lib/components/assistente/TextoDestacado.svelte';
	import { pacientes } from '#lib/data/paciente.js';
	import { evolucoes } from '#lib/evolucoes.svelte.js';
	import {
		analisarTexto,
		exemplosSincronos,
		motor,
		temExemplo,
		type Achado,
		type Situacao
	} from '#lib/motor.js';
	import { importarAnalise, jaEnviada } from '#lib/revisao.svelte.js';

	type Aba = 'prontuarios' | 'texto' | 'pendencias';

	const ROTULO: Record<Situacao, { titulo: string; descricao: string; cor: string }> = {
		realizado: {
			titulo: 'Realizados',
			descricao: 'Vão para o faturamento',
			cor: 'text-emerald-700'
		},
		solicitado: {
			titulo: 'Solicitados',
			descricao: 'Não faturar agora: exame pedido, ainda não feito',
			cor: 'text-sky-700'
		},
		negado: { titulo: 'Negados', descricao: 'Citados como não indicados', cor: 'text-slate-500' }
	};

	let aba = $state<Aba>('prontuarios');
	let selecionadaId = $state(evolucoes[0]?.id ?? null);
	let analises = $state<Record<string, Achado[]>>({});
	let marcados = $state<Record<string, string[]>>({});
	let analisando = $state(false);
	let aviso = $state<string | null>(null);
	let importando = $state(false);

	let textoLivre = $state(
		'Feito tono: PIO OD 22 / OE 25 mmHg. Mapeamento de retina AO sem alterações.\nSolicito campo visual e OCT de nervo óptico. Sem indicação de angio no momento.'
	);
	let achadosLivres = $state<Achado[] | null>(null);

	const selecionada = $derived(evolucoes.find((e) => e.id === selecionadaId) ?? null);
	const paciente = $derived(pacientes.find((p) => p.id === selecionada?.pacienteId));
	const achados = $derived(selecionada ? analises[selecionada.id] : undefined);
	const chave = (a: Achado) => `${a.exame.id}:${a.situacao}`;

	/** "dd/mm/aaaa hh:mm" → "aaaa-mm-dd hh:mm", para comparar datas como texto. */
	const ordenavel = (data: string) => {
		const [d, m, a] = data.slice(0, 10).split('/');
		return `${a}-${m}-${d}${data.slice(10)}`;
	};

	const pendencias = $derived.by(() =>
		evolucoes.flatMap((evolucao) => {
			const posteriores = evolucoes.filter(
				(e) => e.pacienteId === evolucao.pacienteId && ordenavel(e.data) > ordenavel(evolucao.data)
			);
			return exemplosSincronos(evolucao.texto, evolucao.id)
				.filter((a) => a.situacao === 'solicitado')
				.filter(
					(a) =>
						!posteriores.some((e) =>
							exemplosSincronos(e.texto, e.id).some(
								(p) => p.exame.id === a.exame.id && p.situacao === 'realizado'
							)
						)
				)
				.map((a) => ({ evolucao, achado: a }));
		})
	);

	function mostrarAviso(mensagem: string) {
		aviso = mensagem;
		setTimeout(() => (aviso = null), 4000);
	}

	async function analisar(id: string) {
		const evolucao = evolucoes.find((e) => e.id === id);
		if (!evolucao) return;
		analisando = true;
		const resultado = await analisarTexto(evolucao.texto, evolucao.id);
		analises[id] = resultado;
		marcados[id] = resultado.filter((a) => a.situacao === 'realizado').map(chave);
		analisando = false;
	}

	function selecionar(id: string) {
		selecionadaId = id;
	}

	function alternar(a: Achado) {
		if (!selecionada) return;
		const lista = marcados[selecionada.id] ?? [];
		marcados[selecionada.id] = lista.includes(chave(a))
			? lista.filter((k) => k !== chave(a))
			: [...lista, chave(a)];
	}

	function enviar() {
		if (!selecionada || !achados) return;
		const escolhidos = achados.filter((a) => marcados[selecionada.id]?.includes(chave(a)));
		importarAnalise(
			selecionada,
			escolhidos.map((a) => ({
				exameId: a.exame.id,
				quantidade: a.quantidade,
				trecho: a.trecho,
				confianca: a.confianca,
				motivo: a.motivo
			}))
		);
		mostrarAviso(
			`${escolhidos.length} exame(s) e a consulta enviados ao faturamento como "Pendente de revisão".`
		);
	}

	async function analisarTextoLivre() {
		analisando = true;
		achadosLivres = await analisarTexto(textoLivre);
		analisando = false;
	}

	$effect(() => {
		if (selecionadaId && !analises[selecionadaId]) analisar(selecionadaId);
	});
</script>

<svelte:head>
	<title>Assistente de Faturamento</title>
</svelte:head>

{#snippet grupos(lista: Achado[], selecionavel: boolean)}
	{#each ['realizado', 'solicitado', 'negado'] as const as situacao (situacao)}
		{@const doGrupo = lista.filter((a) => a.situacao === situacao)}
		{#if doGrupo.length}
			<section class="space-y-2">
				<header>
					<h3 class={['text-sm font-semibold', ROTULO[situacao].cor]}>
						{ROTULO[situacao].titulo} ({doGrupo.length})
					</h3>
					<p class="text-xs text-slate-500">{ROTULO[situacao].descricao}</p>
				</header>
				{#each doGrupo as achado (chave(achado))}
					<CartaoAchado
						{achado}
						selecionavel={selecionavel && situacao === 'realizado'}
						selecionado={selecionavel &&
							!!selecionada &&
							!!marcados[selecionada.id]?.includes(chave(achado))}
						onalternar={() => alternar(achado)}
					/>
				{/each}
			</section>
		{/if}
	{:else}
		<p class="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
			{motor.conectado
				? 'Nenhum exame do catálogo encontrado neste texto.'
				: 'Motor de leitura ainda não conectado: não há resultado para este texto. Os procedimentos identificados aparecerão aqui.'}
		</p>
	{/each}
{/snippet}

<div class="min-h-screen bg-slate-50 text-slate-800">
	<header class="border-b border-slate-200 bg-white">
		<div class="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
			<a href="/" class="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
				<ArrowLeft size={16} /> Início
			</a>
			<div class="flex items-center gap-2">
				<span class="flex size-9 items-center justify-center rounded-lg bg-sky-600 text-white">
					<Sparkles size={20} />
				</span>
				<div class="leading-tight">
					<h1 class="text-lg font-semibold text-slate-900">Assistente de Faturamento</h1>
					<p class="text-xs text-slate-500">
						Lê o prontuário e identifica os procedimentos realizados
					</p>
				</div>
			</div>
			<div
				title={motor.descricao}
				class={[
					'ml-auto flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
					motor.conectado
						? 'border-emerald-300 bg-emerald-50 text-emerald-800'
						: 'border-amber-300 bg-amber-50 text-amber-800'
				]}
			>
				<Cpu size={14} />
				Motor: {motor.nome}
				{#if !motor.conectado}· mostrando resultados de exemplo{/if}
			</div>
			<button
				type="button"
				onclick={() => (importando = true)}
				class="flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
			>
				<FileUp size={16} /> Importar prontuário
			</button>
			<a
				href="/solucao/faturamento"
				class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
			>
				Abrir fila de revisão
			</a>
		</div>
		<nav class="mx-auto flex max-w-7xl gap-1 px-6" aria-label="Seções">
			{#each [['prontuarios', 'Prontuários assinados', FileSearch], ['texto', 'Analisar um texto', Sparkles], ['pendencias', `Exames solicitados e não realizados (${pendencias.length})`, ListTodo]] as const as [id, rotulo, Icone] (id)}
				<button
					type="button"
					onclick={() => (aba = id)}
					class={[
						'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm',
						aba === id
							? 'border-sky-600 font-semibold text-sky-700'
							: 'border-transparent text-slate-500 hover:text-slate-800'
					]}
				>
					<Icone size={16} />
					{rotulo}
				</button>
			{/each}
		</nav>
	</header>

	<main class="mx-auto max-w-7xl px-6 py-6">
		{#if aba === 'prontuarios'}
			<div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_24rem]">
				<aside class="space-y-2">
					<h2 class="text-sm font-semibold text-slate-700">Registros recebidos</h2>
					{#each evolucoes as evolucao (evolucao.id)}
						{@const p = pacientes.find((x) => x.id === evolucao.pacienteId)}
						<button
							type="button"
							onclick={() => selecionar(evolucao.id)}
							class={[
								'w-full rounded-lg border bg-white p-3 text-left',
								evolucao.id === selecionadaId
									? 'border-sky-500 ring-1 ring-sky-200'
									: 'border-slate-200 hover:border-slate-300'
							]}
						>
							<p class="truncate text-sm font-semibold text-slate-900">{p?.nome}</p>
							<p class="text-xs text-slate-500">
								{evolucao.tipo} · {evolucao.data}
							</p>
							<p class="text-xs text-slate-500">{evolucao.autor}</p>
							<span
								class={[
									'mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium',
									jaEnviada(evolucao.id)
										? 'bg-emerald-100 text-emerald-800'
										: 'bg-amber-100 text-amber-800'
								]}
							>
								{jaEnviada(evolucao.id) ? 'Enviado ao faturamento' : 'Aguardando conferência'}
							</span>
						</button>
					{/each}
				</aside>

				<section class="min-w-0 rounded-xl border border-slate-200 bg-white p-6">
					{#if selecionada && paciente}
						<div class="mb-4 border-b border-slate-100 pb-4">
							<p class="text-xs text-slate-500 uppercase">
								Texto do prontuário (como o médico escreveu)
							</p>
							<h2 class="text-xl font-semibold text-slate-900">{paciente.nome}</h2>
							<p class="text-sm text-slate-500">
								{selecionada.tipo} · {selecionada.data} · {selecionada.autor} · CID {paciente.cid}
							</p>
						</div>
						<TextoDestacado texto={selecionada.texto} achados={achados ?? []} />
						<div class="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
							<span
								><mark class="rounded bg-emerald-100 px-1 ring-1 ring-emerald-300">realizado</mark
								></span
							>
							<span
								><mark class="rounded bg-sky-100 px-1 ring-1 ring-sky-300">solicitado</mark></span
							>
							<span
								><mark class="rounded bg-slate-200 px-1 line-through ring-1 ring-slate-300"
									>negado</mark
								></span
							>
						</div>
					{:else}
						<p class="text-sm text-slate-500">Selecione um registro.</p>
					{/if}
				</section>

				<section class="space-y-4">
					<div class="flex items-center justify-between">
						<h2 class="text-sm font-semibold text-slate-700">Procedimentos identificados</h2>
						{#if selecionada}
							<button
								type="button"
								onclick={() => selecionada && analisar(selecionada.id)}
								class="text-xs text-sky-700 hover:underline"
							>
								Analisar novamente
							</button>
						{/if}
					</div>

					{#if analisando && !achados}
						<p class="flex items-center gap-2 text-sm text-slate-500">
							<LoaderCircle size={16} class="animate-spin" /> Analisando o prontuário…
						</p>
					{:else if achados && selecionada}
						{#if !motor.conectado && temExemplo(selecionada.id)}
							<p
								class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
							>
								Resultado de exemplo, preenchido à mão. A leitura automática ainda será
								implementada.
							</p>
						{/if}
						{@render grupos(achados, !jaEnviada(selecionada.id))}

						{#if jaEnviada(selecionada.id)}
							<p class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
								Este registro já foi enviado ao faturamento.
								<a href="/solucao/faturamento" class="font-medium underline"
									>Ver na fila de revisão</a
								>
							</p>
						{:else}
							<button
								type="button"
								onclick={enviar}
								disabled={!marcados[selecionada.id]?.length}
								class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
							>
								<Send size={16} />
								Enviar {marcados[selecionada.id]?.length ?? 0} exame(s) + consulta para revisão
							</button>
							<p class="text-xs text-slate-500">
								Nada é faturado sem a aprovação da faturista na fila de revisão.
							</p>
						{/if}
					{/if}
				</section>
			</div>
		{:else if aba === 'texto'}
			<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
				<section class="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
					<label for="texto-livre" class="block text-sm font-semibold text-slate-700">
						Cole o texto de qualquer prontuário
					</label>
					<p class="text-xs text-slate-500">
						Funciona com o texto de qualquer sistema. Use apenas dados fictícios.
					</p>
					<textarea
						id="texto-livre"
						rows="8"
						bind:value={textoLivre}
						class="block w-full rounded-lg border border-slate-300 p-3 text-[15px] leading-7 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
					></textarea>
					<button
						type="button"
						onclick={analisarTextoLivre}
						disabled={!textoLivre.trim() || analisando}
						class="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-40"
					>
						{#if analisando}<LoaderCircle size={16} class="animate-spin" />{:else}<Sparkles
								size={16}
							/>{/if}
						Analisar
					</button>
					{#if achadosLivres}
						<div class="border-t border-slate-100 pt-4">
							<TextoDestacado texto={textoLivre} achados={achadosLivres} />
						</div>
					{/if}
				</section>
				<section class="space-y-4">
					<h2 class="text-sm font-semibold text-slate-700">Resultado</h2>
					{#if achadosLivres}
						{@render grupos(achadosLivres, false)}
					{:else}
						<p class="text-sm text-slate-500">Clique em Analisar.</p>
					{/if}
				</section>
			</div>
		{:else}
			<section class="rounded-xl border border-slate-200 bg-white">
				<header class="border-b border-slate-100 p-6">
					<h2 class="text-lg font-semibold text-slate-900">
						Exames solicitados e ainda não realizados
					</h2>
					<p class="text-sm text-slate-500">
						Pacientes que podem estar esperando um exame. Ajuda a regulação a não perder ninguém.
					</p>
				</header>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="bg-slate-50 text-left text-xs text-slate-500 uppercase">
							<tr>
								<th class="px-6 py-3 font-medium">Paciente</th>
								<th class="px-6 py-3 font-medium">Exame solicitado</th>
								<th class="px-6 py-3 font-medium">Pedido em</th>
								<th class="px-6 py-3 font-medium">Médico</th>
								<th class="px-6 py-3 font-medium">Trecho</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each pendencias as { evolucao, achado } (`${evolucao.id}:${achado.exame.id}`)}
								<tr>
									<td class="px-6 py-3 font-medium text-slate-900">
										{pacientes.find((p) => p.id === evolucao.pacienteId)?.nome}
									</td>
									<td class="px-6 py-3">{achado.exame.nome}</td>
									<td class="px-6 py-3 whitespace-nowrap">{evolucao.data}</td>
									<td class="px-6 py-3 whitespace-nowrap">{evolucao.autor}</td>
									<td class="px-6 py-3 text-slate-500 italic">“{achado.trecho}”</td>
								</tr>
							{:else}
								<tr>
									<td colspan="5" class="px-6 py-6 text-center text-slate-500">
										Nenhum exame pendente.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	</main>
</div>

{#if importando}
	<ImportarProntuario onfechar={() => (importando = false)} />
{/if}

{#if aviso}
	<div
		role="status"
		class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
	>
		{aviso}
	</div>
{/if}
