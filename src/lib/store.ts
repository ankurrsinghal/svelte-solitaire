import { writable, type Readable, type Subscriber, type Writable } from 'svelte/store';

export type FoundationPileType = { type: "foundation", index: number };
export type StockPileType = { type: "stock", status: "open" | "close"  };
export type TableauPileType = { type: "tableau", index: number };

export type CardPile = 
  | FoundationPileType
  | StockPileType
  | TableauPileType


export interface CardType {
  id: string;
	rank: string;
	suit: string;
  pile: CardPile;
  isFaceDown: boolean;
}

export interface StoreProps extends Readable<CardType[]> {
  onClosedStockPileClicked: () => void
}

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠️', '♥️', '♣️', '♦️'];

export function createCards(): StoreProps {
  const cards: CardType[] = [];

  for (let index = 0; index < 24; index++) {
    const rank = RANKS[index % 13];
    const suit = SUITS[Math.floor(index / 13)];
    cards.push({
      id: `${rank}-${suit}`,
      rank,
      suit,
      pile: {
        type: "stock",
        status: "close"
      },
      isFaceDown: true
    });
  }

  function sumN(n: number) {
    return (n * (n - 1)) / 2;
  }

  for (let index = 1; index <= 7; index++) {
    for (let index2 = 0; index2 < index; index2++) {
      const cardIndex = 23 + sumN(index) + index2 + 1;
      const rank = RANKS[cardIndex % 13];
      const suit = SUITS[Math.floor(cardIndex / 13)];
      cards.push({
        id: `${rank}-${suit}`,
        rank,
        suit,
        pile: {
          type: "tableau",
          index: index-1
        },
        isFaceDown: false
      });
    }
  }

	const { subscribe, update } = writable<CardType[]>(cards);

  function onClosedStockPileClicked() {
    console.log("card received");
  }
  
	return { subscribe, onClosedStockPileClicked };
}

export function isCardInPile(card: CardType, pile: CardPile) {
  if (card.pile.type === pile.type) {
    switch (card.pile.type) {
      case "foundation":
        return card.pile.index === (pile as FoundationPileType).index;
      case "stock":
        const val = card.pile.status === (pile as StockPileType).status;
        return val;
      case "tableau":
        return card.pile.index === (pile as TableauPileType).index;
    }
  }
}