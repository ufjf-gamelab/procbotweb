import type { GameState } from './types';
import { allLevels } from './levels';

const STORAGE_KEY = 'procbotweb:session:v2';
const TUTORIAL_KEY = 'procbotweb:tutorial-seen:v1';
const TUTORIALS_KEY = 'procbotweb:tutorials-seen:v2';
const SPEED_KEY = 'procbotweb:speed:v1';

export type Speed = 'slow' | 'normal' | 'fast';

export type PersistedSession = {
  completedLevels: string[];
  levelStars: Record<string, number>;
  geniusLevels?: string[];
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

export function getSeenTutorials(): string[] {
  try {
    const raw = localStorage.getItem(TUTORIALS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (localStorage.getItem(TUTORIAL_KEY) === '1' && !list.includes('basico')) list.push('basico');
    return list;
  } catch {
    return [];
  }
}

export function markTutorialSeen(id: string) {
  try {
    const list = getSeenTutorials();
    if (!list.includes(id)) list.push(id);
    localStorage.setItem(TUTORIALS_KEY, JSON.stringify(list));
  } catch {
    // localStorage indisponível — tutorial simplesmente reaparece na próxima visita
  }
}

export function getSpeed(): Speed {
  try {
    const raw = localStorage.getItem(SPEED_KEY);
    if (raw === 'slow' || raw === 'normal' || raw === 'fast') return raw;
    return 'slow';
  } catch {
    return 'slow';
  }
}

export function setSpeed(value: Speed) {
  try {
    localStorage.setItem(SPEED_KEY, value);
  } catch {
    // localStorage indisponível — velocidade simplesmente não persiste
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
    currentCmd: null,
    bump: null,
  };
}
