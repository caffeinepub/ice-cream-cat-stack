# Ice Cream Cat Game

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A 2D browser game where the player stacks cat-themed ice cream scoops on a cone
- Multiple cat types as scoops (e.g., tabby, calico, siamese, black cat, orange cat, etc.)
- Falling or selectable scoops that the player places on an ice cream cone
- A stacking mechanic: scoops stack on top of each other on the cone
- Visual cat faces/designs on each scoop
- Score tracking based on number of scoops stacked
- Game over condition (scoop falls off or misses the cone)
- Simple, fun, colorful UI

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Generate backend with minimal state (high scores, game sessions)
2. Build Canvas-based 2D game in React:
   - Ice cream cone at the bottom center
   - Scoops fall or swing from top, player clicks/taps to drop them
   - Each scoop has a cat face design drawn on canvas
   - Stacking logic: scoops land and stack on cone/previous scoop
   - Physics: slight sway/offset to make stacking challenging
   - Score = number of successfully stacked scoops
   - Game over when scoop misses the cone stack
   - High score display
   - Cat variety: 6+ cat types with unique colors and markings
