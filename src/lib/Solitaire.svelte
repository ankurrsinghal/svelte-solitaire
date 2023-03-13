<script lang="ts">
import { setContext, onMount, onDestroy } from "svelte";
import { writable } from "svelte/store";
import Card from "./Card.svelte";
import CardPile from "./CardPile.svelte";
import FoundationPile from "./FoundationPile.svelte";
import StockPile from "./StockPile.svelte";
import { createCards, isCardInPile } from "./store";
import TableauPile from "./TableauPile.svelte";
import WastePile from "./WastePile.svelte";
import { windowSizeStore } from 'svelte-legos';
const size = windowSizeStore()

const MAX_CANVAS_WIDTH = 1000;
const MAX_CARD_WIDTH = 125;
const N_TABLEAU_COLUMNS = 7;
const CARD_ASPECT_RATIO = 1.5;

$: canvasWidth = Math.min(MAX_CANVAS_WIDTH, $size.width);
$: columnSpacing = (canvasWidth - MAX_CARD_WIDTH * (N_TABLEAU_COLUMNS)) / (N_TABLEAU_COLUMNS - 1);
$: cardWidth = MAX_CARD_WIDTH;
$: cardHeight = cardWidth * CARD_ASPECT_RATIO;

$: setContext('cardWidth', cardWidth);
$: setContext('cardHeight', cardHeight);

const store = createCards();
setContext('store', store);

let canvasRef: HTMLDivElement;
let tableauRef: HTMLDivElement;
let foundationRef: HTMLDivElement;

const isCardStartedDragging = writable(null);
const draggingSession = writable(null);
const draggingCardPosition = writable({ x: 0, y: 0 });
const hoveredPile = writable(null);
const pointerEvent = writable(null);

setContext('isCardStartedDragging', isCardStartedDragging);
setContext('draggingCardPosition', draggingCardPosition);
setContext('hoveredPile', hoveredPile);
setContext('draggingSession', draggingSession);
setContext('pointerEvent', pointerEvent);

$: canvasRect = canvasRef && canvasRef.getBoundingClientRect();
$: foundationRect = foundationRef && foundationRef.getBoundingClientRect();
$: tableauRect = tableauRef && tableauRef.getBoundingClientRect();

function handlePointerMove(e: PointerEvent) {

  if ((canvasRect && foundationRect && tableauRect) && $isCardStartedDragging !== null) {
    const { clientX, clientY } = e;
    const { x: canvasRectX, y: canvasRectY } = canvasRect;
    const { x: foundationRectX, y: foundationRectY } = foundationRect;
    const { x: tableauRectX, y: tableauRectY } = tableauRect;

    if (clientY > foundationRectY && clientY < foundationRectY + cardHeight) {
      const probableIndex = Math.floor((clientX - foundationRectX) / ((cardWidth) + (columnSpacing)));
      if (probableIndex < 4 && probableIndex >= 0) {
        if ((clientX - foundationRectX) < cardWidth + (probableIndex * (cardWidth + columnSpacing))) {
          // probableIndex is correct foundation index
          if ($isCardStartedDragging.pile.type === "tableau" || $isCardStartedDragging.pile.type === "waste") {
            const newPile = { type: "foundation", index: probableIndex };
            if ($hoveredPile === null) {
              hoveredPile.set(newPile);
            } else {
              if (!(newPile.type === $hoveredPile.type && newPile.index === $hoveredPile.type)) {
                hoveredPile.set(newPile);
              }
            }
          }
        }
      }
    }

    if (clientY > tableauRectY) {
      const probableIndex = Math.floor((clientX - tableauRectX) / ((cardWidth) + (columnSpacing)));
      if (probableIndex < 7 && probableIndex >= 0) {
        if ((clientX - tableauRectX) < cardWidth + (probableIndex * (cardWidth + columnSpacing))) {
          // probableIndex is correct foundation index
          const newPile = { type: "foundation", index: probableIndex };
          if (probableIndex !== $isCardStartedDragging.pile.index && !($hoveredPile !== null && $hoveredPile.type === 'tableau' && $hoveredPile.index === probableIndex)) {
            hoveredPile.set({ type: "tableau", index: probableIndex })
          }
        }
      }
    }
  }


  if ($isCardStartedDragging !== null) {
    draggingCardPosition.update(position => ({
      x: position.x + e.movementX,
      y: position.y + e.movementY
    }));
  }
}

function handlePointerUp(e: PointerEvent) {
  if ($hoveredPile !== null) {
    store.moveCardToPile($isCardStartedDragging, $hoveredPile);
  }

  hoveredPile.set(null);
  isCardStartedDragging.set(null);
  draggingCardPosition.set({ x: 0, y: 0 });
  draggingSession.set(null);
}

$: {
  if ($isCardStartedDragging !== null) {
    const pileType = $isCardStartedDragging.pile.type;
    if (pileType === "tableau") {
      const cardsInThisPile = $store.filter(card => isCardInPile(card, $isCardStartedDragging.pile));
      const indexOfDraggedCard = cardsInThisPile.findIndex(card => card.id === $isCardStartedDragging.id);
      draggingSession.set(cardsInThisPile.slice(indexOfDraggedCard))
    } else if (pileType === "foundation") {
      draggingSession.set([$isCardStartedDragging])
    } else if (pileType === "waste") {
      draggingSession.set([$isCardStartedDragging])
    }
  }
}

$: console.log($hoveredPile);

$: draggingStyles = $pointerEvent !== null ? `
  top: 0;
  left: 0;
	position: absolute;
	transform: translate(${$pointerEvent.x - $pointerEvent.offsetX + $draggingCardPosition.x}px, ${$pointerEvent.y - $pointerEvent.offsetY + $draggingCardPosition.y}px);
	box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	pointer-events: none;
`: '';

</script>

<div class="bg-green-600 h-screen w-screen overflow-hidden flex justify-center" on:pointermove={handlePointerMove} on:pointerup={handlePointerUp}>
  <div
    bind:this={canvasRef}
    class="flex flex-col h-screen"
    style:width="{canvasWidth}px"
  >
    <div bind:this={foundationRef} class="grid mt-10" style:grid-template-columns={`repeat(7, ${cardWidth}px)`} style:gap="{columnSpacing}px">
      <FoundationPile index={0} />
      <FoundationPile index={1} />
      <FoundationPile index={2} />
      <FoundationPile index={3} />
      <div />
      <WastePile />
      <StockPile />
    </div>
    <div bind:this={tableauRef} class="grid mt-10 flex-1" style:grid-template-columns={`repeat(7, ${cardWidth}px)`} style:gap="{columnSpacing}px">
      <TableauPile index={0} />
      <TableauPile index={1} />
      <TableauPile index={2} />
      <TableauPile index={3} />
      <TableauPile index={4} />
      <TableauPile index={5} />
      <TableauPile index={6} />
    </div>
    {#if $draggingSession && $draggingSession.length > 0}
      <div style={draggingStyles}>
        {#each $draggingSession as card, index}
          <div class="absolute" style="top: {(index)*20}px">
            <Card card={card} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>