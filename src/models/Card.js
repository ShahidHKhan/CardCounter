/*
 * Card.js
 * Immutable Card model for Blackjack
 *
 * Each card has:
 *   - id:    unique string like 'aceHearts'
 *   - rank:  display symbol ('A', '2'..'10', 'J', 'Q', 'K')
 *   - suit:  'Hearts' | 'Diamonds' | 'Clubs' | 'Spades'
 *   - value: base Blackjack value (Ace = 11; face cards = 10)
 */

const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

const RANKS = [
  { name: 'ace',   symbol: 'A',  value: 11 },
  { name: 'two',   symbol: '2',  value: 2  },
  { name: 'three', symbol: '3',  value: 3  },
  { name: 'four',  symbol: '4',  value: 4  },
  { name: 'five',  symbol: '5',  value: 5  },
  { name: 'six',   symbol: '6',  value: 6  },
  { name: 'seven', symbol: '7',  value: 7  },
  { name: 'eight', symbol: '8',  value: 8  },
  { name: 'nine',  symbol: '9',  value: 9  },
  { name: 'ten',   symbol: '10', value: 10 },
  { name: 'jack',  symbol: 'J',  value: 10 },
  { name: 'queen', symbol: 'Q',  value: 10 },
  { name: 'king',  symbol: 'K',  value: 10 },
];

const SUIT_SYMBOLS = {
  Hearts:   '♥',
  Diamonds: '♦',
  Clubs:    '♣',
  Spades:   '♠',
};

/**
 * Create a single Card object.
 */
function createCard(rankInfo, suit) {
  return Object.freeze({
    id:    `${rankInfo.name}${suit}`,
    rank:  rankInfo.symbol,
    suit,
    value: rankInfo.value,
  });
}

/**
 * Returns the suit's unicode symbol (♥ ♦ ♣ ♠).
 */
function getSuitSymbol(suit) {
  return SUIT_SYMBOLS[suit] || suit;
}

/**
 * Pretty-print a card, e.g. "A♠"
 */
function formatCard(card) {
  return `${card.rank}${getSuitSymbol(card.suit)}`;
}

/**
 * True if the card is an Ace.
 */
function isAce(card) {
  return card.rank === 'A';
}

module.exports = {
  SUITS,
  RANKS,
  SUIT_SYMBOLS,
  createCard,
  getSuitSymbol,
  formatCard,
  isAce,
};
