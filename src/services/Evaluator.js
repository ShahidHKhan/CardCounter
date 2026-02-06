/*
 * Evaluator.js
 * Compares hands and determines round outcomes.
 *
 * Outcome constants:
 *   WIN          – player wins (1:1 payout)
 *   BLACKJACK    – player natural 21 (3:2 payout)
 *   LOSE         – player loses wager
 *   PUSH         – tie, wager returned
 *   DEALER_BUST  – dealer busted, player wins
 */

const Outcome = Object.freeze({
  WIN:         'WIN',
  BLACKJACK:   'BLACKJACK',
  LOSE:        'LOSE',
  PUSH:        'PUSH',
  DEALER_BUST: 'DEALER_BUST',
});

/**
 * Compare a single player hand against the dealer hand.
 *
 * @param {Hand} playerHand
 * @param {Hand} dealerHand
 * @returns {{ outcome: string, payout: number }}
 *   payout is a multiplier of the bet:
 *     1.5 for blackjack, 1 for win/dealer bust, 0 for push, -1 for loss
 */
function compareHands(playerHand, dealerHand) {
  const pTotal = playerHand.total();
  const dTotal = dealerHand.total();

  // Player busted — automatic loss (already handled before dealer plays,
  // but included here for completeness)
  if (playerHand.isBusted()) {
    return { outcome: Outcome.LOSE, payout: -1 };
  }

  // Player has natural Blackjack
  if (playerHand.isBlackjack()) {
    if (dealerHand.isBlackjack()) {
      return { outcome: Outcome.PUSH, payout: 0 };
    }
    return { outcome: Outcome.BLACKJACK, payout: 1.5 };
  }

  // Dealer busted (and player didn't)
  if (dealerHand.isBusted()) {
    return { outcome: Outcome.DEALER_BUST, payout: 1 };
  }

  // Neither busted — compare totals
  if (pTotal > dTotal) {
    return { outcome: Outcome.WIN, payout: 1 };
  }
  if (pTotal < dTotal) {
    return { outcome: Outcome.LOSE, payout: -1 };
  }

  // Equal totals
  return { outcome: Outcome.PUSH, payout: 0 };
}

/**
 * Settle an array of player hands against the dealer hand.
 * Returns an array of { hand, outcome, payout, net } objects.
 */
function settleRound(playerHands, dealerHand) {
  return playerHands.map(hand => {
    const { outcome, payout } = compareHands(hand, dealerHand);
    return {
      hand,
      outcome,
      payout,
      net: hand.getBet() * payout,
    };
  });
}

module.exports = { Outcome, compareHands, settleRound };
