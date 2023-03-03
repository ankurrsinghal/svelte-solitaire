<script lang="ts">
import { setContext } from "svelte";
import Card from "./Card.svelte";
import CardPile from "./CardPile.svelte";
import { createCards } from "./store";

const store = createCards();
setContext('store', store);

</script>

<div class="bg-slate-100 h-screen w-screen overflow-hidden">
  <div class="container mx-auto">
    <div class="grid grid-cols-7 mt-10">
      <CardPile pile={{ type: 'foundation', index: 0 }} />
      <CardPile pile={{ type: 'foundation', index: 1 }} />
      <CardPile pile={{ type: 'foundation', index: 2 }} />
      <CardPile pile={{ type: 'foundation', index: 3 }} />
      <div />
      <CardPile pile={{ type: 'stock', status: "open" }} />
      <CardPile pile={{ type: 'stock', status: "close" }} />
    </div>
    <div class="grid grid-cols-7 mt-10">
      <CardPile pile={{ type: 'tableau', index: 0 }} />
      <CardPile pile={{ type: 'tableau', index: 1 }} />
      <CardPile pile={{ type: 'tableau', index: 2 }} />
      <CardPile pile={{ type: 'tableau', index: 3 }} />
      <CardPile pile={{ type: 'tableau', index: 4 }} />
      <CardPile pile={{ type: 'tableau', index: 5 }} />
      <CardPile pile={{ type: 'tableau', index: 6 }} />
    </div>
  </div>
</div>