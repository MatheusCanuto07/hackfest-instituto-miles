<script lang="ts">
	import {
		ArrowLeft,
		Cpu,
		FileText,
		LoaderCircle,
		Plus,
		Send,
		ShieldCheck,
		Sparkles,
		X
	} from '@lucide/svelte';
	import TextoMarcado from '#lib/components/ia/TextoMarcado.svelte';
	import { EXAMES, VALOR_SIGTAP } from '#lib/data/exames.js';
	import { pacientes, type Evolucao } from '#lib/data/paciente.js';
	import { agora, evolucoes } from '#lib/evolucoes.svelte.js';
	import {
		ROTULO_SITUACAO,
		quantidadePara,
		type ItemExtraido,
		type Olho,
		type Situacao
	} from '#lib/extracao.js';
	import { chaveEnvio, ia, processar, salvarIA } from '#lib/ia.svelte.js';
	import { adicionarDaIA } from '#lib/revisao.svelte.js';

	const COR_SITUACAO: Record<Situacao, string> = {
		realizado: 'border-emerald-300 bg-emerald-50 text-emerald-800',
		solicitado: 'border-sky-300 bg-sky-50 text-sky-800',
		negado: 'border-slate-300 bg-slate-100 text-slate-600'
	};
	const real = (valor: number) =>
		valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	const nomeExame = (id: string) => EXAMES.find((e) => e.id === id)?.nome ?? id;
	const sigtap = (id: string) => EXAMES.find((e) => e.id === id)?.sigtap ?? '';
	const nomePaciente = (id: string) => pacientes.find((p) => p.id === id)?.nome ?? '';

	let status = $state<{ online: boolean; modelo: string } | null>(null);
	let aba = $state<'registros' | 'colar'>('registros');
	let selecionadoId = $state<string | null>(null);
	let processando = $state<string[]>([]);
	let aviso = $state<string | null>(null);
	let textoColado = $state('');
	let pacienteColado = $state(pacientes[0].id);
	let exameManual = $state('');

	const registros = $derived<Evolucao[]>([...ia.colados, ...evolucoes]);
	const registro = $derived(registros.find((r) => r.id === selecionadoId) ?? registros[0] ?? null);
	const resultado = $derived(registro ? ia.resultados[registro.id] : undefined);
	const porSituacao = (s: Situacao) => resultado?.itens.filter((i) => i.situacao === s) ?? [];
	const realizados = $derived(porSituacao('realizado'));
	const solicitados = $derived(porSituacao('solicitado'));
	const negados = $derived(porSituacao('negado'));
	const enviado = (item: ItemExtraido) =>
		!!registro && ia.enviados.includes(chaveEnvio(registro.id, item.exameId));
	const pendentesEnvio = $derived(realizados.filter((i) => !enviado(i)));

	const indicadores = $derived.by(() => {
		const todos = Object.values(ia.resultados).flatMap((r) => r.itens);
		const feitos = todos.filter((i) => i.situacao === 'realizado');
		return {
			processados: registros.filter((r) => ia.resultados[r.id]).length,
			realizados: feitos.length,
			valor: feitos.reduce((s, i) => s + (VALOR_SIGTAP[i.exameId] ?? 0) * i.quantidade, 0),
			pendentes: todos.filter((i) => i.situacao === 'solicitado').length,
			enviados: ia.enviados.length
		};
	});

	$effect(() => {
		fetch('/api/extrair')
			.then((r) => r.json())
			.then((s) => (status = s))
			.catch(() => (status = { online: false, modelo: '' }));
	});

	function mostrarAviso(mensagem: string) {
		aviso = mensagem;
		setTimeout(() => (aviso = null), 4500);
	}

	async function processarRegistro(r: Evolucao) {
		processando = [...processando, r.id];
		try {
			const res = await processar(r);
			if (res.aviso) mostrarAviso(res.aviso);
		} finally {
			processando = processando.filter((id) => id !== r.id);
		}
	}

	async function processarTodos() {
		for (const r of registros.filter((r) => !ia.resultados[r.id])) {
			selecionadoId = r.id;
			await processarRegistro(r);
		}
	}

	async function processarColado() {
		if (!textoColado.trim()) return;
		const novo: Evolucao = {
			id: crypto.randomUUID(),
			pacienteId: pacienteColado,
			data: agora(),
			autor: 'Texto colado',
			tipo: 'Texto colado de outro sistema',
			texto: textoColado.trim()
		};
		ia.colados.unshift(novo);
		salvarIA();
		textoColado = '';
		aba = 'registros';
		selecionadoId = novo.id;
		await processarRegistro(novo);
	}

	function alterar(item: ItemExtraido, mudanca: Partial<ItemExtraido>) {
		Object.assign(item, mudanca);
		if ('olho' in mudanca) item.quantidade = quantidadePara(item.exameId, item.olho);
		salvarIA();
	}

	function remover(item: ItemExtraido) {
		if (!resultado) return;
		resultado.itens = resultado.itens.filter((i) => i !== item);
		salvarIA();
	}

	function adicionarManual() {
		if (!resultado || !exameManual) return;
		resultado.itens.push({
			exameId: exameManual,
			situacao: 'realizado',
			olho: null,
			quantidade: 1,
			trecho: 'Adicionado manualmente pela faturista',
			confianca: 1
		});
		exameManual = '';
		salvarIA();
	}

	function enviar(itens: ItemExtraido[]) {
		if (!registro || !itens.length) return;
		adicionarDaIA(registro, itens);
		ia.enviados.push(...itens.map((i) => chaveEnvio(registro.id, i.exameId)));
		salvarIA();
		mostrarAviso(
			`${itens.length} exame(s) enviado(s) para a revisão do faturamento como "Pendente de revisão".`
		);
	}
</script>

<svelte:head>
	<title>Assistente de Procedimentos · IA local</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-50 text-slate-800">
	<header class="flex flex-wrap items-center gap-4 bg-slate-900 px-6 py-3 text-white">
		<a href="/" class="flex items-center gap-1 text-sm text-slate-300 hover:text-white">
			<ArrowLeft size={16} /> Início
		</a>
		<div class="flex items-center gap-2">
			<Sparkles size={22} class="text-emerald-400" />
			<div class="leading-tight">
				<p class="text-lg font-semibold">Assistente de Procedimentos</p>
				<p class="text-xs text-slate-400">Lê o prontuário e prepara o faturamento</p>
			</div>
		</div>
		<div class="ml-auto flex flex-wrap items-center gap-3 text-xs">
			<span class="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1">
				<ShieldCheck size={14} class="text-emerald-400" /> Processamento local: nenhum dado sai do hospital
			</span>
			{#if status}
				<span
					class={[
						'flex items-center gap-1.5 rounded-full px-3 py-1',
						status.online ? 'bg-emerald-900 text-emerald-100' : 'bg-amber-900 text-amber-100'
					]}
				>
					<Cpu size={14} />
					{status.online ? `IA local ativa · ${status.modelo}` : 'IA indisponível · usando regras'}
				</span>
			{/if}
			<a
				href="/solucao/faturamento"
				class="rounded-full bg-emerald-600 px-3 py-1 font-semibold hover:bg-emerald-500"
			>
				Abrir fila de revisão do faturamento
			</a>
		</div>
	</header>

	<section class="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-5">
		{#each [['Registros processados', `${indicadores.processados} de ${registros.length}`], ['Exames realizados encontrados', String(indicadores.realizados)], ['Valor SIGTAP identificado', real(indicadores.valor)], ['Exames solicitados (cuidado pendente)', String(indicadores.pendentes)], ['Enviados ao faturamento', String(indicadores.enviados)]] as [rotulo, valor] (rotulo)}
			<div class="rounded-lg border border-slate-200 bg-white px-4 py-3">
				<p class="text-xs text-slate-500">{rotulo}</p>
				<p class="text-xl font-semibold text-slate-900">{valor}</p>
			</div>
		{/each}
	</section>

	<main class="grid flex-1 gap-4 px-6 pb-6 lg:grid-cols-[18rem_minmax(0,1fr)_26rem]">
		<aside class="flex flex-col rounded-lg border border-slate-200 bg-white">
			<div role="tablist" class="flex border-b border-slate-200 text-sm">
				{#each [['registros', 'Registros'], ['colar', 'Colar texto']] as const as [id, rotulo] (id)}
					<button
						type="button"
						role="tab"
						aria-selected={aba === id}
						onclick={() => (aba = id)}
						class={[
							'flex-1 px-3 py-2',
							aba === id
								? 'border-b-2 border-emerald-600 font-semibold text-emerald-800'
								: 'text-slate-500'
						]}
					>
						{rotulo}
					</button>
				{/each}
			</div>

			{#if aba === 'registros'}
				<div class="border-b border-slate-100 p-3">
					<button
						type="button"
						onclick={processarTodos}
						disabled={processando.length > 0 || registros.every((r) => ia.resultados[r.id])}
						class="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
					>
						<Sparkles size={16} /> Processar todos os registros
					</button>
				</div>
				<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
					{#each registros as r (r.id)}
						{@const res = ia.resultados[r.id]}
						<li>
							<button
								type="button"
								onclick={() => (selecionadoId = r.id)}
								class={[
									'w-full px-3 py-2.5 text-left',
									registro?.id === r.id ? 'bg-emerald-50' : 'hover:bg-slate-50'
								]}
							>
								<p class="truncate text-sm font-semibold">{nomePaciente(r.pacienteId)}</p>
								<p class="text-xs text-slate-500">{r.data} · {r.tipo}</p>
								<p class="mt-1 text-xs">
									{#if processando.includes(r.id)}
										<span class="text-amber-700">Processando…</span>
									{:else if res}
										<span class="text-emerald-700">
											{res.itens.filter((i) => i.situacao === 'realizado').length} realizado(s)
										</span>
										·
										<span class="text-sky-700">
											{res.itens.filter((i) => i.situacao === 'solicitado').length} solicitado(s)
										</span>
									{:else}
										<span class="text-slate-400">Não processado</span>
									{/if}
								</p>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="flex flex-1 flex-col gap-3 p-3">
					<p class="text-xs text-slate-500">
						Cole o texto de um registro de <strong>qualquer sistema</strong> de prontuário.
					</p>
					<label class="text-xs text-slate-600">
						Paciente
						<select
							bind:value={pacienteColado}
							class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
						>
							{#each pacientes as p (p.id)}
								<option value={p.id}>{p.nome}</option>
							{/each}
						</select>
					</label>
					<label class="flex flex-1 flex-col text-xs text-slate-600">
						Texto do registro
						<textarea
							bind:value={textoColado}
							placeholder="Ex.: Feito tono: PIO OD 22 / OE 24. Mapeamento de retina AO sem alterações. Solicito OCT de nervo óptico."
							class="mt-1 min-h-48 flex-1 rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
						></textarea>
					</label>
					<button
						type="button"
						onclick={processarColado}
						disabled={!textoColado.trim()}
						class="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
					>
						<Sparkles size={16} /> Processar texto
					</button>
				</div>
			{/if}
		</aside>

		<section class="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white">
			{#if registro}
				<header class="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
					<FileText size={18} class="text-slate-400" />
					<div class="min-w-0">
						<p class="truncate font-semibold">{nomePaciente(registro.pacienteId)}</p>
						<p class="text-xs text-slate-500">
							{registro.tipo} · {registro.data} · {registro.autor}
						</p>
					</div>
					<button
						type="button"
						onclick={() => processarRegistro(registro)}
						disabled={processando.includes(registro.id)}
						class="ml-auto flex items-center gap-2 rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
					>
						{#if processando.includes(registro.id)}
							<LoaderCircle size={16} class="animate-spin" /> Processando…
						{:else}
							<Sparkles size={16} />
							{resultado ? 'Processar novamente' : 'Processar com IA'}
						{/if}
					</button>
				</header>
				<div class="flex-1 px-5 py-4">
					<TextoMarcado texto={registro.texto} itens={resultado?.itens ?? []} />
				</div>
				<footer
					class="flex flex-wrap items-center gap-4 border-t border-slate-100 px-5 py-2 text-xs text-slate-500"
				>
					<span class="flex items-center gap-1.5">
						<span class="size-3 rounded bg-emerald-200"></span> Realizado (faturar)
					</span>
					<span class="flex items-center gap-1.5">
						<span class="size-3 rounded bg-sky-200"></span> Solicitado (não faturar agora)
					</span>
					<span class="flex items-center gap-1.5">
						<span class="size-3 rounded bg-slate-300"></span> Não realizado
					</span>
					{#if resultado}
						<span class="ml-auto">
							{resultado.modo === 'ia'
								? `Lido pela IA local (${resultado.modelo}) em ${(resultado.ms / 1000).toFixed(1)} s`
								: 'Lido pelo leitor por regras (IA indisponível)'}
						</span>
					{/if}
				</footer>
			{:else}
				<p class="p-6 text-sm text-slate-500">Nenhum registro disponível.</p>
			{/if}
		</section>

		<aside class="flex flex-col gap-4">
			<section class="rounded-lg border border-emerald-200 bg-white">
				<header class="flex items-center gap-2 border-b border-emerald-100 px-4 py-3">
					<h2 class="text-sm font-semibold text-emerald-900">Realizados: vão para o faturamento</h2>
					<button
						type="button"
						onclick={() => enviar(pendentesEnvio)}
						disabled={!pendentesEnvio.length}
						class="ml-auto flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
					>
						<Send size={14} /> Enviar todos ({pendentesEnvio.length})
					</button>
				</header>
				{#if !resultado}
					<p class="px-4 py-4 text-sm text-slate-500">
						Processe o registro para ver os exames encontrados.
					</p>
				{:else}
					<ul class="divide-y divide-slate-100">
						{#each realizados as item (item.exameId + item.situacao)}
							{@const valor = (VALOR_SIGTAP[item.exameId] ?? 0) * item.quantidade}
							<li class="space-y-2 px-4 py-3">
								<div class="flex items-start gap-2">
									<div class="min-w-0 flex-1">
										<p class="text-sm font-semibold text-slate-900">{nomeExame(item.exameId)}</p>
										<p class="font-mono text-xs text-slate-500">
											SIGTAP {sigtap(item.exameId)} · {real(valor)}
										</p>
									</div>
									{#if enviado(item)}
										<span
											class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"
										>
											Enviado
										</span>
									{:else}
										<button
											type="button"
											aria-label="Remover {nomeExame(item.exameId)}"
											onclick={() => remover(item)}
											class="text-slate-400 hover:text-red-600"
										>
											<X size={16} />
										</button>
									{/if}
								</div>
								<blockquote
									class="border-l-2 border-emerald-300 pl-2 text-xs text-slate-600 italic"
								>
									“{item.trecho}”
								</blockquote>
								<div class="flex flex-wrap items-center gap-2 text-xs">
									<label class="flex items-center gap-1">
										Situação
										<select
											value={item.situacao}
											disabled={enviado(item)}
											onchange={(e) =>
												alterar(item, { situacao: e.currentTarget.value as Situacao })}
											class="rounded border border-slate-300 px-1 py-0.5"
										>
											{#each Object.entries(ROTULO_SITUACAO) as [id, rotulo] (id)}
												<option value={id}>{rotulo}</option>
											{/each}
										</select>
									</label>
									<label class="flex items-center gap-1">
										Olho
										<select
											value={item.olho ?? ''}
											disabled={enviado(item)}
											onchange={(e) =>
												alterar(item, { olho: (e.currentTarget.value || null) as Olho | null })}
											class="rounded border border-slate-300 px-1 py-0.5"
										>
											<option value="">—</option>
											<option value="OD">OD</option>
											<option value="OE">OE</option>
											<option value="AO">AO</option>
										</select>
									</label>
									<label class="flex items-center gap-1">
										Qtde.
										<input
											type="number"
											min="1"
											value={item.quantidade}
											disabled={enviado(item)}
											onchange={(e) =>
												alterar(item, { quantidade: Number(e.currentTarget.value) || 1 })}
											class="w-12 rounded border border-slate-300 px-1 py-0.5"
										/>
									</label>
									<span
										class="ml-auto flex items-center gap-1 text-slate-500"
										title="Confiança da leitura"
									>
										<span class="h-1.5 w-12 overflow-hidden rounded bg-slate-200">
											<span
												class="block h-full bg-emerald-500"
												style:width="{Math.round(item.confianca * 100)}%"
											></span>
										</span>
										{Math.round(item.confianca * 100)}%
									</span>
								</div>
								{#if !enviado(item)}
									<button
										type="button"
										onclick={() => enviar([item])}
										class="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
									>
										<Send size={12} /> Enviar este exame
									</button>
								{/if}
							</li>
						{:else}
							<li class="px-4 py-3 text-sm text-slate-500">Nenhum exame realizado encontrado.</li>
						{/each}
					</ul>
					<div class="flex gap-2 border-t border-slate-100 px-4 py-3">
						<label class="flex-1">
							<span class="sr-only">Adicionar exame que a IA não encontrou</span>
							<select
								bind:value={exameManual}
								class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
							>
								<option value="">Adicionar exame que a IA não encontrou…</option>
								{#each EXAMES as e (e.id)}
									<option value={e.id}>{e.nome}</option>
								{/each}
							</select>
						</label>
						<button
							type="button"
							onclick={adicionarManual}
							disabled={!exameManual}
							class="flex items-center gap-1 rounded-md border border-slate-300 px-2 text-xs hover:bg-slate-50 disabled:opacity-40"
						>
							<Plus size={14} /> Adicionar
						</button>
					</div>
				{/if}
			</section>

			{#if solicitados.length}
				<section class="rounded-lg border border-sky-200 bg-white">
					<header class="border-b border-sky-100 px-4 py-3">
						<h2 class="text-sm font-semibold text-sky-900">Solicitados: cuidado pendente</h2>
						<p class="text-xs text-sky-700">
							Pedidos e ainda não realizados. Não entram no faturamento agora; ajudam a acompanhar o
							paciente.
						</p>
					</header>
					<ul class="divide-y divide-slate-100">
						{#each solicitados as item (item.exameId + item.situacao)}
							<li class="px-4 py-2.5">
								<div class="flex items-center gap-2">
									<p class="flex-1 text-sm">{nomeExame(item.exameId)}</p>
									<button
										type="button"
										onclick={() => alterar(item, { situacao: 'realizado' })}
										class="text-xs text-sky-700 hover:underline"
									>
										Marcar como realizado
									</button>
								</div>
								<p class="text-xs text-slate-500 italic">“{item.trecho}”</p>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if negados.length}
				<section class="rounded-lg border border-slate-200 bg-white">
					<header class="border-b border-slate-100 px-4 py-3">
						<h2 class="text-sm font-semibold text-slate-700">Citados como não realizados</h2>
					</header>
					<ul class="divide-y divide-slate-100">
						{#each negados as item (item.exameId + item.situacao)}
							<li class="px-4 py-2.5">
								<p class="text-sm">{nomeExame(item.exameId)}</p>
								<p class="text-xs text-slate-500 italic">“{item.trecho}”</p>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if registro && resultado}
				<p class="px-1 text-xs text-slate-500">
					Paciente: <strong>{nomePaciente(registro.pacienteId)}</strong>. Os exames enviados entram
					na fila do faturamento como <strong>Pendente de revisão</strong>.
				</p>
			{/if}
		</aside>
	</main>
</div>

{#if aviso}
	<div
		role="status"
		class="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
	>
		{aviso}
	</div>
{/if}
