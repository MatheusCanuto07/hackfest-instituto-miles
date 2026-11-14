const PROPRIEDADES = [
	'boxSizing',
	'width',
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
	'paddingTop',
	'paddingRight',
	'paddingBottom',
	'paddingLeft',
	'fontFamily',
	'fontSize',
	'fontWeight',
	'fontStyle',
	'letterSpacing',
	'lineHeight',
	'tabSize',
	'textTransform',
	'wordSpacing',
	'textIndent'
] as const;

/** Posição (em px, relativa ao textarea) do caractere `posicao`, via div espelho. */
export function coordenadasDoCursor(textarea: HTMLTextAreaElement, posicao: number) {
	const espelho = document.createElement('div');
	const estilo = getComputedStyle(textarea);
	for (const p of PROPRIEDADES) espelho.style[p] = estilo[p];
	Object.assign(espelho.style, {
		position: 'absolute',
		visibility: 'hidden',
		top: '0',
		left: '-9999px',
		whiteSpace: 'pre-wrap',
		overflowWrap: 'break-word'
	});

	espelho.textContent = textarea.value.slice(0, posicao);
	const marcador = document.createElement('span');
	marcador.textContent = textarea.value.slice(posicao) || '.';
	espelho.appendChild(marcador);
	document.body.appendChild(espelho);

	const coords = {
		top: marcador.offsetTop - textarea.scrollTop,
		left: marcador.offsetLeft - textarea.scrollLeft,
		altura: parseFloat(estilo.lineHeight) || parseFloat(estilo.fontSize) * 1.5
	};
	document.body.removeChild(espelho);
	return coords;
}
