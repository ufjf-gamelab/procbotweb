import type { GameState } from './types';

export function totalCommandsUsed(state: GameState): number {
  return state.program.length
    + state.functions.reduce((sum, f) => sum + f.program.length, 0)
    + state.loops.length;
}

export function computeStars(state: GameState): 1 | 2 | 3 {
  const total = totalCommandsUsed(state);
  const optimal = state.level.optimalCommands;

  if (total <= optimal) return 3;
  if (total <= optimal * 1.5) return 2;
  return 1;
}
