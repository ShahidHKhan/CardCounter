/*
 * cardDealer.js
 *
 * Dealer utilities that use `cardDeck.js` to create a shuffled deck and deal cards
 * into player hands (arrays). The module keeps a `shuffledDeck` array (in-module
 * state) which is modified as cards are dealt.
 *
 * Exports:
 * - initShuffledDeck(): (re)creates and shuffles the deck in-module and returns it
 * - getDeck(): returns the current shuffled deck array (live reference)
 * - dealToPlayer(playerHand, count = 1): deals `count` cards into `playerHand` (array)
 * - dealHands(numPlayers, cardsEach): deals round-robin `cardsEach` to `numPlayers`, returns array of hands
 * - remaining(): number of cards remaining in deck
 */

const { createDeck, shuffle, draw } = require('./cardDeck');

// In-module state: the active shuffled deck
let shuffledDeck = createDeck();
shuffle(shuffledDeck);

/**
 * Recreate and shuffle a fresh deck (single 52-card deck). Returns the new deck.
 */
function initShuffledDeck() {
  shuffledDeck = createDeck();
  shuffle(shuffledDeck);
  return shuffledDeck;
}

/**
 * Get the current deck (live reference).
 */
function getDeck() {
  return shuffledDeck;
}

/**
 * Deal `count` cards from the top of the shuffled deck into `playerHand` (an array).
 * Returns an array of the drawn cards (may be empty if deck is out of cards).
 */
function dealToPlayer(playerHand, count = 1) {
  if (!Array.isArray(playerHand)) throw new TypeError('playerHand must be an array');
  if (count <= 0) return [];

  const drawn = draw(shuffledDeck, count);
  playerHand.push(...drawn);
  return drawn;
}

/**
 * Deal hands to `numPlayers` players, `cardsEach` cards each. Deals round-robin style.
 * Returns an array of player hand arrays.
 */
function dealHands(numPlayers, cardsEach) {
  if (!Number.isInteger(numPlayers) || numPlayers < 1) throw new TypeError('numPlayers must be a positive integer');
  if (!Number.isInteger(cardsEach) || cardsEach < 0) throw new TypeError('cardsEach must be a non-negative integer');

  const hands = Array.from({ length: numPlayers }, () => []);

  // Deal round-robin: one card to each player per round
  for (let round = 0; round < cardsEach; round++) {
    for (let p = 0; p < numPlayers; p++) {
      const drawn = draw(shuffledDeck, 1);
      if (drawn.length === 0) return hands; // deck exhausted, return what we have
      hands[p].push(drawn[0]);
    }
  }

  return hands;
}

/**
 * Number of cards remaining in deck
 */
function remaining() {
  return shuffledDeck.length;
}

module.exports = {
  initShuffledDeck,
  getDeck,
  dealToPlayer,
  dealHands,
  remaining
};

// Example usage (uncomment to try):
// const dealer = require('./cardDealer');
// dealer.initShuffledDeck();
// const player = [];
// dealer.dealToPlayer(player, 2);
// console.log('Player hand:', player);
// console.log('Remaining in deck:', dealer.remaining());
