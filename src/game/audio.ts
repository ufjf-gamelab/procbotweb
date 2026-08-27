const footstepFiles = Object.values(
  import.meta.glob('../assets/kenney_impact-sounds/Audio/footstep_concrete_*.ogg', { eager: true, import: 'default' })
) as string[];

const turnFiles = Object.values(
  import.meta.glob('../assets/kenney_impact-sounds/Audio/impactMetal_light_*.ogg', { eager: true, import: 'default' })
) as string[];

import lightFile from '../assets/kenney_impact-sounds/Audio/impactMining_002.ogg';

const bumpFiles = Object.values(
  import.meta.glob('../assets/kenney_impact-sounds/Audio/impactMetal_heavy_*.ogg', { eager: true, import: 'default' })
) as string[];

const clickFiles = Object.values(
  import.meta.glob('../assets/kenney_impact-sounds/Audio/impactGeneric_light_*.ogg', { eager: true, import: 'default' })
) as string[];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const MUTE_KEY = 'procbot-muted';
let muted = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    // localStorage indisponível — só não persiste a preferência
  }
}

function playFile(url: string, volume: number): void {
  if (muted || !url) return;
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {});
}

export function playStep(): void {
  playFile(pick(footstepFiles), 0.35);
}

export function playTurn(): void {
  playFile(pick(turnFiles), 0.3);
}

export function playLight(): void {
  playFile(lightFile, 0.5);
}

export function playBump(): void {
  playFile(pick(bumpFiles), 0.4);
}

export function playClick(): void {
  playFile(pick(clickFiles), 0.3);
}

export function playWin(): void {
  playFile(lightFile, 0.55);
  setTimeout(() => playFile(lightFile, 0.55), 180);
}
