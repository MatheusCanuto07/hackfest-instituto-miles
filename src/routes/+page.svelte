<script lang="ts">
	import { Receipt, Stethoscope, Trash2 } from '@lucide/svelte';
	import { limparMemoria } from '#lib/armazenamento.js';

	const secoes = [
		{
			titulo: 'Sistema atual',
			descricao:
				'O médico registra a evolução e os exames realizados em um único campo de texto livre. O faturamento precisa ler, interpretar e lançar cada procedimento manualmente.',
			base: '/atual',
			destaque: 'border-slate-300',
			etiqueta: 'bg-slate-100 text-slate-700'
		},
		{
			titulo: 'Com a nossa solução',
			descricao:
				'O médico preenche a anamnese e lança os exames complementares. Cada prontuário assinado vira um registro de consulta e um registro para cada exame no faturamento, prontos para revisão.',
			base: '/solucao',
			destaque: 'border-emerald-400',
			etiqueta: 'bg-emerald-50 text-emerald-800'
		}
	];
</script>

<svelte:head>
	<title>Protótipo · Hackfest MILES 2026</title>
</svelte:head>

<div class="min-h-screen bg-[#f2f4f6] text-slate-800">
	<header class="flex h-11 items-center gap-6 border-b border-slate-300 bg-white px-4">
		<span class="text-[22px] leading-none tracking-tight">
			<span class="font-bold text-emerald-700">pep</span><span class="font-light text-sky-700"
				>escola</span
			>
		</span>
		<span class="text-[15px] text-slate-500 uppercase">Protótipo · Trilha Faturamento</span>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-10">
		<h1 class="text-2xl font-semibold text-slate-900">
			Comunicação entre o médico e o faturamento
		</h1>
		<p class="mt-2 max-w-3xl text-slate-600">
			Hackfest MILES 2026. Compare como o fluxo funciona hoje e como fica com a nossa solução, pela
			visão de cada profissional. Todos os dados são fictícios.
		</p>

		<div class="mt-8 grid gap-6 md:grid-cols-2">
			{#each secoes as secao (secao.base)}
				<section class={['flex flex-col border-2 bg-white p-6', secao.destaque]}>
					<span class={['self-start px-2 py-0.5 text-xs font-bold uppercase', secao.etiqueta]}>
						{secao.titulo}
					</span>
					<p class="mt-3 flex-1 text-sm leading-6 text-slate-600">{secao.descricao}</p>
					<div class="mt-6 grid grid-cols-2 gap-3">
						<a
							href="{secao.base}/faturamento"
							class="flex items-center justify-center gap-2 border border-slate-400 bg-[#e3e7eb] px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-[#d8dde2]"
						>
							<Receipt size={18} /> Visão Faturamento
						</a>
						<a
							href="{secao.base}/medico"
							class="flex items-center justify-center gap-2 bg-sky-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
						>
							<Stethoscope size={18} /> Visão Médico
						</a>
					</div>
				</section>
			{/each}
		</div>

		<!-- Assistente de faturamento: oculto por enquanto
		<section
			class="mt-6 flex flex-col gap-4 border-2 border-sky-400 bg-white p-6 md:flex-row md:items-center"
		>
			<div class="flex-1">
				<span class="bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-800 uppercase">
					Assistente de faturamento
				</span>
				<p class="mt-3 text-sm leading-6 text-slate-600">
					Site usado pela equipe do faturamento: lê o texto do prontuário, identifica os exames
					realizados (separando dos solicitados e negados), calcula olho e quantidade e envia para a
					fila de revisão.
				</p>
			</div>
			<a
				href="/assistente"
				class="flex items-center justify-center gap-2 bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
			>
				<Sparkles size={18} /> Abrir assistente
			</a>
		</section>
		-->

		<button
			type="button"
			onclick={() => {
				if (confirm('Apagar todos os prontuários, lançamentos e rascunhos salvos?'))
					limparMemoria();
			}}
			class="mt-8 flex items-center gap-1.5 border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
		>
			<Trash2 size={16} /> Limpar memória
		</button>
	</main>
</div>
