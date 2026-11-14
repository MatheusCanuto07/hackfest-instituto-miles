<script lang="ts">
	import { Flag, ListChecks, UserRound, Volume2 } from '@lucide/svelte';
	import type { Paciente } from '#lib/data/paciente.js';

	let { paciente }: { paciente: Paciente } = $props();
</script>

<section
	class="flex shrink-0 items-center gap-3 border-b border-slate-300 bg-[#eef1f4] px-3 py-1.5"
>
	<span
		class="flex size-12 shrink-0 items-center justify-center border border-slate-300 bg-slate-200 text-slate-500"
	>
		<UserRound size={30} />
	</span>
	<div class="min-w-0 flex-1 leading-tight">
		<p class="truncate text-[15px] font-bold text-slate-800 uppercase">
			{paciente.nome}
			<span class="ml-1 text-[10px] font-normal text-slate-500 normal-case">(fictício)</span>
		</p>
		<p class="truncate text-xs text-slate-600">
			{paciente.sexo === 'F' ? 'Feminino' : 'Masculino'}, {paciente.idade} Anos, {paciente.convenio},
			{paciente.setor.toUpperCase()}, {paciente.tipoAtendimento.toUpperCase()} · {paciente.leito.toUpperCase()}
		</p>
		<p class="truncate text-[11px] text-slate-500">
			Pront. {paciente.prontuario} · Atend. {paciente.atendimento} · CID {paciente.cid}
		</p>
	</div>
	<button type="button" aria-label="Chamar paciente" class="shrink-0 text-sky-700">
		<Volume2 size={22} />
	</button>

	<div class="flex shrink-0 items-center gap-3">
		{#each paciente.alergias as alergia (alergia)}
			<span
				class="border border-red-300 bg-red-50 px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-red-700 uppercase"
			>
				Alergia: {alergia}
			</span>
		{/each}
		<span class="flex items-center gap-1 text-slate-600">
			<ListChecks size={20} />
			<span class="text-sm font-semibold">0</span>
		</span>
		<Flag size={20} class="text-sky-800" />
	</div>
</section>
