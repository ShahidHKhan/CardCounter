/*
 * main.js
 * Simple demo: shuffle deck and distribute to players
 */

const { initShuffledDeck, dealHands, remaining } = require('./cardDealer');
const { getSuitSymbol } = require('./cardDeck');

console.log('=== Card Distribution Demo ===\n');

// Initialize and shuffle the deck
console.log('Shuffling deck...');
initShuffledDeck();
console.log(`Deck ready: ${remaining()} cards\n`);

// Deal cards to 4 players, 2 cards each
console.log('Distributing 2 cards to 4 players:\n');
const hands = dealHands(4, 2);

// Show each player's hand
hands.forEach((hand, index) => {
  const cards = hand.map(card => `${card.rank}${getSuitSymbol(card.suit)}`).join(' ');
  console.log(`Player ${index + 1}: ${cards}`);
});

console.log(`\nCards remaining in deck: ${remaining()}`);

