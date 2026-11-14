<script lang="ts">
	const ABAS = [
		'Anamnese',
		'CID/Diagnóstico',
		'Alergias',
		'Prescrição',
		'Evolução',
		'Avaliação/Escores',
		'Bulário Online'
	];

	let { aba = $bindable('Evolução'), onmudar }: { aba?: string; onmudar?: (aba: string) => void } =
		$props();
</script>

<div role="tablist" class="flex shrink-0 gap-0.5 border-b border-slate-300 bg-white px-2 pt-1.5">
	{#each ABAS as nome (nome)}
		<button
			type="button"
			role="tab"
			aria-selected={aba === nome}
			onclick={() => {
				aba = nome;
				onmudar?.(nome);
			}}
			class={[
				'-mb-px border border-slate-300 px-3 py-1 text-xs',
				aba === nome
					? 'border-b-white bg-white font-semibold text-slate-900'
					: 'bg-[#e3e7eb] text-slate-600 hover:bg-[#d8dde2]'
			]}
		>
			{nome}
		</button>
	{/each}
</div>
