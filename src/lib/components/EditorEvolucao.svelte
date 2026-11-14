<script lang="ts">
	import { tick } from 'svelte';
	import { coordenadasDoCursor } from '#lib/caret.js';
	import type { Exame } from '#lib/data/exames.js';
	import { buscarExames, inserirLinha, linhaExame } from '#lib/prontuario.js';

	let { texto = $bindable('') }: { texto: string } = $props();

	let textarea: HTMLTextAreaElement;
	let selecao = { inicio: 0, fim: 0 };

	let menu = $state<{ inicio: number; consulta: string; top: number; left: number } | null>(null);
	let destacado = $state(0);
	const sugestoes = $derived(menu ? buscarExames(menu.consulta) : []);

	function lembrarSelecao() {
		selecao = { inicio: textarea.selectionStart, fim: textarea.selectionEnd };
	}

	function atualizarMenu() {
		lembrarSelecao();
		const cursor = textarea.selectionStart;
		const achado = /(?:^|\s)\/([\p{L}\d-]*)$/u.exec(texto.slice(0, cursor));
		if (!achado || textarea.selectionStart !== textarea.selectionEnd) {
			menu = null;
			return;
		}
		const inicio = cursor - achado[1].length - 1;
		const coords = coordenadasDoCursor(textarea, inicio);
		const largura = textarea.clientWidth;
		if (menu?.consulta !== achado[1]) destacado = 0;
		menu = {
			inicio,
			consulta: achado[1],
			top: coords.top + coords.altura + 4,
			left: Math.min(coords.left, Math.max(0, largura - 320))
		};
	}

	async function aplicar(inicio: number, fim: number, exame: Exame) {
		const resultado = inserirLinha(texto, inicio, fim, linhaExame(exame));
		texto = resultado.texto;
		menu = null;
		await tick();
		textarea.focus();
		textarea.setSelectionRange(resultado.cursor, resultado.cursor);
		lembrarSelecao();
	}

	export function inserirExame(exame: Exame) {
		return aplicar(selecao.inicio, selecao.fim, exame);
	}

	export async function usarModelo(modelo: string) {
		texto = modelo;
		await tick();
		textarea.focus();
		const fimPrimeiraLinha = texto.indexOf('\n');
		const cursor = fimPrimeiraLinha === -1 ? texto.length : fimPrimeiraLinha;
		textarea.setSelectionRange(cursor, cursor);
		lembrarSelecao();
	}

	function escolher(exame: Exame) {
		if (menu) aplicar(menu.inicio, textarea.selectionStart, exame);
	}

	function teclado(evento: KeyboardEvent) {
		if (!menu || sugestoes.length === 0) return;
		if (evento.key === 'ArrowDown') {
			evento.preventDefault();
			destacado = (destacado + 1) % sugestoes.length;
		} else if (evento.key === 'ArrowUp') {
			evento.preventDefault();
			destacado = (destacado - 1 + sugestoes.length) % sugestoes.length;
		} else if (evento.key === 'Enter' || evento.key === 'Tab') {
			evento.preventDefault();
			escolher(sugestoes[destacado]);
		} else if (evento.key === 'Escape') {
			evento.preventDefault();
			menu = null;
		}
	}
</script>

<div class="relative">
	<label for="evolucao" class="sr-only">Texto da evolução</label>
	<textarea
		id="evolucao"
		bind:this={textarea}
		bind:value={texto}
		oninput={atualizarMenu}
		onkeydown={teclado}
		onkeyup={(e) => {
			if (
				['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) &&
				!menu
			)
				lembrarSelecao();
		}}
		onclick={atualizarMenu}
		onselect={lembrarSelecao}
		onblur={() => setTimeout(() => (menu = null), 150)}
		spellcheck="true"
		placeholder="Descreva a evolução do paciente. Digite / para inserir um exame (ex.: /tono, /oct, /campo)."
		class="block min-h-[340px] w-full resize-y border border-slate-400 bg-white p-2 text-[13px] leading-6 text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
	></textarea>

	{#if menu}
		<div
			role="listbox"
			aria-label="Inserir exame"
			class="absolute z-20 w-80 overflow-hidden border border-slate-400 bg-white shadow-lg"
			style:top="{menu.top}px"
			style:left="{menu.left}px"
		>
			<p class="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
				{menu.consulta ? `Exames para “${menu.consulta}”` : 'Exames mais usados'}
			</p>
			{#each sugestoes as exame, i (exame.id)}
				<button
					type="button"
					role="option"
					aria-selected={i === destacado}
					onmousedown={(e) => {
						e.preventDefault();
						escolher(exame);
					}}
					onmouseenter={() => (destacado = i)}
					class={[
						'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm',
						i === destacado ? 'bg-sky-50 text-sky-900' : 'text-slate-700'
					]}
				>
					<span class="truncate">{exame.nome}</span>
					<span class="shrink-0 font-mono text-xs text-slate-400">/{exame.atalho}</span>
				</button>
			{:else}
				<p class="px-3 py-3 text-sm text-slate-500">Nenhum exame encontrado.</p>
			{/each}
		</div>
	{/if}
</div>
