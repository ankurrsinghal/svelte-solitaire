<script lang="ts">
import { getContext } from "svelte";
import Card from "./Card.svelte";
import NoCardPile from "./NoCardPile.svelte";
import { isCardInPile, isCardInWastePile, type CardType } from "./store";

const store = getContext('store');

$: cards = $store.filter(isCardInWastePile).slice(0, 2).reverse();

const draggingSession = getContext('draggingSession');

</script>

<div class="relative" aria-hidden="true">
  {#if cards.length > 0}
    {#each cards as card}
      <div class="absolute">
        <Card card={card} hidden={$draggingSession !== null && $draggingSession.findIndex(c => c.id === card.id) !== -1} />
      </div>
    {/each}
  {/if}
  <NoCardPile />
</div>