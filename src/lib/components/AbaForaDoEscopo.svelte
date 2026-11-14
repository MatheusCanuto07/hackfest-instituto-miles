<script lang="ts">
	let { aba, foco, onvoltar }: { aba: string; foco: string; onvoltar: () => void } = $props();
</script>

<div
	class="mx-auto max-w-xl border border-slate-300 bg-white p-6 text-center text-sm text-slate-600"
>
	A aba <strong>{aba}</strong> não faz parte deste protótipo. O foco está na aba
	<button type="button" class="text-sky-700 underline" onclick={onvoltar}>{foco}</button>.
</div>
