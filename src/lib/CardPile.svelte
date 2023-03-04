<script lang="ts">
import { getContext } from 'svelte';
import type { Writable } from 'svelte/store';
import { beforeUpdate } from 'svelte';
import Card from './Card.svelte';
import NoCardPile from './NoCardPile.svelte';
import { isCardInPile, type CardPile, type CardType, type StoreProps } from './store';

export let pile: CardPile;

const store = getContext<StoreProps>('store');
$: cards = $store.filter(card => isCardInPile(card, pile));
$: {
	if ((pile.type === "stock" && pile.status === "close")) cards.reverse();
}

const isCascadable = pile.type === 'tableau';

function handleClick() {
	if (pile.type === "stock" && pile.status === "close") {
		store.onClosedStockPileClicked();
	}
}

const isCardStartedDragging: any = getContext('isCardStartedDragging');
const hoveredPile: any = getContext('hoveredPile');

function handlePointerEnter() {
	if ($isCardStartedDragging !== null) {
		hoveredPile.set(pile);
	}		
}

</script>

<div class="relative" on:click={handleClick} on:pointerenter={handlePointerEnter} aria-hidden="true">
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