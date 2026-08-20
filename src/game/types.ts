export type Dir = 0 | 1 | 2 | 3; 
export type CmdKind = 'ANDAR'|'ESQUERDA'|'DIREITA'|'ACENDER';
export type Cmd = { id: string; kind: CmdKind };

export type Pos = { x: number; y: number };
export type LoopsConfig = { maxLoops: number; maxCommands: number; minTimes: number; maxTimes: number };
export type Level = {
  id: string;
  width: number; height: number;
  start: { x: number; y: number; dir: Dir };
  lamps: Pos[];
  maxMain?: number,
  functionsConfig: { id: string; name: string; maxCommands: number }[];
  maxExtraFunctions?: number;
  loopsConfig?: LoopsConfig;
  optimalCommands: number;
};

export type FunctionDef = {
  name: string;
  program: Cmd[];
};

export type LoopDef = { id: string; times: number; program: Cmd[]; maxCommands: number };

export type GameState = {
  level: Level;
  robot: { x: number; y: number; dir: Dir };
  lit: Set<string>;
  program: Cmd[];
  functions: { id: string; name: string; program: Cmd[]; maxCommands: number }[];
  loops: LoopDef[];
  stepIndex: number;
  running: boolean;
  win: boolean;
  callStack: ExecutionContext[];
  currentCmd: { id: string; ownerId: string } | null;
};

export type ExecutionContext = {
  program: Cmd[];
  stepIndex: number;
  remainingIterations?: number;
  ownerId: string;
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
  | { type: 'ADD_TO_MAIN'; kind: CmdKind }
  | { type: 'REMOVE_FROM_MAIN'; id: string }
  | { type: 'SET_PROGRAM_MAIN'; program: Cmd[] } 
  | { type: 'ADD_TO_FUNC'; funcId: string; kind: CmdKind }
  | { type: 'REMOVE_FROM_FUNC'; funcId: string; id: string }
  | { type: 'SET_PROGRAM_FUNC'; funcId: string; program: Cmd[] }
  | { type: 'RENAME_FUNC'; funcId: string; newName: string }
  | { type: 'MOVE_COMMAND'; fromContainer: string; toContainer: string; cmdId: string; toIndex: number }
  | { type: 'ADD_FUNCTION'; id: string; name: string; maxCommands: number }
  | { type: 'REMOVE_FUNCTION'; funcId: string }
  | { type: 'ADD_LOOP'; container: string }
  | { type: 'ADD_TO_LOOP'; loopId: string; kind: CmdKind }
  | { type: 'REMOVE_FROM_LOOP'; loopId: string; id: string }
  | { type: 'SET_PROGRAM_LOOP'; loopId: string; program: Cmd[] }
  | { type: 'SET_LOOP_TIMES'; loopId: string; times: number }
;
