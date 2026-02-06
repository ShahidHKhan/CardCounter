/*
 * Hand.js
 * Blackjack Hand model
 *
 * Encapsulates:
 *   - cards in the hand
 *   - value calculation (with proper Ace reduction)
 *   - status flags: busted, blackjack, soft, splittable
 */

const { isAce, formatCard } = require('./Card');

/**
 * Calculate the best Blackjack value for a set of cards.
 *
 * Algorithm (reducer approach from the pro-tip):
 *   1. Sum all card base values (Aces count as 11).
 *   2. For every Ace, subtract 10 while total > 21.
 *
 * Returns { total, soft }
 *   - total: best numeric value
 *   - soft:  true if at least one Ace is still counted as 11
 */
function evaluate(cards) {
  let total = 0;
  let aces  = 0;

  for (const card of cards) {
    total += card.value;
    if (isAce(card)) aces++;
  }

  // Reduce aces from 11 → 1 as long as we're over 21
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return { total, soft: aces > 0 };
}

/**
 * Create a Hand instance.
 *
 * @param {boolean} [isDealerHand=false]  Dealer hands have a hole card face-down.
 * @param {number}  [bet=0]              Wager associated with this hand.
 */
function createHand(isDealerHand = false, bet = 0) {
  const cards = [];
  let settled = false; // locked after stand / bust / blackjack

  /** Add one or more cards to the hand. */
  function addCards(...newCards) {
    cards.push(...newCards);
  }

  /** Current value info. */
  function value() {
    return evaluate(cards);
  }

  /** Total numeric value (convenience). */
  function total() {
    return evaluate(cards).total;
  }

  /** Is the hand soft (an Ace still counted as 11)? */
  function isSoft() {
    return evaluate(cards).soft;
  }

  /** Busted (total > 21). */
  function isBusted() {
    return total() > 21;
  }

  /**
   * Natural Blackjack: exactly 2 cards totalling 21.
   */
  function isBlackjack() {
    return cards.length === 2 && total() === 21;
  }

  /**
   * Can this hand be split?
   * Must be exactly 2 cards with the same rank.
   */
  function canSplit() {
    return cards.length === 2 && cards[0].rank === cards[1].rank;
  }

  /**
   * Can the player double down?
   * Typically allowed only on the first two cards.
   */
  function canDoubleDown() {
    return cards.length === 2;
  }

  /** Split into two new hands, each receiving one card from the original pair. */
  function split() {
    if (!canSplit()) throw new Error('Hand cannot be split');
    const handA = createHand(false, bet);
    const handB = createHand(false, bet);
    handA.addCards(cards[0]);
    handB.addCards(cards[1]);
    return [handA, handB];
  }

  /** Lock the hand (after stand, bust, etc.). */
  function settle() {
    settled = true;
  }

  function isSettled() {
    return settled || isBusted() || isBlackjack();
  }

  /** Get a copy of the cards array. */
  function getCards() {
    return [...cards];
  }

  /** Number of cards. */
  function size() {
    return cards.length;
  }

  /** Get the wager. */
  function getBet() {
    return bet;
  }

  /** Double the wager (for double-down). */
  function doubleBet() {
    bet *= 2;
  }

  /** Pretty-print: "A♠ K♥  (21)" */
  function toString(hideHole = false) {
    if (hideHole && isDealerHand && cards.length >= 2) {
      // Show first card, hide second
      return `${formatCard(cards[0])} [??]`;
    }
    const str = cards.map(formatCard).join(' ');
    const { total: t, soft: s } = evaluate(cards);
    const softLabel = s ? ' soft' : '';
    return `${str}  (${t}${softLabel})`;
  }

  return {
    addCards,
    value,
    total,
    isSoft,
    isBusted,
    isBlackjack,
    canSplit,
    canDoubleDown,
    split,
    settle,
    isSettled,
    getCards,
    size,
    getBet,
    doubleBet,
    toString,
    isDealerHand,
  };
}

module.exports = { createHand, evaluate };
