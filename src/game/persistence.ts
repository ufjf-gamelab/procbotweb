import type { GameState } from './types';
import { allLevels } from './levels';

const STORAGE_KEY = 'procbotweb:session:v1';

export type PersistedSession = {
  completedLevels: string[];
  levelStars: Record<string, number>;
  view: 'MENU' | 'GAME';
  levelId: string;
  robot: { x: number; y: number; dir: 0 | 1 | 2 | 3 };
  lit: string[];
  program: GameState['program'];
  functions: GameState['functions'];
  loops: GameState['loops'];
  stepIndex: number;
};

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

export function saveSession(data: PersistedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponível (modo privado, quota etc.) — sessão simplesmente não persiste
  }
}

export function restoreGameState(saved: PersistedSession | null): GameState | null {
  if (!saved) return null;

  const level = allLevels.find(l => l.id === saved.levelId);
  if (!level) return null;

  return {
    level,
    robot: saved.robot,
    lit: new Set(saved.lit),
    program: saved.program,
    functions: saved.functions,
    loops: saved.loops ?? [],
    callStack: [],
    stepIndex: saved.stepIndex ?? 0,
    running: false,
    win: false,
  };
}
