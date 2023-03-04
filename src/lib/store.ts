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

export interface StoreState {
  cards: CardType[];
  position: {
    x: number;
    y: number;
  }
}

export interface StoreProps extends Readable<CardType[]> {
  onClosedStockPileClicked: () => void;
  moveCardToPile: (card: CardType, toPile: CardPile) => void;
}

const SPADES = '♠️';
const HEARTS = '♥️';
const CLUBS = '♣️';
const DIAMONDS = '♦️';

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = [SPADES, HEARTS, CLUBS, DIAMONDS];

export function areCardsAntiSuit(cardA: CardType, cardB: CardType) {
  switch (cardA.suit) {
    case SPADES:
    case CLUBS:
      return cardB.suit === HEARTS || cardB.suit === DIAMONDS
    case HEARTS:
    case DIAMONDS:
      return cardB.suit === SPADES || cardB.suit === CLUBS
  }
}

export function getRankIndexOfCard(card: CardType) {
  return RANKS.findIndex(rank => card.rank === rank);
}

export function getSuitIndexOfCard(card: CardType) {
  return SUITS.findIndex(suit => card.suit === suit);
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


// class CardPile {
//   cards: CardType[];

//   constructor(cards: CardPile[]) {
//     this.cards = cards;
//   }
// }

// class Deck {

// }

// class Game {
//   deck
// }

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
        isFaceDown: index2 !== index - 1,
      });
    }
  }

	const { subscribe, update, set } = writable<CardType[]>(cards);

  function onClosedStockPileClicked() {
    update(cards => {
      const top = cards.find(card => card.pile.type === "stock" && card.pile.status === "close");
      if (top) {
        return cards.map(card => {
          if (card.id === top.id) {
            return {
              ...top,
              pile: {
                type: 'stock',
                status: 'open'
              },
              isFaceDown: false
            }
          }
          return card;
        });
      } else {
        return cards.map(card => {
          if (card.pile.type === 'stock') {
            if (card.pile.status === "open") {
              return {
                ...card,
                pile: {
                  type: 'stock',
                  status: 'close'
                },
                isFaceDown: true
              }
            } else {
              throw new Error("Data mismtach" + JSON.stringify(card, null, 4));
            }
          }

          return card;
        });
      }
    });
  }

  function moveCardToPile(moveCard: CardType, toPile: CardPile) {
    if (isCardInPile(moveCard, toPile)) return;

    if (toPile.type === 'foundation') {
      update(cards => {
        function updateNow() {
          const filteredCards = cards.filter(card => card.id !== moveCard.id);
          const cardMoved = {
            ...moveCard,
            pile: {
              ...toPile
            }
          }
          return [...filteredCards, cardMoved];
        }

        if (getSuitIndexOfCard(moveCard) === toPile.index) {
          const cardInThisPile = cards.filter(card => isCardInPile(card, toPile));
          const topCardOfThisPile = cardInThisPile[cardInThisPile.length - 1];
          if (topCardOfThisPile) {
            if (getRankIndexOfCard(topCardOfThisPile) === getRankIndexOfCard(moveCard) - 1) {
              return updateNow();
            }
          } else {
            if (getRankIndexOfCard(moveCard) === 0) {
              return updateNow();
            }
          }
        }
        return cards;
      });
    } else if (toPile.type === 'tableau') {
      update(cards => {
        const cardInThisPile = cards.filter(card => isCardInPile(card, toPile));
        const topCardOfThisPile = cardInThisPile[cardInThisPile.length - 1];
  
        function updateNow() {
          const filteredCards = cards.filter(card => card.id !== moveCard.id);
          const cardMoved = {
            ...moveCard,
            pile: {
              ...toPile
            }
          }
          return [...filteredCards, cardMoved];
        }
  
        if (topCardOfThisPile) {
          if (areCardsAntiSuit(topCardOfThisPile, moveCard)) {
            if (getRankIndexOfCard(topCardOfThisPile) === getRankIndexOfCard(moveCard) + 1) {
              console.log(topCardOfThisPile, moveCard);
              return updateNow();
            }
          }
        } else {
          // empty pile
          if (getRankIndexOfCard(moveCard) === 12) {
            return updateNow();
          }
        }
  
        return cards;
      });
    }
  }

  
  
	return { subscribe, onClosedStockPileClicked, moveCardToPile };
}