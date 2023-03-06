<script lang="ts">
  import { getContext } from 'svelte';
  import Card from './Card.svelte';
  import NoCardPile from './NoCardPile.svelte';
  import { isCardInFoudnationPileOfIndex, isCardInPile, type CardPile, type CardType, type StoreProps } from './store';
  
  export let index: number;
  
  const store = getContext<StoreProps>('store');
  $: cards = $store.filter(card => isCardInFoudnationPileOfIndex(card, index));
  
  const isCardStartedDragging: any = getContext('isCardStartedDragging');
  const hoveredPile: any = getContext('hoveredPile');
  
  function handlePointerEnter() {
    if ($isCardStartedDragging !== null) {
      hoveredPile.set({ type: "foundation", index });
    }
  }
  
  </script>
  
  <div class="relative" on:pointerenter={handlePointerEnter} aria-hidden="true">
    <NoCardPile />
    {#if cards.length > 0}
      {#each cards as card, index}
        <div class="absolute" style="top: {index*40}px" >
          <Card card={card} />
        </div>
      {/each}
    {/if}
  </div>