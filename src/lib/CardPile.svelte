<script lang="ts">
import { getContext } from 'svelte';
import type { Writable } from 'svelte/store';
import Card from './Card.svelte';
import NoCardPile from './NoCardPile.svelte';
import { isCardInPile, type CardPile, type CardType } from './store';

export let pile: CardPile;

const store = getContext<Writable<CardType[]>>('store');
const cards = $store.filter(card => isCardInPile(card, pile));

const isCascadable = pile.type === 'tableau';
</script>

<div class="relative">
	{#if cards.length > 0}
		{#each cards as card, index}
			<div class="absolute" style={ isCascadable ? `top: ${index*40}px` : ""} >
				<Card card={card} />
			</div>
		{/each}
	{:else}
	<NoCardPile />
	{/if}
</div>