<script lang="ts">
	import type { Snippet } from 'svelte';
	import { COMPETENCIA, codigosSetor } from '#lib/data/faturamento.js';
	import { pacientes, type Paciente } from '#lib/data/paciente.js';

	interface Props {
		paciente: Paciente;
		onir: (pacienteId: string) => void;
		extra?: Snippet;
	}

	let { paciente, onir, extra }: Props = $props();

	const posicao = $derived(pacientes.findIndex((p) => p.id === paciente.id));
	const digitos = (s: string) => s.replace(/\D/g, '');

	const campos = $derived([
		['Atendimento', paciente.atendimento, 'w-28'],
		['Data atend.', paciente.admissao, 'w-24'],
		['Paciente', digitos(paciente.prontuario), 'w-24'],
		['Nome do paciente', paciente.nome.toUpperCase(), 'w-72'],
		['Sexo', paciente.sexo, 'w-10'],
		['Idade', String(paciente.idade), 'w-12'],
		['Nascimento', paciente.nascimento, 'w-24'],
		['CNS', paciente.cns, 'w-36'],
		['Município', 'BELO HORIZONTE', 'w-32'],
		['Setor', `${codigosSetor[paciente.setor]} ${paciente.setor.toUpperCase()}`, 'w-36'],
		['CID principal', paciente.cid.toUpperCase(), 'w-80'],
		['Tipo', 'BPA-I', 'w-14'],
		['Competência', COMPETENCIA, 'w-20']
	]);

	const somenteLeitura =
		'h-6 border border-slate-300 bg-[#f3f5f7] px-1.5 text-[11px] leading-6 truncate';
</script>

<div class="border-b border-slate-200 px-3 py-2">
	<div class="mb-2 flex flex-wrap items-center gap-3">
		<p class="text-[10px] font-semibold text-slate-500 uppercase">Dados do atendimento</p>
		<label class="flex items-center gap-1.5 text-[11px] text-slate-600">
			Ir para
			<select
				value={paciente.id}
				onchange={(e) => onir(e.currentTarget.value)}
				class="h-6 border border-slate-400 bg-white px-1 text-[11px] focus:border-orange-400 focus:outline-none"
			>
				{#each pacientes as p (p.id)}
					<option value={p.id}>{p.atendimento} · {p.nome}</option>
				{/each}
			</select>
		</label>
		<span class="text-[11px] text-slate-500">Paciente {posicao + 1} de {pacientes.length}</span>
		{@render extra?.()}
	</div>
	<div class="flex flex-wrap items-end gap-x-2 gap-y-1.5">
		{#each campos as [rotulo, valor, largura] (rotulo)}
			<span class="flex flex-col gap-0.5 text-[10px] text-slate-600">
				{rotulo}
				<span class={[somenteLeitura, largura]}>{valor}</span>
			</span>
		{/each}
	</div>
</div>
