import type { Level } from './types';
import { basicos } from './levels/basicos';
import { procedimentos } from './levels/procedimentos';
import { lacos } from './levels/lacos';

export type LevelBlock = { key: string; title: string; levels: Level[] };

export const levelBlocks: LevelBlock[] = [
  { key: 'basicos', title: 'Básicos', levels: basicos },
  { key: 'procedimentos', title: 'Procedimentos', levels: procedimentos },
  { key: 'lacos', title: 'Laços', levels: lacos },
];

export const allLevels: Level[] = [...basicos, ...procedimentos, ...lacos];
