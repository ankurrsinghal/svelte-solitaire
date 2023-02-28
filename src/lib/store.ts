import { writable } from 'svelte/store';

export type CardPile = 
  | { type: "foundation", index: number }
  | { type: "stock" }
  | { type: "stock-open" }
  | { type: "tableau", index: number }


export interface CardType {
	rank: string;
	suit: string;
  pile: CardPile;
}

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠️', '♥️', '♣️', '♦️'];

let tableauPile = 0;
let numberOfTableauPiles = 7;

const cards: CardType[] = Array(52)
	.fill(0)
	.map((_, i) => {
		const rank = RANKS[i % 13];
		const suit = SUITS[Math.floor(i / 13)];
    if (i < 24) {
      return {
        id: `${rank}-${suit}`,
        rank,
        suit,
        pile: {
          type: "stock"
        }
      };
    }

    const afterStockPileIndex = 24 - i;
    return {
      id: `${rank}-${suit}`,
      rank,
      suit,
      pile: {
        type: "tableau",
        
      }
    };
	});

export function useCards() {
	const cardsStore = writable(cards);
	return cardsStore;
}
