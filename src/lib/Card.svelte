<script lang="ts">
import type { CardType } from './store';

export let card: CardType;

const isRed = card.suit === '♦️' || card.suit === '♥️';

const classNames = [
	'position',
	'border',
	'border-2',
	isRed ? 'border-red-600' : 'border-black',
	'w-24',
	'h-36',
	'rounded-md',
	'flex',
	'flex-col',
	'items-center',
	'text-3xl',
	'justify-center',
	'bg-white',
	'cursor-pointer',
	isRed ? 'text-red-600' : 'text-black',
	'bg-white'
];

let ref: HTMLDivElement | null = null;

let isDragging = false;
let x = 0;
let y = 0;

function handlePointerDown(e: PointerEvent) {
	ref?.setPointerCapture(e.pointerId);
	isDragging = true;
}

function handlePointerMove(e: PointerEvent) {
	if (isDragging) {
		x += e.movementX;
		y += e.movementY;
	}
}

function handlePointerUp(e: PointerEvent) {
  ref?.releasePointerCapture(e.pointerId);
	isDragging = false;
	x = 0;
	y = 0;
}

$: draggingStyles = `
	position: relative;
	transform: translate(${x}px, ${y}px);
	box-shadow: ${ isDragging ? '3px 3px 8px rgba(0, 0, 0, 0.1)' : 'none' };
	z-index: ${isDragging ? 1000 : 'initial'};
`;

</script>

<div
	bind:this={ref}
	on:pointerdown={handlePointerDown}
	on:pointermove={handlePointerMove}
	on:pointerup={handlePointerUp}
	class={classNames.join(' ')}
	style={draggingStyles}
>
	<span class="pointer-events-none select-none">{card.rank}</span>
	<span class="pointer-events-none select-none">{card.suit}</span>
</div>
