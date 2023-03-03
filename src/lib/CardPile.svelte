<script lang="ts">
import { getContext } from 'svelte';
import type { Writable } from 'svelte/store';
import Card from './Card.svelte';
import NoCardPile from './NoCardPile.svelte';
import { isCardInPile, type CardPile, type CardType, type StoreProps } from './store';

export let pile: CardPile;

const store = getContext<StoreProps>('store');
const cards = $store.filter(card => isCardInPile(card, pile));

const isCascadable = pile.type === 'tableau';

function handleClick() {
	if (pile.type === "stock" && pile.status === "close") {
		store.onClosedStockPileClicked();
	}
}
</script>

<div class="relative" on:click={handleClick} aria-hidden="true">
	{#if cards.length > 0}
		{#each cards as card, index}
			<div class="absolute" style={ isCascadable ? `top: ${index*40}px` : ""} >
				<Card card={card}  />
			</div>
		{/each}
	{:else}
	<NoCardPile />
	{/if}
</div>