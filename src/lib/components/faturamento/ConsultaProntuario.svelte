<script lang="ts">
	import { Phone, Plus } from '@lucide/svelte';
	import { pacientes } from '#lib/data/paciente.js';
	import { evolucoesDoPaciente } from '#lib/evolucoes.svelte.js';
	import { lancadosDoPaciente } from '#lib/lancamentos.svelte.js';

	interface Props {
		pacienteId: string;
		onlancar: (pacienteId: string) => void;
		onaviso: (mensagem: string) => void;
	}

	let { pacienteId = $bindable(), onlancar, onaviso }: Props = $props();

	const paciente = $derived(pacientes.find((p) => p.id === pacienteId)!);
	const evolucoes = $derived(evolucoesDoPaciente(pacienteId));
</script>

<section class="flex h-full min-h-[640px] border border-slate-300 bg-white">
	<aside class="flex w-64 shrink-0 flex-col border-r border-slate-300">
		<header class="border-b border-slate-300 bg-[#e3e7eb] px-3 py-1.5">
			<h2 class="text-[11px] font-bold text-slate-700 uppercase">Atendimentos da competência</h2>
		</header>
		<ul class="flex-1 overflow-y-auto">
			{#each pacientes as p (p.id)}
				{@const total = lancadosDoPaciente(p.id).length}
				<li>
					<button
						type="button"
						onclick={() => (pacienteId = p.id)}
						class={[
							'w-full border-b border-slate-100 px-3 py-2 text-left',
							p.id === pacienteId ? 'bg-[#bcd4ee]' : 'hover:bg-slate-50'
						]}
					>
						<p class="truncate text-[11px] font-semibold uppercase">{p.nome}</p>
						<p class="text-[10px] text-slate-500">Atend. {p.atendimento} · {p.setor}</p>
						<span
							class={[
								'mt-1 inline-block px-1.5 text-[10px] font-semibold',
								total ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-700'
							]}
						>
							{total} procedimento(s) lançado(s)
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</aside>

	<div class="flex min-w-0 flex-1 flex-col">
		<div class="flex items-center gap-3 border-b border-slate-300 bg-[#f3f5f7] px-3 py-2">
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-bold uppercase">{paciente.nome}</p>
				<p class="text-[11px] text-slate-600">
					Pront. {paciente.prontuario} · Atend. {paciente.atendimento} · {paciente.setor} · CID
					{paciente.cid}
				</p>
			</div>
			<button
				type="button"
				onclick={() => onaviso('Ramal 2231: médico em atendimento. Tente novamente mais tarde.')}
				class="flex items-center gap-1.5 border border-slate-400 bg-[#e3e7eb] px-2 py-1 text-[11px] hover:bg-[#d8dde2]"
			>
				<Phone size={14} /> Ligar para o médico
			</button>
			<button
				type="button"
				onclick={() => onlancar(pacienteId)}
				class="flex items-center gap-1.5 bg-[#1f3d63] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#2a4f7d]"
			>
				<Plus size={14} /> Lançar procedimento
			</button>
		</div>

		<ol class="flex-1 divide-y divide-slate-200 overflow-y-auto">
			{#each evolucoes as evolucao (evolucao.id)}
				<li class="px-4 py-3">
					<p class="mb-1 text-[11px] text-slate-500 uppercase">
						{evolucao.data} · {evolucao.tipo} · {evolucao.autor}
					</p>
					<p class="text-[13px] leading-6 whitespace-pre-line text-slate-800">{evolucao.texto}</p>
				</li>
			{:else}
				<li class="px-4 py-3 text-sm text-slate-500">Nenhuma evolução registrada.</li>
			{/each}
		</ol>
	</div>
</section>
