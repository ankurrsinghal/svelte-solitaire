<script lang="ts">
  import { getContext } from 'svelte';
import type { CardType, StoreProps } from './store';

export let card: CardType;
export let hidden: boolean = false;
export let isTopPileOpenCard: boolean = true;

$: isRed = card.suit === '♦️' || card.suit === '♥️';

$: classNames = [
	'position',
	'rounded-md',
	'text-3xl',
	'border border-black',
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
const pointerEvent: any = getContext('pointerEvent');

function handleClick() {
	if (!isDragging) {
		// handle click here
	} else {
		isDragging = false;
	}
}

function handlePointerDown(e: PointerEvent) {
	e.preventDefault();
	e.stopPropagation();
	pointerEvent.set(e);
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

const cardWidth = getContext('cardWidth');
const cardHeight = getContext('cardHeight');

$: opacity = hidden ? '0' : '1';

$: contentClass = `
	w-full
	h-full
	relative
	z-0
	flex
	${isTopPileOpenCard ? 'flex-col' : ''}
	${isTopPileOpenCard ? 'items-center' : ''}
	${isTopPileOpenCard ? 'text-3xl' : 'text-xl'}
	justify-center
	pointer-events-none
`
</script>

<div
	bind:this={ref}
	on:pointerdown={handlePointerDown}
	class={classNames.join(' ')}
	style:opacity
	style:width="{cardWidth}px"
	style:height="{cardHeight}px"
>
	<div class="absolute inset-0 z-10"></div>
	{#if !card.isFaceDown}
		<div class={contentClass}>
			<span class="pointer-events-none select-none">{card.rank}</span>
			<span class="pointer-events-none select-none">{card.suit}</span>
		</div>
	{/if}
</div>
