export type Dir = 0 | 1 | 2 | 3; 
export type CmdKind = 'ANDAR'|'ESQUERDA'|'DIREITA'|'ACENDER'|'CALL_F1';
export type Cmd = { id: string; kind: CmdKind };

export type Pos = { x: number; y: number };
export type Level = {
  id: string;
  width: number; height: number;
  start: { x: number; y: number; dir: Dir };
  lamps: Pos[]; 
  maxMain?: number,
  maxF1?: number,
};

export type FunctionDef = {
  name: string;
  program: Cmd[];
};

export type GameState = {
  level: Level;
  robot: { x: number; y: number; dir: Dir };
  lit: Set<string>;
  program: Cmd[];
  function1: FunctionDef;
  stepIndex: number;
  running: boolean;
  win: boolean;
  callStack: ExecutionContext[];
};

export type ExecutionContext = {
  program: Cmd[]; 
  stepIndex: number; 
};

export type Action =
  | { type: 'add'; kind: CmdKind }
  | { type: 'remove'; id: string }
  | { type: 'reorder'; from: number; to: number }
  | { type: 'resetProgram' }
  | { type: 'resetLevel' }
  | { type: 'setRunning'; value: boolean }
  | { type: 'stepOnce' }
  | { type: 'clearWin' }
  | { type: 'setProgram', program: Cmd[] }
  | { type: 'load_level', level: Level }
  | { type: 'rename_f1', name: string}
  | { type: 'ADD_TO_MAIN'; kind: CmdKind }
  | { type: 'REMOVE_FROM_MAIN'; id: string }
  | { type: 'SET_PROGRAM_MAIN'; program: Cmd[] } 
  | { type: 'ADD_TO_F1'; kind: CmdKind }
  | { type: 'REMOVE_FROM_F1'; id: string }
  | { type: 'SET_PROGRAM_F1'; program: Cmd[] };
;
