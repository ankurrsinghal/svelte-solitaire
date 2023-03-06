<script lang="ts">
  import { getContext } from 'svelte';
import type { CardType, StoreProps } from './store';

export let card: CardType;

$: isRed = card.suit === '♦️' || card.suit === '♥️';

$: classNames = [
	'position',
	'w-24',
	'h-36',
	'rounded-md',
	'flex',
	'flex-col',
	'items-center',
	'text-3xl',
	'justify-center',
	isRed ? 'text-red-600' : 'text-black',
	card.isFaceDown ? 'bg-red-500' : 'bg-white',
	card.isFaceDown ? 'pointer-events-none': 'pointer-events-auto',
	card.isFaceDown ? 'cursor-auto': 'cursor-pointer',
];

let ref: HTMLDivElement | null = null;

// let isDragging = false;
let probablyDragging = false;
let x = 0;
let y = 0;

let dx = 0;
let dy = 0;

const store = getContext<StoreProps>('store');
const isCardStartedDragging: any = getContext('isCardStartedDragging');
const draggingCardPosition: any = getContext('draggingCardPosition');

function handleClick() {
	if (!isDragging) {
		// handle click here
	} else {
		isDragging = false;
	}
}

function handlePointerDown() {
	if (!card.isFaceDown) isCardStartedDragging.set(card);
}

function handlePointerDown2(e: PointerEvent) {
	if (card.isFaceDown) return;
	ref?.setPointerCapture(e.pointerId);
	probablyDragging = true;
}

function handlePointerMove(e: PointerEvent) {
	e.stopPropagation();
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

$: isDragging = $isCardStartedDragging !== null && card.id === $isCardStartedDragging.id

$: draggingStyles = `
	position: relative;
	transform: translate(${$draggingCardPosition.x}px, ${$draggingCardPosition.y}px);
	box-shadow: ${ isDragging ? '3px 3px 8px rgba(0, 0, 0, 0.1)' : 'none' };
	z-index: ${isDragging ? 1000 : 'initial'};
	pointer-events: ${isDragging ? 'none' : 'auto'};
`;

</script>

<div
	bind:this={ref}
	on:pointerdown={handlePointerDown}
	class={classNames.join(' ')}
	style={isDragging ? draggingStyles : ""}
>
	<!-- {#if !card.isFaceDown} -->
	<span class="pointer-events-none select-none">{card.rank}</span>
	<span class="pointer-events-none select-none">{card.suit}</span>
	<!-- {/if} -->
</div>
