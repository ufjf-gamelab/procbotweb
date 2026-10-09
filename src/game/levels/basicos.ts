import type { Level } from '../types';

// Resolução ótima (3 comandos): ANDAR, ANDAR, ACENDER
export const b1: Level = {
  id: '1',
  name: 'Básico 1',
  tutorial: 'basico',
  hint: 'Toque em ⬆ para o robô andar e em 💡 para acender a lâmpada. Depois toque em Play!',
  width: 4,
  height: 4,
  start: { x: 0, y: 1, dir: 1 },
  lamps: [{ x: 2, y: 1 }],
  maxMain: 6,
  functionsConfig: [],
  optimalCommands: 3,
};

// Resolução ótima (6 comandos): ANDAR, ANDAR, ESQUERDA, ANDAR, ANDAR, ACENDER
export const b2: Level = {
  id: '2',
  name: 'Básico 2',
  anterior: '1',
  hint: 'Agora o robô pode virar! Os botões de giro mudam para onde ele olha, e ⬆ sempre anda para a frente.',
  width: 4,
  height: 4,
  start: { x: 0, y: 3, dir: 1 },
  lamps: [{ x: 2, y: 1 }],
  maxMain: 8,
  functionsConfig: [],
  optimalCommands: 6,
};

// Resolução ótima (8 comandos): ANDAR, DIREITA, ANDAR, ACENDER, ANDAR, ESQUERDA, ANDAR, ACENDER
export const b3: Level = {
  id: '3',
  name: 'Básico 3',
  anterior: '2',
  hint: 'Duas lâmpadas em escadinha! Ande, vire, ande e acenda. Depois repita o jeito, virando para o outro lado.',
  width: 4,
  height: 4,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
  maxMain: 10,
  functionsConfig: [],
  optimalCommands: 8,
};

// Resolução ótima (10 comandos): ANDAR x4, DIREITA, ANDAR x4, ACENDER
export const b4: Level = {
  id: '4',
  name: 'Básico 4',
  anterior: '2',
  hint: 'A lâmpada está longe! Conte as casas com calma: quantos passos até a curva e quantos depois dela?',
  width: 5,
  height: 5,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 4, y: 4 }],
  maxMain: 12,
  functionsConfig: [],
  optimalCommands: 10,
};

// Resolução ótima (8 comandos): ACENDER, ANDAR, ANDAR, ACENDER, DIREITA, ANDAR, ANDAR, ACENDER
export const b5: Level = {
  id: '5',
  name: 'Básico 5',
  anterior: '2',
  hint: 'Tem uma lâmpada embaixo do robô! Dá para acender logo no começo. Acender nem sempre é o último comando.',
  width: 5,
  height: 5,
  start: { x: 1, y: 4, dir: 0 },
  lamps: [{ x: 1, y: 4 }, { x: 1, y: 2 }, { x: 3, y: 2 }],
  maxMain: 10,
  functionsConfig: [],
  optimalCommands: 8,
};

// Resolução ótima (10 comandos): ANDAR, ANDAR, DIREITA, ANDAR, ACENDER, ANDAR, ANDAR, ESQUERDA, ANDAR, ACENDER
export const b6: Level = {
  id: '6',
  name: 'Básico 6',
  anterior: '3',
  hint: 'Cuidado: seu programa tem pouco espaço! Planeje o caminho inteiro antes de montar para não gastar comandos à toa.',
  width: 5,
  height: 5,
  start: { x: 0, y: 0, dir: 1 },
  lamps: [{ x: 2, y: 1 }, { x: 3, y: 3 }],
  maxMain: 11,
  functionsConfig: [],
  optimalCommands: 10,
};

// Resolução ótima (10 comandos): ANDAR, ACENDER, ANDAR, ACENDER, DIREITA, ANDAR, ACENDER, DIREITA, ANDAR, ACENDER
export const b7: Level = {
  id: '7',
  name: 'Básico 7',
  anterior: '6',
  hint: 'Quatro lâmpadas em volta de um quadradinho. Vire sempre para o mesmo lado e veja o que se repete a cada canto.',
  width: 4,
  height: 4,
  start: { x: 0, y: 1, dir: 1 },
  lamps: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }],
  maxMain: 12,
  functionsConfig: [],
  optimalCommands: 10,
};

// Resolução ótima (10 comandos): ANDAR, ANDAR, DIREITA, ANDAR, ACENDER, DIREITA, DIREITA, ANDAR, ANDAR, ACENDER
export const b8: Level = {
  id: '8',
  name: 'Básico 8',
  anterior: '2',
  hint: 'Precisa voltar? Vire duas vezes para o mesmo lado e o robô fica de frente para onde veio.',
  width: 5,
  height: 5,
  start: { x: 2, y: 4, dir: 0 },
  lamps: [{ x: 3, y: 2 }, { x: 1, y: 2 }],
  maxMain: 12,
  functionsConfig: [],
  optimalCommands: 10,
};

export const basicos: Level[] = [b1, b2, b3, b4, b5, b6, b7, b8];
