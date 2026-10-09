import type { Level } from '../types';

// Resolução ótima (7 comandos): MAIN = [F1, F1, F1] | F1 = [ANDAR, ANDAR, ACENDER, DIREITA]
export const p1: Level = {
  id: '9',
  name: 'Procedimentos 1',
  tutorial: 'funcao',
  hint: 'Novidade: a caixa F1 guarda comandos! Monte uma sequência dentro dela e toque em F1 no Programa Principal para executá-la.',
  width: 4,
  height: 4,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }],
  maxMain: 8,
  functionsConfig: [{ id: 'f1', name: 'F1', maxCommands: 6 }],
  optimalCommands: 7,
};

// Resolução ótima (9 comandos): MAIN = [F1, F1, F1, F1] | F1 = [ANDAR, ESQUERDA, ANDAR, DIREITA, ACENDER]
export const p2: Level = {
  id: '10',
  name: 'Procedimentos 2',
  anterior: '9',
  hint: 'O mesmo pedacinho se repete: andar, virar, andar, virar e acender. Crie isso na F1 e chame a F1 várias vezes!',
  width: 5,
  height: 5,
  start: { x: 0, y: 4, dir: 1 },
  lamps: [{ x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }, { x: 4, y: 0 }],
  maxMain: 6,
  functionsConfig: [{ id: 'f1', name: 'F1', maxCommands: 10 }],
  optimalCommands: 9,
};

// Resolução ótima (8 comandos): MAIN = [F1, DIREITA, F1, ESQUERDA, F1] | F1 = [ANDAR, ANDAR, ACENDER]
export const p3: Level = {
  id: '11',
  name: 'Procedimentos 3',
  anterior: '9',
  hint: 'A F1 pode aparecer em vários lugares do caminho, com outros comandos no meio. Qual trecho se repete?',
  width: 5,
  height: 5,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 4, y: 2 }],
  maxMain: 5,
  functionsConfig: [{ id: 'f1', name: 'F1', maxCommands: 3 }],
  optimalCommands: 8,
};

// Resolução ótima (11 comandos): MAIN = [F2] | F1 = [ACENDER, ANDAR, ACENDER, ANDAR, ACENDER] | F2 = [F1, DIREITA, ANDAR, DIREITA, F1]
export const p4: Level = {
  id: '12',
  name: 'Procedimentos 4',
  tutorial: 'segundaFuncao',
  anterior: '10',
  hint: 'Agora você tem F1 e F2! A F2 pode usar a F1 por dentro. Faça uma linha na F1 e as duas linhas na F2.',
  width: 4,
  height: 4,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
  ],
  maxMain: 1,
  functionsConfig: [
    { id: 'f1', name: 'F1', maxCommands: 5 },
    { id: 'f2', name: 'F2', maxCommands: 5 },
  ],
  optimalCommands: 11,
};

// Resolução-alvo (15 comandos; mínimo não provado, espaço de busca grande demais): MAIN = [F2, ESQUERDA, ANDAR, ESQUERDA, F2] | F1 = [ACENDER, ANDAR, ACENDER, ANDAR, ACENDER] | F2 = [F1, DIREITA, ANDAR, DIREITA, F1]
export const p5: Level = {
  id: '13',
  name: 'Procedimentos 5',
  anterior: '12',
  hint: 'Pinte o bloco todo! A F1 acende uma linha, a F2 faz duas linhas e dá para chamar a F2 mais de uma vez.',
  width: 4,
  height: 4,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
  ],
  maxMain: 5,
  functionsConfig: [
    { id: 'f1', name: 'F1', maxCommands: 5 },
    { id: 'f2', name: 'F2', maxCommands: 5 },
  ],
  optimalCommands: 15,
};

// Resolução ótima (9 comandos): MAIN = [F2, F2] | F1 = [ACENDER, ANDAR, ACENDER, ANDAR, DIREITA] | F2 = [F1, F1]
export const p6: Level = {
  id: '14',
  name: 'Procedimentos 6',
  anterior: '13',
  hint: 'Dá para chamar a F1 duas vezes dentro da F2! Um quadrado tem quatro lados iguais: o que a F1 faz em um lado?',
  width: 5,
  height: 5,
  start: { x: 1, y: 1, dir: 1 },
  lamps: [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 },
    { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 },
  ],
  maxMain: 2,
  functionsConfig: [
    { id: 'f1', name: 'F1', maxCommands: 5 },
    { id: 'f2', name: 'F2', maxCommands: 3 },
  ],
  optimalCommands: 9,
};

export const procedimentos: Level[] = [p1, p2, p3, p4, p5, p6];
