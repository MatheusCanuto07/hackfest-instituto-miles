<script lang="ts" module>
	export interface Janela {
		id: string;
		titulo: string;
	}
</script>

<script lang="ts">
	import {
		Bell,
		ChartColumn,
		FileSpreadsheet,
		FolderSearch,
		House,
		Menu,
		Power,
		Receipt,
		Settings,
		Users,
		Wallet,
		X
	} from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { Cenario } from './BarraSuperior.svelte';

	interface Props {
		titulo: string;
		cenario: Cenario;
		usuario: string;
		janelas: Janela[];
		ativa: string;
		onativar: (id: string) => void;
		onfechar?: (id: string) => void;
		aviso?: string | null;
		children: Snippet;
	}

	let { titulo, cenario, usuario, janelas, ativa, onativar, onfechar, aviso, children }: Props =
		$props();

	const atalhos = [House, Receipt, FileSpreadsheet, FolderSearch, Users, Wallet, ChartColumn];
	const hoje = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
</script>

<svelte:head>
	<title>{titulo} · PEP</title>
</svelte:head>

<div class="flex h-screen flex-col bg-[#e7ebef] text-slate-800">
	<header class="flex h-10 shrink-0 items-center gap-3 bg-[#1f3d63] px-3 text-white">
		<Menu size={20} />
		<a href="/" title="Voltar ao início" class="text-lg leading-none tracking-tight">
			<span class="font-bold">pep</span><span class="font-light">escola</span>
		</a>
		<a
			href="/"
			class={[
				'ml-2 border px-2 py-0.5 text-[10px] font-bold uppercase',
				cenario === 'atual'
					? 'border-slate-300 bg-white/10 text-white'
					: 'border-emerald-300 bg-emerald-500/20 text-emerald-100'
			]}
		>
			{cenario === 'atual' ? 'Sistema atual' : 'Com a nossa solução'}
		</a>
		<div class="ml-auto flex items-center gap-4">
			<div class="text-right text-[11px] leading-tight">
				<p class="font-semibold uppercase">Hospital Escola | {usuario}</p>
				<p class="text-slate-300">{hoje} · PEP · pt-BR</p>
			</div>
			<Bell size={18} />
			<Settings size={18} />
			<a href="/" aria-label="Sair"><Power size={18} /></a>
		</div>
	</header>

	<div class="flex h-8 shrink-0 items-end gap-0.5 border-b border-slate-300 bg-[#d9dfe5] px-12">
		{#each janelas as janela (janela.id)}
			<div
				class={[
					'flex h-7 items-center gap-2 border border-b-0 border-slate-300 px-3 text-xs',
					janela.id === ativa
						? 'bg-white font-semibold text-slate-900'
						: 'bg-[#eef1f4] text-slate-600'
				]}
			>
				<button type="button" onclick={() => onativar(janela.id)}>{janela.titulo}</button>
				{#if onfechar && janelas.length > 1}
					<button
						type="button"
						aria-label="Fechar {janela.titulo}"
						onclick={() => onfechar(janela.id)}
						class="text-slate-400 hover:text-slate-700"
					>
						<X size={12} />
					</button>
				{/if}
			</div>
		{/each}
	</div>

	<div class="flex min-h-0 flex-1">
		<nav
			aria-label="Atalhos"
			class="flex w-10 shrink-0 flex-col items-center gap-3 border-r border-slate-300 bg-white py-3 text-slate-500"
		>
			{#each atalhos as Icone, i (i)}
				<Icone size={18} />
			{/each}
		</nav>
		<div class="min-w-0 flex-1 overflow-auto p-2">
			{@render children()}
		</div>
	</div>
</div>

{#if aviso}
	<div
		role="status"
		class="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
	>
		{aviso}
	</div>
{/if}
