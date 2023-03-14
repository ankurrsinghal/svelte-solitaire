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
const MAX_CARD_WIDTH = 100;
const N_TABLEAU_COLUMNS = 7;
const CARD_ASPECT_RATIO = 1.4;

$: canvasWidth = Math.min(MAX_CANVAS_WIDTH, $size.width);
$: columnSpacing = (canvasWidth - MAX_CARD_WIDTH * (N_TABLEAU_COLUMNS)) / (N_TABLEAU_COLUMNS - 1);
$: cardWidth = Math.min(MAX_CARD_WIDTH, canvasWidth/7);
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

    const draggingCardCenterX = clientX - $pointerEvent.offsetX + cardWidth / 2;
    const draggingCardY = clientY - $pointerEvent.offsetY + cardHeight / 2;

    console.log(draggingCardCenterX, draggingCardY);

    if (draggingCardY > foundationRectY && draggingCardY < foundationRectY + cardHeight) {
      const probableIndex = Math.floor((draggingCardCenterX - foundationRectX) / ((cardWidth) + (columnSpacing)));
      if (probableIndex < 4 && probableIndex >= 0) {
        if ((draggingCardCenterX - foundationRectX) < cardWidth + (probableIndex * (cardWidth + columnSpacing))) {
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

    if (draggingCardY > tableauRectY) {
      const probableIndex = Math.floor((draggingCardCenterX - tableauRectX) / ((cardWidth) + (columnSpacing)));
      if (probableIndex < 7 && probableIndex >= 0) {
        if ((draggingCardCenterX - tableauRectX) < cardWidth + (probableIndex * (cardWidth + columnSpacing))) {
          // probableIndex is correct foundation index
          if (probableIndex !== $isCardStartedDragging.pile.index) {
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
    if ($draggingSession.length > 1 && $hoveredPile.type === "tableau") {
      store.moveCardsAmongTableau($draggingSession, $hoveredPile.index);
    } else {
      store.moveCardToPile($draggingSession[0], $hoveredPile);
    }
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
      const openCardsInThisPile = $store.filter(card => isCardInPile(card, $isCardStartedDragging.pile) && !card.isFaceDown);
      const indexOfDraggedCard = openCardsInThisPile.findIndex(card => card.id === $isCardStartedDragging.id);
      draggingSession.set(openCardsInThisPile.slice(indexOfDraggedCard))
    } else if (pileType === "foundation") {
      draggingSession.set([$isCardStartedDragging])
    } else if (pileType === "waste") {
      draggingSession.set([$isCardStartedDragging])
    }
  }
}

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
          <div class="absolute" style="top: {(index)*30}px">
            <Card isTopPileOpenCard={index === $draggingSession.length - 1} card={card} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>