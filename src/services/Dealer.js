/*
 * Dealer.js
 * Casino-rules dealer service.
 *
 * Responsibilities:
 *   - Manage the shoe (deck) and burn card
 *   - Deal initial hands (2 cards each, round-robin)
 *   - Play the dealer hand automatically (hit until >= 17)
 *   - Trigger reshuffle at penetration threshold
 */

const { createDeck }  = require('../models/Deck');
const { createHand }  = require('../models/Hand');

/**
 * Create a Dealer instance.
 *
 * @param {object}  [opts]
 * @param {number}  [opts.numDecks=1]        Number of 52-card decks in shoe.
 * @param {number}  [opts.penetration=0.75]  Fraction dealt before reshuffle.
 * @param {boolean} [opts.dealerHitsSoft17=false]  H17 vs S17 house rule.
 */
function createDealer(opts = {}) {
  const {
    numDecks       = 1,
    penetration    = 0.75,
    dealerHitsSoft17 = false,
  } = opts;

  const shoe = createDeck(numDecks, penetration);

  // ── Shoe helpers ──────────────────────────────────────────────

  /** Burn the top card (standard casino procedure before each round). */
  function burnCard() {
    return shoe.burn(1);
  }

  /** How many cards remain in the shoe. */
  function remaining() {
    return shoe.remaining();
  }

  /** Force a reshuffle (or let the shoe handle it automatically). */
  function reshuffle() {
    shoe.reset();
  }

  /** After a round, return used cards to the discard tray. */
  function discardCards(...cards) {
    shoe.discard(...cards);
  }

  // ── Dealing ───────────────────────────────────────────────────

  /**
   * Deal the opening hands for a round.
   *
   * @param {number} numPlayers  Number of player seats.
   * @param {number[]} bets     Wager for each seat (same order).
   * @returns {{ playerHands: Hand[], dealerHand: Hand }}
   */
  function dealInitial(numPlayers, bets = []) {
    // Burn one card before the round
    burnCard();

    const playerHands = [];
    for (let i = 0; i < numPlayers; i++) {
      playerHands.push(createHand(false, bets[i] || 0));
    }
    const dealerHand = createHand(true);

    // Round-robin: 2 passes, 1 card per seat per pass
    for (let pass = 0; pass < 2; pass++) {
      for (const hand of playerHands) {
        hand.addCards(...shoe.draw(1));
      }
      dealerHand.addCards(...shoe.draw(1));
    }

    return { playerHands, dealerHand };
  }

  /**
   * Hit a hand with one card from the shoe.
   */
  function hit(hand) {
    const [card] = shoe.draw(1);
    if (card) hand.addCards(card);
    return card;
  }

  // ── Dealer "Brain" ────────────────────────────────────────────

  /**
   * Play out the dealer hand according to house rules:
   *   - Must hit on total < 17
   *   - If dealerHitsSoft17, also hits on soft 17
   *   - Stands otherwise
   *
   * Returns the final hand total.
   */
  function playDealerHand(dealerHand) {
    while (shouldDealerHit(dealerHand)) {
      hit(dealerHand);
    }
    dealerHand.settle();
    return dealerHand.total();
  }

  /** Determine whether the dealer must take another card. */
  function shouldDealerHit(hand) {
    const { total, soft } = hand.value();
    if (total < 17) return true;
    if (total === 17 && soft && dealerHitsSoft17) return true;
    return false;
  }

  return {
    burnCard,
    remaining,
    reshuffle,
    discardCards,
    dealInitial,
    hit,
    playDealerHand,
    shouldDealerHit,
  };
}

module.exports = { createDealer };
