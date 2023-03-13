<script lang="ts">
  import { getContext } from 'svelte';
  import Card from './Card.svelte';
  import NoCardPile from './NoCardPile.svelte';
  import { isCardInFoudnationPileOfIndex, isCardInPile, type CardPile, type CardType, type StoreProps } from './store';
  
  export let index: number;
  
  const store = getContext<StoreProps>('store');
  $: cards = $store.filter(card => isCardInFoudnationPileOfIndex(card, index));

  function handleHover() {
    console.log("foundation");
  }

  const draggingSession = getContext('draggingSession');
  
  </script>
  
  <div class="relative" on:mouseover={handleHover} aria-hidden="true">
    <NoCardPile />
    {#if cards.length > 0}
      {#each cards as card, index}
        <div class="absolute" style="top: {index*40}px" >
          <Card card={card} hidden={$draggingSession !== null && $draggingSession.findIndex(c => c.id === card.id) !== -1} />
        </div>
      {/each}
    {/if}
  </div>