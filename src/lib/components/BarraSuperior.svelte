<script lang="ts" module>
	export type Cenario = 'atual' | 'solucao';
</script>

<script lang="ts">
	import { CircleQuestionMark, Power, Settings } from '@lucide/svelte';

	let { modulo, cenario }: { modulo: string; cenario: Cenario } = $props();
</script>

<header class="flex h-11 shrink-0 items-center gap-6 border-b border-slate-300 bg-white px-3">
	<a href="/" title="Voltar ao início" class="text-[22px] leading-none tracking-tight">
		<span class="font-bold text-emerald-700">pep</span><span class="font-light text-sky-700"
			>escola</span
		>
	</a>
	<span class="hidden text-[15px] text-slate-500 uppercase md:inline">
		Prontuário eletrônico do paciente
	</span>
	<span class="text-[15px] text-sky-600 uppercase">{modulo}</span>

	<div class="ml-auto flex items-center gap-4 text-slate-600">
		<a
			href="/"
			class={[
				'border px-2 py-0.5 text-[11px] font-bold uppercase',
				cenario === 'atual'
					? 'border-slate-400 bg-slate-100 text-slate-700'
					: 'border-emerald-500 bg-emerald-50 text-emerald-800'
			]}
		>
			{cenario === 'atual' ? 'Sistema atual' : 'Com a nossa solução'}
		</a>
		<span class="hidden text-xs lg:inline">Versão: PEP-HACKFEST.2026.11 · DEMO</span>
		<button type="button" aria-label="Ajuda" class="hover:text-sky-700">
			<CircleQuestionMark size={20} />
		</button>
		<button type="button" aria-label="Configurações" class="hover:text-sky-700">
			<Settings size={20} />
		</button>
		<a href="/" aria-label="Sair" class="hover:text-red-700">
			<Power size={20} />
		</a>
	</div>
</header>
