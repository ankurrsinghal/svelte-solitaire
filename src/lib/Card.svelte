<script lang="ts">
  import { getContext } from 'svelte';
import type { CardType, StoreProps } from './store';

export let card: CardType;

const isRed = card.suit === '♦️' || card.suit === '♥️';

const classNames = [
	'position',
	'w-24',
	'h-36',
	'rounded-md',
	'flex',
	'flex-col',
	'items-center',
	'text-3xl',
	'justify-center',
	'cursor-pointer',
	isRed ? 'text-red-600' : 'text-black',
	card.isFaceDown ? 'bg-red-500' : 'bg-white',
];

let ref: HTMLDivElement | null = null;

let isDragging = false;
let probablyDragging = false;
let x = 0;
let y = 0;

let dx = 0;
let dy = 0;

const store = getContext<StoreProps>('store');

function handleClick() {
	if (!isDragging) {
		// handle click here
	} else {
		isDragging = false;
	}
}

function handlePointerDown(e: PointerEvent) {
	if (card.isFaceDown) return;
	ref?.setPointerCapture(e.pointerId);
	probablyDragging = true;
}

function handlePointerMove(e: PointerEvent) {
	if (card.isFaceDown) return;
	if (isDragging) {
		x += e.movementX + dx;
		y += e.movementY + dy;
		if (probablyDragging) {
			dx = 0;
			dy = 0;
		}
	} else if (probablyDragging) {
		dx += e.movementX;
		dy += e.movementY;
		if (Math.abs(dx) > 2 && Math.abs(dy) > 2) {
			isDragging = true;
		}
	}
}

function handlePointerUp(e: PointerEvent) {
	if (card.isFaceDown) return;
  ref?.releasePointerCapture(e.pointerId);
	probablyDragging = false;
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
	on:click={handleClick}
	on:pointerdown={handlePointerDown}
	on:pointermove={handlePointerMove}
	on:pointerup={handlePointerUp}
	aria-hidden="true"
	class={classNames.join(' ')}
	style={draggingStyles}
>
	<!-- {#if !card.isFaceDown} -->
	<span class="pointer-events-none select-none">{card.rank}</span>
	<span class="pointer-events-none select-none">{card.suit}</span>
	<!-- {/if} -->
</div>
