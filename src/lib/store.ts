import { writable } from 'svelte/store';

export type FoundationPileType = { type: "foundation", index: number };
export type StockPileType = { type: "stock", status: "open" | "close"  };
export type TableauPileType = { type: "tableau", index: number };

export type CardPile = 
  | FoundationPileType
  | StockPileType
  | TableauPileType


export interface CardType {
	rank: string;
	suit: string;
  pile: CardPile;
}

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠️', '♥️', '♣️', '♦️'];

export function createCards() {
  const cards = [];

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
      }
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
        }
      });
    }
  }
	const cardsStore = writable(cards);
  
	return cardsStore;
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