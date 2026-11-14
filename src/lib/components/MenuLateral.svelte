<script lang="ts">
	import { ChevronDown, ChevronUp, List } from '@lucide/svelte';
	import type { ItemMenu } from '#lib/data/menus.js';

	interface Props {
		itens: ItemMenu[];
		topo?: string;
		/** Rótulo do item ativo; se omitido, usa o campo `ativo` dos itens. */
		ativo?: string;
		onselecionar?: (rotulo: string) => void;
	}

	let { itens, topo = 'Lista de Pacientes', ativo, onselecionar }: Props = $props();

	const estaAtivo = (item: ItemMenu) => (ativo ? item.rotulo === ativo : !!item.ativo);
</script>

<nav aria-label="Módulos" class="flex w-40 shrink-0 flex-col bg-[#d3dbe3] text-slate-700">
	<button
		type="button"
		class="flex items-center gap-2 border-b border-[#b9c4cf] bg-[#e9edf1] px-2 py-2 text-xs"
	>
		<span class="flex size-8 items-center justify-center bg-[#3f6687] text-white">
			<List size={18} />
		</span>
		{topo}
	</button>

	<div class="flex h-5 items-center justify-center bg-[#4d7193] text-white" aria-hidden="true">
		<ChevronUp size={14} />
	</div>

	<ul class="flex-1 overflow-y-auto py-1">
		{#each itens as item (item.rotulo)}
			<li>
				<button
					type="button"
					aria-current={estaAtivo(item) ? 'page' : undefined}
					onclick={() => onselecionar?.(item.rotulo)}
					class={[
						'relative flex w-full items-center gap-2 px-2 py-2 text-left text-[11px] uppercase',
						estaAtivo(item) ? 'bg-[#eef2f6] font-semibold text-slate-900' : 'hover:bg-[#dfe6ec]'
					]}
				>
					<span
						class={[
							'flex size-8 shrink-0 items-center justify-center border',
							estaAtivo(item)
								? 'border-[#3f6687] bg-[#3f6687] text-white'
								: 'border-[#b9c4cf] bg-[#f4f6f8] text-[#3f6687]'
						]}
					>
						<item.icone size={18} />
					</span>
					{item.rotulo}
					{#if estaAtivo(item)}
						<span
							class="absolute top-1/2 right-0 size-0 -translate-y-1/2 border-y-8 border-r-8 border-y-transparent border-r-white"
							aria-hidden="true"
						></span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>

	<div class="flex h-5 items-center justify-center bg-[#4d7193] text-white" aria-hidden="true">
		<ChevronDown size={14} />
	</div>
</nav>
