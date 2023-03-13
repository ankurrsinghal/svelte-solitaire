<script lang="ts">
import { getContext } from "svelte";
import Card from "./Card.svelte";
import NoCardPile from "./NoCardPile.svelte";
import { isCardInPile, type CardType } from "./store";

const store = getContext('store');

$: cards = $store.filter((card: CardType) => isCardInPile(card, { type: "stock" }));

function handleClick() {
  store.pushToWastePileFromStockPile();
}

</script>

<div class="relative cursor-pointer" on:click={handleClick} aria-hidden="true">
  <div class="absolute top-0">
    <NoCardPile bg="bg-red-500">{cards.length}</NoCardPile>
  </div>  
  <div class="absolute top-0">
    <NoCardPile />
  </div>
</div>