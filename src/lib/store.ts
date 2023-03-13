import { writable, type Readable, type Subscriber, type Writable } from 'svelte/store';

export type FoundationPileType = { type: "foundation", index: number };
export type WastePileType = { type: "waste" };
export type StockPileType = { type: "stock" };
export type TableauPileType = { type: "tableau", index: number };

export type CardPile = 
  | FoundationPileType
  | WastePileType
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

function topCard(cards: CardType[]) {
  return cards.at(cards.length - 1);
}

export interface StoreProps extends Readable<CardType[]> {
  onClosedStockPileClicked: () => void;
  moveCardsAmongTableau: (cards: CardType[], index: number) => void;
  moveCardToPile: (card: CardType, toPile: CardPile) => void;
  pushToWastePileFromStockPile: () => void;
  openCardInTableauPile: (index: number) => void;
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

export function isCardInPile(card: CardType, pile: CardPile): boolean {
  if (card.pile.type === pile.type) {
    switch (card.pile.type) {
      case "foundation":
        return card.pile.index === (pile as FoundationPileType).index;
      case "waste":
        return pile.type === "waste";
      case "stock":
        return pile.type === "stock";
      case "tableau":
        return card.pile.index === (pile as TableauPileType).index;
    }
  }

  return false;
}

export const STOCK_PILE: StockPileType = {
  type: "stock"
};

export const WASTE_PILE: WastePileType = {
  type: "waste"
};

export function isCardInStockPile(card: CardType) {
  return isCardInPile(card, STOCK_PILE);
}

export function isCardInWastePile(card: CardType) {
  return isCardInPile(card, WASTE_PILE);
}

export function isCardInTableauPileOfIndex(card: CardType, index: number) {
  return isCardInPile(card, { type: "tableau", index });
}

export function isCardInFoudnationPileOfIndex(card: CardType, index: number) {
  return isCardInPile(card, { type: "foundation", index });
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

function getCards() {
  const cards: any[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      cards.push({ rank, suit, id: `${rank}-${suit}`, });
    });
  });

  for (let index = 0; index < cards.length; index++) {
    const randomIndex = Math.floor(Math.random() * 52);
    [cards[index], cards[randomIndex]] = [
      cards[randomIndex],
      cards[index],
    ];
  }

  for (let index = 0; index < 24; index++) {
    cards[index].pile = STOCK_PILE;
    cards[index].isFaceDown = true;
  }

  function sumN(n: number) {
    return (n * (n - 1)) / 2;
  }

  for (let index = 1; index <= 7; index++) {
    for (let index2 = 0; index2 < index; index2++) {
      const cardIndex = 23 + sumN(index) + index2 + 1;
      cards[cardIndex].pile = {
        type: "tableau",
        index: index-1
      };
      cards[cardIndex].isFaceDown = index2 !== index - 1;
    }
  }

  // console.log(cards);

  return cards;
}

export function createCards(): StoreProps {
	const { subscribe, update, set } = writable<CardType[]>(getCards());

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

  function moveCardsAmongTableau(movingCards: CardType[], moveIndex: number) {
    update(cards => {
      const cardInThisPile = cards.filter(card => isCardInTableauPileOfIndex(card, moveIndex));
      const topCardOfThisPile = cardInThisPile[cardInThisPile.length - 1];

      function updateNow() {
        const filteredCards = cards.filter(card => !movingCards.some(c => c.id === card.id));
        const cardsMoved = movingCards.map(card => ({
          ...card,
          pile: {
            ...card.pile,
            index: moveIndex
          }
        }));
        return [...filteredCards, ...cardsMoved];
      }

      const topCardOfMovingPile = movingCards[0];
      if (topCardOfThisPile) {
        if (areCardsAntiSuit(topCardOfThisPile, topCardOfMovingPile)) {
          if (getRankIndexOfCard(topCardOfThisPile) === getRankIndexOfCard(topCardOfMovingPile) + 1) {
            return updateNow();
          }
        }
      } else {
        // empty pile
        if (getRankIndexOfCard(topCardOfMovingPile) === 12) {
          return updateNow();
        }
      }

      return cards;
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

  function selector(cards: CardType[], fn: (card: CardType) => boolean) {
    return cards.filter(fn);
  }

  function pushToWastePileFromStockPile() {
    update(cards => {
      const cardsInStockPile = selector(cards, isCardInStockPile);
      const cardToBeMoved = topCard(cardsInStockPile);
      if (cardToBeMoved) {
        return cards.map(card => {
          if (card.id === cardToBeMoved.id) {
            console.log("moving to waste");
            return {
              ...cardToBeMoved,
              isFaceDown: false,
              pile: WASTE_PILE
            }
          }
          return card;
        });
      } else {
        // empty waste pile
        // and move all cards to 
        // stock pile
        return cards.map(card => {
          if (isCardInWastePile(card)) {
            return {
              ...card,
              isFaceDown: true,
              pile: STOCK_PILE
            }
          }

          return card;
        });
      }
    });
  }

  function openCardInTableauPile(index: number) {
    update(cards => {
      const cardsInThisTableau = cards.filter(card => isCardInTableauPileOfIndex(card, index));
      const closedCards = cardsInThisTableau.filter(card => card.isFaceDown);
      if (cardsInThisTableau.length === closedCards.length) {
        const cardToBeOpened = topCard(closedCards);
        if (cardToBeOpened) {
          return cards.map(card => {
            if (card.id === cardToBeOpened.id) {
              return {
                ...cardToBeOpened,
                isFaceDown: false
              }
            }
            return card;
          });
        }
      } else {
        throw new Error("You cannot open this card!");
      }

      return cards;
    });
  }
  
	return { subscribe, moveCardsAmongTableau, onClosedStockPileClicked, moveCardToPile, pushToWastePileFromStockPile, openCardInTableauPile };
}