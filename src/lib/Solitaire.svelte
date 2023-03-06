<script lang="ts">
import { setContext, onMount, onDestroy } from "svelte";
  import { writable } from "svelte/store";
import CardPile from "./CardPile.svelte";
  import StockPile from "./StockPile.svelte";
import { createCards } from "./store";
  import WastePile from "./WastePile.svelte";

const store = createCards();
setContext('store', store);

let canvasRef: HTMLDivElement | null = null;
let rect: DOMRect | null = null;

let observer: ResizeObserver | null = null;
onMount(() => {
  if (canvasRef !== null) {
    observer = new ResizeObserver(() => {
      rect = canvasRef!.getBoundingClientRect();
    });
    
    observer.observe(canvasRef);
  }
});

onDestroy(() => {
  if (observer !== null) {
    observer.disconnect();
  }
});

const isCardStartedDragging = writable(null);
const draggingCardPosition = writable({ x: 0, y: 0 });
const hoveredPile = writable(null);

setContext('isCardStartedDragging', isCardStartedDragging);
setContext('draggingCardPosition', draggingCardPosition);
setContext('hoveredPile', hoveredPile);

function handlePointerMove(e: PointerEvent) {
  if (rect !== null) {
    if ($isCardStartedDragging !== null) {
      draggingCardPosition.update(position => ({
        x: position.x + e.movementX,
        y: position.y + e.movementY
      }));
    }
  }
}

function handlePointerUp(e: PointerEvent) {
  if ($hoveredPile !== null) {
    store.moveCardToPile($isCardStartedDragging, $hoveredPile);
  }

  hoveredPile.set(null);
  isCardStartedDragging.set(null);
  draggingCardPosition.set({ x: 0, y: 0 });
}

</script>

<div class="bg-slate-100 h-screen w-screen overflow-hidden flex justify-center">
  <div bind:this={canvasRef} on:pointermove={handlePointerMove} on:pointerup={handlePointerUp} class="container flex flex-col h-screen">
    <div class="grid grid-cols-7 mt-10">
      <CardPile pile={{ type: 'foundation', index: 0 }} />
      <CardPile pile={{ type: 'foundation', index: 1 }} />
      <CardPile pile={{ type: 'foundation', index: 2 }} />
      <CardPile pile={{ type: 'foundation', index: 3 }} />
      <div />
      <WastePile />
      <StockPile />
    </div>
    <div class="grid grid-cols-7 mt-10 flex-1">
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