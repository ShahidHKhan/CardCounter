/*
 * Deck.js
 * Manages one or more standard 52-card decks with shuffle, draw, burn,
 * and automatic reshuffle at a configurable penetration threshold.
 */

const { SUITS, RANKS, createCard } = require('./Card');

// Default penetration: reshuffle when 75 % of the shoe has been dealt
const DEFAULT_PENETRATION = 0.75;

/**
 * Build a fresh 52-card array.
 */
function buildSingleDeck() {
  const cards = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      cards.push(createCard(rank, suit));
    }
  }
  return cards;
}

/**
 * Fisher–Yates in-place shuffle. Returns the same array.
 */
function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Create a Deck (shoe) instance.
 *
 * @param {number} [numDecks=1]        How many 52-card decks to combine.
 * @param {number} [penetration=0.75]  Fraction of shoe dealt before reshuffle.
 */
function createDeck(numDecks = 1, penetration = DEFAULT_PENETRATION) {
  let cards = [];
  let totalCards = 0;
  let discardPile = [];

  /** (Re)build, shuffle, and reset the shoe. */
  function reset() {
    cards = [];
    discardPile = [];
    for (let d = 0; d < numDecks; d++) {
      cards.push(...buildSingleDeck());
    }
    totalCards = cards.length;
    fisherYatesShuffle(cards);
  }

  // Initialise on creation
  reset();

  /** Burn `count` cards (move to discard without returning them). */
  function burn(count = 1) {
    const burned = cards.splice(0, count);
    discardPile.push(...burned);
    return burned;
  }

  /**
   * Draw `count` cards from top of shoe.
   * If shoe has hit the penetration threshold, auto-reshuffles first.
   */
  function draw(count = 1) {
    if (needsReshuffle()) {
      reshuffle();
    }
    if (count > cards.length) {
      // Not enough cards even after reshuffle — return what we can
      count = cards.length;
    }
    const drawn = cards.splice(0, count);
    return drawn;
  }

  /** Move drawn / discarded cards back in and reshuffle. */
  function reshuffle() {
    cards.push(...discardPile);
    discardPile = [];
    totalCards = cards.length;
    fisherYatesShuffle(cards);
  }

  /** Discard cards (e.g. after a round is over). */
  function discard(...discardedCards) {
    discardPile.push(...discardedCards);
  }

  /** Has the shoe passed the penetration point? */
  function needsReshuffle() {
    return cards.length <= Math.floor(totalCards * (1 - penetration));
  }

  function remaining() {
    return cards.length;
  }

  return {
    reset,
    burn,
    draw,
    discard,
    reshuffle,
    needsReshuffle,
    remaining,
  };
}

module.exports = { createDeck };
