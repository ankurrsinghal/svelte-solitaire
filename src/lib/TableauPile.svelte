<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { beforeUpdate } from 'svelte';
  import Card from './Card.svelte';
  import NoCardPile from './NoCardPile.svelte';
  import { isCardInPile, isCardInTableauPileOfIndex, type CardPile, type CardType, type StoreProps } from './store';
  
  export let index: number;
  
  const store = getContext<StoreProps>('store');
  const draggingSession = getContext('draggingSession');

  $: cardsInThisPile = $store.filter(card => isCardInTableauPileOfIndex(card, index));
  $: openedCards = cardsInThisPile.filter(card => !card.isFaceDown)
  $: closedCards = cardsInThisPile.filter(card => card.isFaceDown)

  function handleCloseCardClick(cardIndex: number) {
    if (openedCards.length === 0) {
      if (cardIndex === closedCards.length - 1) {
        store.openCardInTableauPile(index);
      }
    }
  }
  

  </script>
  
  <div class="relative" aria-hidden="true">
    <NoCardPile />
    {#if closedCards.length > 0}
      {#each closedCards as card, index}
        <div class="absolute cursor-pointer" style="top: {(index)*30}px" on:click={() => handleCloseCardClick(index)} aria-hidden="true">
          <Card card={card} />
        </div>
      {/each}
    {/if}
    {#if openedCards.length > 0}
      {#each openedCards as card, index}
        <div class="absolute" style="top: {(index + closedCards.length)*30}px">
          <Card isTopPileOpenCard={index === openedCards.length - 1} card={card} hidden={$draggingSession !== null && $draggingSession.findIndex(c => c.id === card.id) !== -1} />
        </div>
      {/each}
    {/if}
  </div>