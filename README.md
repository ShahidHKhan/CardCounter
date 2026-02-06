# CardCounter
Blackjack engine + demo round runner. **FOR FUN PURPOSES ONLY**

## What this repo does
- Models a standard Blackjack shoe, hands, and dealer rules
- Runs a single demo round from `src/main.js`
- Keeps the view layer decoupled (console output today, UI later)

## Quick start
```bash
node src/main.js
```

## Project layout
```
src/
	models/
		Card.js       # Card model + suit symbols
		Deck.js       # Shoe, shuffle, burn card, auto-reshuffle
		Hand.js       # Ace-aware value logic + hand status flags
	services/
		Dealer.js     # Deal/Hit + dealer "brain" (S17/H17)
		Evaluator.js  # Outcomes + payout math
	engine/
		GameState.js  # State machine (Betting -> Dealing -> Turns -> Settlement)
	view/
		ConsoleView.js# Console-only rendering
	main.js         # Demo entry point
```

## Core rules implemented
- Ace handling: Aces start at 11; subtract 10 while total > 21
- Dealer: hits until >= 17, optional hit-soft-17 rule
- Burn card: one card is burned before each round
- Reshuffle: automatic at 75% penetration (configurable)

## Legacy files
Older root files are archived under `archive/legacy/` for reference only.

## Notes
- This is a demo engine, not a full casino simulator.
- Add interactive play by swapping the auto-play loop in `src/main.js` with a CLI or UI.
