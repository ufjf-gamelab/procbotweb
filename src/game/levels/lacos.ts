import type { Level } from '../types';

// Resolução ótima (4 comandos): MAIN = [F1] | F1 = [ANDAR, ACENDER, F1]
export const l1: Level = {
  id: '15',
  name: 'Laços 1',
  hint: 'Novo truque: uma função pode chamar ela mesma! Ponha F1 dentro da própria F1 e ela se repete até acender tudo.',
  allowRecursion: true,
  width: 6,
  height: 6,
  start: { x: 0, y: 2, dir: 1 },
  lamps: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }],
  maxMain: 2,
  functionsConfig: [{ id: 'f1', name: 'F1', maxCommands: 3 }],
  optimalCommands: 4,
};

// Resolução ótima (4 comandos): MAIN = [F1] | F1 = [ACENDER, ANDAR, F1]
export const l2: Level = {
  id: '16',
  name: 'Laços 2',
  anterior: '15',
  hint: 'O robô já começa em cima de uma lâmpada! Na F1 a ordem importa: acender primeiro, andar depois. E chame a F1 de novo!',
  allowRecursion: true,
  width: 6,
  height: 6,
  start: { x: 2, y: 0, dir: 2 },
  lamps: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }],
  maxMain: 2,
  functionsConfig: [{ id: 'f1', name: 'F1', maxCommands: 3 }],
  optimalCommands: 4,
};

// Resolução ótima (5 comandos): MAIN = [F1] | F1 = [ANDAR, ACENDER, ESQUERDA, F1]
export const l3: Level = {
  id: '17',
  name: 'Laços 3',
  anterior: '15',
  hint: 'Um quadradinho virando para a esquerda! Cada volta é: andar, acender, virar. Termine a F1 chamando a própria F1!',
  allowRecursion: true,
  width: 5,
  height: 5,
  start: { x: 3, y: 3, dir: 0 },
  lamps: [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }],
  maxMain: 2,
  functionsConfig: [{ id: 'f1', name: 'F1', maxCommands: 4 }],
  optimalCommands: 5,
};

// Resolução ótima (6 comandos): MAIN = [F1] | F1 = [ANDAR, ANDAR, ACENDER, DIREITA, F1]
export const l4: Level = {
  id: '18',
  name: 'Laços 4',
  anterior: '17',
  hint: 'Um quadrado grande: cada lado tem 2 passos e uma lâmpada no canto. A F1 faz um lado e chama a F1 outra vez!',
  allowRecursion: true,
  width: 5,
  height: 5,
  start: { x: 1, y: 1, dir: 1 },
  lamps: [{ x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 1 }],
  maxMain: 2,
  functionsConfig: [{ id: 'f1', name: 'F1', maxCommands: 5 }],
  optimalCommands: 6,
};

// Resolução ótima (9 comandos): MAIN = [F1] | F1 = [F2, DIREITA, F2, ESQUERDA, F1] | F2 = [ANDAR, ANDAR, ACENDER]
export const l5: Level = {
  id: '19',
  name: 'Laços 5',
  anterior: '18',
  hint: 'Guarde o pedacinho que se repete (andar, andar, acender) na F2. A F1 usa a F2, vira, usa a F2, vira para o outro lado e chama a própria F1!',
  allowRecursion: true,
  width: 7,
  height: 7,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 6, y: 4 }, { x: 6, y: 6 }],
  maxMain: 1,
  functionsConfig: [
    { id: 'f1', name: 'F1', maxCommands: 5 },
    { id: 'f2', name: 'F2', maxCommands: 3 },
  ],
  optimalCommands: 9,
};

// Resolução ótima (8 comandos): MAIN = [F1] | F1 = [F2, F2, F2, DIREITA, F1] | F2 = [ANDAR, ACENDER]
export const l6: Level = {
  id: '20',
  name: 'Laços 6',
  anterior: '19',
  hint: 'Um anel grande! Cada lado tem 3 passos. A F2 anda e acende uma casa; a F1 usa a F2 três vezes, vira e chama a própria F1.',
  allowRecursion: true,
  width: 5,
  height: 5,
  start: { x: 1, y: 1, dir: 1 },
  lamps: [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
    { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 4 },
    { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 },
  ],
  maxMain: 1,
  functionsConfig: [
    { id: 'f1', name: 'F1', maxCommands: 5 },
    { id: 'f2', name: 'F2', maxCommands: 2 },
  ],
  optimalCommands: 8,
};

export const lacos: Level[] = [l1, l2, l3, l4, l5, l6];
