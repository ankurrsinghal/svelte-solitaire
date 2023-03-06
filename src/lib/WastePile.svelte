<script lang="ts">
import { getContext } from "svelte";
import Card from "./Card.svelte";
import NoCardPile from "./NoCardPile.svelte";
import { isCardInPile, isCardInWastePile, type CardType } from "./store";

const store = getContext('store');

$: cards = $store.filter(isCardInWastePile).slice(0, 2).reverse();

function handleClick() {
  console.log("waste piel click");
}

</script>

<div class="relative" on:click={handleClick} aria-hidden="true">
  {#if cards.length > 0}
    {#each cards as card, index}
      <div class="absolute">
        <Card card={card} />
      </div>
    {/each}
  {/if}
  <NoCardPile />
</div>