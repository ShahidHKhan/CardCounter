/*
 * GameState.js
 * Blackjack game engine — a simple state machine.
 *
 * States:
 *   BETTING      → Collecting wagers from players.
 *   DEALING      → Initial 2-card distribution + burn card.
 *   PLAYER_TURN  → Iterating through player seats for Hit / Stand / Split / Double.
 *   DEALER_TURN  → Dealer draws until >= 17 (or busts).
 *   SETTLEMENT   → Compare scores, distribute payouts.
 *
 * The engine exposes an event-style API so the view layer can react
 * without being coupled to the logic.
 */

const { createDealer }   = require('../services/Dealer');
const { settleRound }    = require('../services/Evaluator');

const State = Object.freeze({
  BETTING:     'BETTING',
  DEALING:     'DEALING',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  SETTLEMENT:  'SETTLEMENT',
  GAME_OVER:   'GAME_OVER',
});

/**
 * Create a new game engine.
 *
 * @param {object} [opts]
 * @param {number} [opts.numDecks=1]
 * @param {number} [opts.penetration=0.75]
 * @param {boolean} [opts.dealerHitsSoft17=false]
 */
function createGame(opts = {}) {
  const dealer = createDealer(opts);

  let state         = State.BETTING;
  let playerHands   = [];      // array of Hand objects
  let dealerHand    = null;
  let activeHandIdx = 0;       // which player hand is acting
  let results       = [];      // filled during SETTLEMENT

  // Simple listener map
  const listeners = {};

  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  // ── State Accessors ───────────────────────────────────────────

  function getState()       { return state; }
  function getPlayerHands() { return playerHands; }
  function getDealerHand()  { return dealerHand; }
  function getActiveHand()  { return playerHands[activeHandIdx] || null; }
  function getActiveIndex() { return activeHandIdx; }
  function getResults()     { return results; }

  // ── State Transitions ─────────────────────────────────────────

  /**
   * BETTING → DEALING
   * @param {number[]} bets  One wager per seat.
   */
  function placeBets(bets) {
    if (state !== State.BETTING) throw new Error(`Cannot bet in state ${state}`);
    if (!bets.length) throw new Error('At least one bet required');

    state = State.DEALING;
    emit('stateChange', state);

    // Deal initial cards
    const dealt = dealer.dealInitial(bets.length, bets);
    playerHands   = dealt.playerHands;
    dealerHand    = dealt.dealerHand;
    activeHandIdx = 0;
    results       = [];

    emit('dealt', { playerHands, dealerHand });

    // Check for dealer natural — if so, skip straight to settlement
    if (dealerHand.isBlackjack()) {
      state = State.SETTLEMENT;
      emit('stateChange', state);
      settle();
      return;
    }

    // Check if all players have blackjack (edge case)
    if (playerHands.every(h => h.isBlackjack())) {
      state = State.SETTLEMENT;
      emit('stateChange', state);
      settle();
      return;
    }

    // Move to player turn
    state = State.PLAYER_TURN;
    emit('stateChange', state);
    skipSettledHands();
  }

  // ── Player Actions ─────────────────────────────────────────────

  function playerHit() {
    if (state !== State.PLAYER_TURN) throw new Error(`Cannot hit in state ${state}`);
    const hand = getActiveHand();
    const card = dealer.hit(hand);
    emit('playerHit', { handIndex: activeHandIdx, card, hand });

    if (hand.isBusted()) {
      hand.settle();
      emit('playerBust', { handIndex: activeHandIdx, hand });
      advanceHand();
    }
  }

  function playerStand() {
    if (state !== State.PLAYER_TURN) throw new Error(`Cannot stand in state ${state}`);
    const hand = getActiveHand();
    hand.settle();
    emit('playerStand', { handIndex: activeHandIdx, hand });
    advanceHand();
  }

  function playerDoubleDown() {
    if (state !== State.PLAYER_TURN) throw new Error(`Cannot double in state ${state}`);
    const hand = getActiveHand();
    if (!hand.canDoubleDown()) throw new Error('Double down not allowed');

    hand.doubleBet();
    const card = dealer.hit(hand);
    hand.settle();
    emit('playerDouble', { handIndex: activeHandIdx, card, hand });

    if (hand.isBusted()) {
      emit('playerBust', { handIndex: activeHandIdx, hand });
    }
    advanceHand();
  }

  function playerSplit() {
    if (state !== State.PLAYER_TURN) throw new Error(`Cannot split in state ${state}`);
    const hand = getActiveHand();
    if (!hand.canSplit()) throw new Error('Split not allowed');

    const [handA, handB] = hand.split();
    // Deal one extra card to each split hand
    dealer.hit(handA);
    dealer.hit(handB);

    // Replace current hand with the two new ones
    playerHands.splice(activeHandIdx, 1, handA, handB);
    emit('playerSplit', { handIndex: activeHandIdx, hands: [handA, handB] });

    skipSettledHands();
  }

  // ── Internal Helpers ──────────────────────────────────────────

  /** Move to next unsettled player hand, or transition to dealer turn. */
  function advanceHand() {
    activeHandIdx++;
    skipSettledHands();
  }

  /** Skip any already-settled hands (blackjacks, busts). */
  function skipSettledHands() {
    while (activeHandIdx < playerHands.length && playerHands[activeHandIdx].isSettled()) {
      activeHandIdx++;
    }
    if (activeHandIdx >= playerHands.length) {
      beginDealerTurn();
    } else {
      emit('activeHandChange', { handIndex: activeHandIdx });
    }
  }

  /** Transition to DEALER_TURN, play out, then settle. */
  function beginDealerTurn() {
    // If every player busted, no need to play dealer
    const allBusted = playerHands.every(h => h.isBusted());

    state = State.DEALER_TURN;
    emit('stateChange', state);

    if (!allBusted) {
      emit('dealerReveal', { dealerHand });
      dealer.playDealerHand(dealerHand);
      emit('dealerDone', { dealerHand });
    } else {
      dealerHand.settle();
    }

    state = State.SETTLEMENT;
    emit('stateChange', state);
    settle();
  }

  /** Compare all hands and produce results. */
  function settle() {
    results = settleRound(playerHands, dealerHand);
    emit('settlement', { results, dealerHand });

    // Discard all cards back into shoe
    const allCards = [];
    for (const h of playerHands) allCards.push(...h.getCards());
    allCards.push(...dealerHand.getCards());
    dealer.discardCards(...allCards);

    state = State.GAME_OVER;
    emit('stateChange', state);
  }

  /** Reset for the next round (goes back to BETTING). */
  function newRound() {
    playerHands   = [];
    dealerHand    = null;
    activeHandIdx = 0;
    results       = [];
    state         = State.BETTING;
    emit('stateChange', state);
  }

  return {
    // State
    getState,
    getPlayerHands,
    getDealerHand,
    getActiveHand,
    getActiveIndex,
    getResults,
    State,

    // Actions
    placeBets,
    playerHit,
    playerStand,
    playerDoubleDown,
    playerSplit,
    newRound,

    // Events
    on,
  };
}

module.exports = { createGame, State };
