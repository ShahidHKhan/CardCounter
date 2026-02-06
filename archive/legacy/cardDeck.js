/*
 * cardDeck.js
 * Blackjack-ready 52-card deck module
 *
 * Each card is an object with properties:
 * - id: unique identifier string like 'aceHearts'
 * - rank: 'A', '2'..'10', 'J', 'Q', 'K'
 * - suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades'
 * - value: Blackjack value (Aces set to 11 here; counting logic can change it to 1 later)
 *
 * Exports:
 * - createDeck(): returns a fresh array (52 objects)
 * - namedCards: mapping of each card id to a single card template object
 * - shuffle(deck): Fisher–Yates shuffle (in-place)
 * - draw(deck, count = 1): removes and returns `count` cards from top of the deck
 */

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

const ranks = [
  { name: 'ace', symbol: 'A', value: 11 },
  { name: 'two', symbol: '2', value: 2 },
  { name: 'three', symbol: '3', value: 3 },
  { name: 'four', symbol: '4', value: 4 },
  { name: 'five', symbol: '5', value: 5 },
  { name: 'six', symbol: '6', value: 6 },
  { name: 'seven', symbol: '7', value: 7 },
  { name: 'eight', symbol: '8', value: 8 },
  { name: 'nine', symbol: '9', value: 9 },
  { name: 'ten', symbol: '10', value: 10 },
  { name: 'jack', symbol: 'J', value: 10 },
  { name: 'queen', symbol: 'Q', value: 10 },
  { name: 'king', symbol: 'K', value: 10 }
];

// Build a map of named card templates (singletons you can inspect)
const namedCards = {};

for (const r of ranks) {
  for (const s of suits) {
    // id e.g. aceHearts, sevenClubs
    const id = `${r.name}${s}`;
    namedCards[id] = {
      id,
      rank: r.symbol,
      suit: s,
      value: r.value
    };
  }
}

// createDeck returns a fresh new array containing deep-copies of the card objects
function createDeck() {
  // 1. Get the values as an array
  const cardArray = Object.values(namedCards);
  
  // 2. Map through each card
  return cardArray.map(function(c) {
    // 3. Manually create and return a brand new copy
    return {
      id: c.id,
      rank: c.rank,
      suit: c.suit,
      value: c.value
    };
  });
}

// Fisher-Yates shuffle (in-place)
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// draw n cards from top (front) of deck; returns array of drawn cards
function draw(deck, count = 1) {
  if (count <= 0) return [];
  const drawn = deck.splice(0, count);
  return drawn;
}

// Helper function for suit symbols
function getSuitSymbol(suit) {
  const symbols = {
    'Hearts': '♥',
    'Diamonds': '♦',
    'Clubs': '♣',
    'Spades': '♠'
  };
  return symbols[suit] || suit;
}

// Export for Node (CommonJS)
module.exports = {
  createDeck,
  namedCards,
  shuffle,
  draw,
  getSuitSymbol
};

// Example usage (uncomment to try):
// const { createDeck, shuffle, draw } = require('./cardDeck');
// let deck = createDeck();
// shuffle(deck);
// console.log(draw(deck, 2));
