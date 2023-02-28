<script lang="ts">
import Card from "./Card.svelte";
import { useCards } from "./store";

const cards = useCards();

let isDragging = false;

function handlePointerDown(e: PointerEvent) {
  
}

function handlePointerMove(e: PointerEvent) {
  console.log(e);
}

function handlePointerUp(e: PointerEvent) {
  console.log(e);
}

</script>

<div class="bg-slate-100 grid grid-cols-4">
  {#each $cards as card}
    <Card
      card={card}
      on:pointerdown={handlePointerDown}
      on:pointermove={handlePointerMove}
      on:pointerup={handlePointerUp}
    />
  {/each}
</div>