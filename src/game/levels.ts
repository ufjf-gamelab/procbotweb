import type { Level } from './types';

export const level1: Level = {
  id: '1',
  width: 4, 
  height: 4,
  start: { x: 0, y: 1, dir: 1 },
  lamps: [{ x: 3, y: 1 }],
  maxMain: 10,
  maxF1: 0,
};

export const level2: Level = {
  id: '2',
  width: 4, 
  height: 4,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 2, y: 2 }],
  maxMain: 10,
  maxF1: 0,
};

export const level3: Level = {
  id: '3',
  width: 5, 
  height: 5,
  start: { x: 0, y: 4, dir: 0 },
  lamps: [{ x: 1, y: 3 }, { x: 2, y: 2 }],
  maxMain: 10,
  maxF1: 0,
};

export const level4: Level = {
  id: '4',
  width: 6, 
  height: 6,
  start: { x: 0, y: 5, dir: 1 },
  lamps: [{ x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }],
  maxMain: 15,
  maxF1: 5,
};

export const level5: Level = {
  id: '5',
  width: 6, 
  height: 6,
  start: { x: 0, y: 5, dir: 1 },
  lamps: [{ x: 0, y: 3 }, { x: 0, y: 1 }],
  maxMain: 3,
  maxF1: 4,
};

export const level6: Level = {
  id: '6',
  width: 5, 
  height: 5,
  start: { x: 1, y: 1, dir: 1 },
  lamps: [{ x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 1 }],
  maxMain: 4,
  maxF1: 5,
};

export const level7: Level = {
  id: '7',
  width: 6, 
  height: 5,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 1, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 2 }],
  maxMain: 4,
  maxF1: 9,
};

export const level8: Level = {
  id: '8',
  width: 7, 
  height: 7,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 3, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3 }, { x: 6, y: 6 }, { x: 3, y: 6 }],
  maxMain: 6,
  maxF1: 6,
};

export const allLevels = [level1, level2, level3, level4, level5, level6, level7, level8];