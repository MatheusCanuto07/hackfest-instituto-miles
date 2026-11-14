<script lang="ts">
	import type { Snippet } from 'svelte';
	import BarraSuperior, { type Cenario } from './BarraSuperior.svelte';
	import MenuLateral from './MenuLateral.svelte';
	import type { ItemMenu } from '#lib/data/menus.js';

	interface Props {
		titulo: string;
		modulo: string;
		cenario: Cenario;
		menu: ItemMenu[];
		menuTopo?: string;
		menuAtivo?: string;
		onmenu?: (rotulo: string) => void;
		usuario: string;
		aviso?: string | null;
		children: Snippet;
		lateral?: Snippet;
	}

	let {
		titulo,
		modulo,
		cenario,
		menu,
		menuTopo,
		menuAtivo,
		onmenu,
		usuario,
		aviso,
		children,
		lateral
	}: Props = $props();
</script>

<svelte:head>
	<title>{titulo} · PEP</title>
</svelte:head>

<div class="flex h-screen flex-col bg-[#f2f4f6] text-slate-800">
	<BarraSuperior {modulo} {cenario} />

	<div class="flex min-h-0 flex-1">
		<MenuLateral itens={menu} topo={menuTopo} ativo={menuAtivo} onselecionar={onmenu} />
		<div class="flex min-w-0 flex-1 flex-col">
			{@render children()}
		</div>
		{@render lateral?.()}
	</div>

	<footer
		class="shrink-0 border-t border-slate-300 bg-[#dfe3e7] px-3 py-0.5 text-[11px] text-slate-600 uppercase"
	>
		{usuario} · Hospital Escola (fictício)
	</footer>
</div>

{#if aviso}
	<div
		role="status"
		class="fixed bottom-16 left-1/2 z-30 -translate-x-1/2 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
	>
		{aviso}
	</div>
{/if}
