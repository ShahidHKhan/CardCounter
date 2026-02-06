/*
 * ConsoleView.js
 * Pure display layer — only knows how to render game state to the console.
 *
 * Attach to a game engine with `attachToGame(game)` and it will listen
 * for events and print automatically. Can also be called manually.
 */

const { formatCard } = require('../models/Card');
const { Outcome }    = require('../services/Evaluator');

// ── Helpers ──────────────────────────────────────────────────────

const LINE  = '─'.repeat(44);
const DLINE = '═'.repeat(44);

function banner(text) {
  console.log(`\n${DLINE}`);
  console.log(`  ${text}`);
  console.log(DLINE);
}

function divider() {
  console.log(LINE);
}

// ── Display Functions ────────────────────────────────────────────

function showDeal(playerHands, dealerHand) {
  banner('CARDS DEALT');
  console.log(`  Dealer: ${dealerHand.toString(true)}`);   // hide hole card
  divider();
  playerHands.forEach((hand, i) => {
    console.log(`  Player ${i + 1}: ${hand.toString()}`);
  });
  console.log();
}

function showPlayerAction(action, handIndex, hand, card) {
  const label = `Player ${handIndex + 1}`;
  if (action === 'hit') {
    console.log(`  ${label} hits → ${formatCard(card)}   Hand: ${hand.toString()}`);
  } else if (action === 'stand') {
    console.log(`  ${label} stands.  ${hand.toString()}`);
  } else if (action === 'double') {
    console.log(`  ${label} doubles → ${formatCard(card)}   Hand: ${hand.toString()}  (bet doubled)`);
  } else if (action === 'split') {
    console.log(`  ${label} splits!`);
  } else if (action === 'bust') {
    console.log(`  ${label} BUSTS! ${hand.toString()}`);
  }
}

function showDealerReveal(dealerHand) {
  banner('DEALER REVEALS');
  console.log(`  Dealer: ${dealerHand.toString()}`);
}

function showDealerDone(dealerHand) {
  console.log(`  Dealer final: ${dealerHand.toString()}`);
  if (dealerHand.isBusted()) {
    console.log('  Dealer BUSTS!');
  }
}

function showSettlement(results, dealerHand) {
  banner('RESULTS');
  console.log(`  Dealer: ${dealerHand.toString()}`);
  divider();
  results.forEach((r, i) => {
    const tag = outcomeTag(r.outcome);
    const sign = r.net >= 0 ? '+' : '';
    console.log(`  Player ${i + 1}: ${r.hand.toString()}  →  ${tag}  (${sign}${r.net})`);
  });
  console.log();
}

function outcomeTag(outcome) {
  switch (outcome) {
    case Outcome.BLACKJACK:   return '★ BLACKJACK!';
    case Outcome.WIN:         return '✔ WIN';
    case Outcome.DEALER_BUST: return '✔ WIN (dealer bust)';
    case Outcome.PUSH:        return '⇄ PUSH';
    case Outcome.LOSE:        return '✘ LOSE';
    default:                  return outcome;
  }
}

function showActiveHand(handIndex) {
  console.log(`\n  → Player ${handIndex + 1}'s turn (hit / stand / double / split)`);
}

function showStateChange(state) {
  // Optionally log state transitions for debugging
  // console.log(`[state → ${state}]`);
}

// ── Auto-Attach ──────────────────────────────────────────────────

/**
 * Wire up all game events to the console view functions.
 */
function attachToGame(game) {
  game.on('dealt', ({ playerHands, dealerHand }) => {
    showDeal(playerHands, dealerHand);
  });

  game.on('playerHit', ({ handIndex, card, hand }) => {
    showPlayerAction('hit', handIndex, hand, card);
  });

  game.on('playerStand', ({ handIndex, hand }) => {
    showPlayerAction('stand', handIndex, hand);
  });

  game.on('playerDouble', ({ handIndex, card, hand }) => {
    showPlayerAction('double', handIndex, hand, card);
  });

  game.on('playerSplit', ({ handIndex, hands }) => {
    showPlayerAction('split', handIndex, hands[0]);
  });

  game.on('playerBust', ({ handIndex, hand }) => {
    showPlayerAction('bust', handIndex, hand);
  });

  game.on('dealerReveal', ({ dealerHand }) => {
    showDealerReveal(dealerHand);
  });

  game.on('dealerDone', ({ dealerHand }) => {
    showDealerDone(dealerHand);
  });

  game.on('settlement', ({ results, dealerHand }) => {
    showSettlement(results, dealerHand);
  });

  game.on('activeHandChange', ({ handIndex }) => {
    showActiveHand(handIndex);
  });

  game.on('stateChange', (s) => {
    showStateChange(s);
  });
}

module.exports = {
  banner,
  divider,
  showDeal,
  showPlayerAction,
  showDealerReveal,
  showDealerDone,
  showSettlement,
  showActiveHand,
  attachToGame,
};
