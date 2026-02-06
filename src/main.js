/*
 * main.js
 * CardCounter — Blackjack entry point
 *
 * Runs a single automated demo round:
 *   1. Places bets for 2 players
 *   2. Deals initial cards
 *   3. Each player auto-plays (hits until >= 17 or bust)
 *   4. Dealer plays house rules
 *   5. Settles and prints results
 *
 * To add interactive input later, swap the auto-play loop
 * with Inquirer.js prompts (or a web UI).
 */

const { createGame }    = require('./engine/GameState');
const { attachToGame }  = require('./view/ConsoleView');

// ── Configuration ────────────────────────────────────────────────

const GAME_OPTS = {
  numDecks:         1,
  penetration:      0.75,
  dealerHitsSoft17: false,    // S17 rule (most common)
};

const NUM_PLAYERS = 2;
const DEFAULT_BET = 100;

// ── Bootstrap ────────────────────────────────────────────────────

const game = createGame(GAME_OPTS);
attachToGame(game);         // wire console output

console.log('=== Blackjack — CardCounter Demo ===');
console.log(`Players: ${NUM_PLAYERS}  |  Bet: $${DEFAULT_BET}  |  Decks: ${GAME_OPTS.numDecks}\n`);

// ── Round ────────────────────────────────────────────────────────

const bets = Array(NUM_PLAYERS).fill(DEFAULT_BET);
game.placeBets(bets);

// Auto-play each player hand (simple strategy: hit until >= 17)
while (game.getState() === game.State.PLAYER_TURN) {
  const hand = game.getActiveHand();
  if (!hand) break;

  if (hand.total() < 17) {
    game.playerHit();
  } else {
    game.playerStand();
  }
}

// Dealer turn + settlement happen automatically inside the engine.

console.log('Round complete. Old files (cardDeck.js, cardDealer.js, tempMain.js) are preserved for reference.');
