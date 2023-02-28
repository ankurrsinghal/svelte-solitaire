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
</script>

<div on:pointerdown on:pointermove on:pointerup class={classNames.join(' ')}>
	<span class="">{card.rank}</span>
	<span class="">{card.suit}</span>
</div>
