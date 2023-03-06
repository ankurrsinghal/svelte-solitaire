<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { beforeUpdate } from 'svelte';
  import Card from './Card.svelte';
  import NoCardPile from './NoCardPile.svelte';
  import { isCardInPile, isCardInTableauPileOfIndex, type CardPile, type CardType, type StoreProps } from './store';
  
  export let index: number;
  
  const store = getContext<StoreProps>('store');
  $: cardsInThisPile = $store.filter(card => isCardInTableauPileOfIndex(card, index));
  $: openedCards = cardsInThisPile.filter(card => !card.isFaceDown)
  $: closedCards = cardsInThisPile.filter(card => card.isFaceDown)
    
  function handleClick() {
    
  }
  
  const isCardStartedDragging: any = getContext('isCardStartedDragging');
  const hoveredPile: any = getContext('hoveredPile');
  
  function handlePointerEnter() {
    if ($isCardStartedDragging !== null) {
      hoveredPile.set(index);
    }		
  }

  function handleCloseCardClick(cardIndex: number) {
    if (openedCards.length === 0) {
      if (cardIndex === closedCards.length - 1) {
        store.openCardInTableauPile(index);
      }
    }
  }
  
  </script>
  
  <div class="relative" on:click={handleClick} on:pointerenter={handlePointerEnter} aria-hidden="true">
    <NoCardPile />
    {#if closedCards.length > 0}
      {#each closedCards as card, index}
        <div class="absolute cursor-pointer" style="top: {(index)*20}px" on:click={() => handleCloseCardClick(index)} aria-hidden="true">
          <Card card={card} />
        </div>
      {/each}
    {/if}
    {#if openedCards.length > 0}
      {#each openedCards as card, index}
        <div class="absolute" style="top: {(index + closedCards.length)*20}px">
          <Card card={card} />
        </div>
      {/each}
    {/if}
  </div>