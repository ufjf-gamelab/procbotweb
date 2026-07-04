import type { Action, GameState, Cmd, CmdKind, Level, LoopDef, Dir } from './types';
import { level8 } from './levels';

const key = (x: number, y: number) => `${x},${y}`;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const cascadeRemoveLoop = (loops: LoopDef[], removedCmd?: Cmd): LoopDef[] =>
  removedCmd?.kind.startsWith('LOOP_')
    ? loops.filter(l => l.id.toLowerCase() !== removedCmd.kind.slice(5).toLowerCase())
    : loops;

const initialProgram: Cmd[] = [];

const initFunctionsState = (level: Level) => {
  return (level.functionsConfig || []).map(config => ({
    id: config.id,
    name: config.name,
    program: [] as Cmd[],
    maxCommands: config.maxCommands
  }));
};

export const initialState: GameState = {
  level: level8,
  robot: { ...level8.start },
  lit: new Set<string>(),
  program: initialProgram,
  functions: initFunctionsState(level8),
  loops: [],
  callStack: [],
  stepIndex: 0,
  running: false,
  win: false,
};

const fwd = (dir: number) => {
  switch (dir % 4) {
    case 0: return { dx: 0,  dy: -1 }; // N
    case 1: return { dx: 1,  dy: 0  }; // E
    case 2: return { dx: 0,  dy: 1  }; // S
    case 3: return { dx: -1, dy: 0  }; // W
    default: return { dx: 0, dy: 0 };
  }
};

function applyCmd(state: GameState, kind: CmdKind): GameState {
  const s = structuredClone({
    ...state,
    lit: new Set(state.lit),
    robot: { ...state.robot },
  }) as GameState;

  if (kind === 'ANDAR') {
    const { dx, dy } = fwd(s.robot.dir);
    const nx = clamp(s.robot.x + dx, 0, s.level.width - 1);
    const ny = clamp(s.robot.y + dy, 0, s.level.height - 1);
    s.robot.x = nx; s.robot.y = ny; 
  } else if (kind === 'ESQUERDA') {
    s.robot.dir = ((s.robot.dir + 3) % 4) as Dir;
  } else if (kind === 'DIREITA') {
    s.robot.dir = ((s.robot.dir + 1) % 4) as Dir;
  } else if (kind === 'ACENDER') {
    if (s.level.lamps.some(p => p.x === s.robot.x && p.y === s.robot.y)) {
      s.lit.add(key(s.robot.x, s.robot.y));
    }
  }
  const allLit = s.level.lamps.every(p => s.lit.has(key(p.x, p.y)));
  if (allLit) { 
    s.win = true; 
    console.log("VITÓRIA!!")
    s.running = false; 
  }

  return s;
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'add':
      return { ...state, program: [...state.program, { id: crypto.randomUUID(), kind: action.kind }] };
    case 'remove':
      return { ...state, program: state.program.filter(c => c.id !== action.id) };
    case 'reorder': {
      const arr = state.program.slice();
      const [m] = arr.splice(action.from, 1);
      arr.splice(action.to, 0, m);
      return { ...state, program: arr };
    }

    case 'resetProgram':
      return {
        ...state,
        program: [],
        functions: state.functions.map(f => ({ ...f, program: [] })), // Limpa TODAS as funções
        loops: [],
        stepIndex: 0,
        running: false,
        win: false
      };

    case 'load_level':
      return {
        ...initialState,
        level: action.level,
        robot: { ...action.level.start },
        functions: initFunctionsState(action.level),
        loops: [],
        program: [],
      };
      
    case 'setProgram':
      return { ...state, program: action.program }; 
    case 'resetLevel':
      return { ...state, robot: { ...state.level.start }, lit: new Set(), stepIndex: 0, running: false, win: false };
    case 'setRunning':
      if (action.value === true) {
        return {
          ...state,
          running: true,
          callStack: [{ program: state.program, stepIndex: 0 }],
          stepIndex: 0,
        };
      } else {
        return { ...state, running: false, callStack: [] };
      }
    case 'clearWin':
      return { ...state, win: false };

    case 'stepOnce': {
      if (!state.running || state.win || state.callStack.length === 0) {
        return { ...state, running: false };
      }

      const stack = [...state.callStack];
      const currentContext = { ...stack[stack.length - 1] }; 

      if (currentContext.stepIndex >= currentContext.program.length) {
        if (currentContext.remainingIterations && currentContext.remainingIterations > 1) {
          currentContext.remainingIterations -= 1;
          currentContext.stepIndex = 0;
          stack[stack.length - 1] = currentContext;
          return { ...state, callStack: stack };
        }

        stack.pop();
        if (stack.length === 0) {
          return { ...state, running: false, callStack: [] };
        }

        const parentContext = { ...stack[stack.length - 1] };
        parentContext.stepIndex += 1;
        stack[stack.length - 1] = parentContext;
        return { ...state, callStack: stack };
      }

      const cmd = currentContext.program[currentContext.stepIndex];

      if (cmd.kind.startsWith('LOOP_')) {
        const loopId = cmd.kind.slice(5);
        const targetLoopState = state.loops.find(l =>
          l.id.toString().toLowerCase() === loopId.toLowerCase()
        );

        if (!targetLoopState || targetLoopState.program.length === 0 || targetLoopState.times <= 0) {
          currentContext.stepIndex += 1;
          stack[stack.length - 1] = currentContext;
          return { ...state, callStack: stack };
        }

        stack.push({ program: targetLoopState.program, stepIndex: 0, remainingIterations: targetLoopState.times });
        return { ...state, callStack: stack };
      }

      const funcIdFromCommand = cmd.kind.startsWith('CALL_')
        ? cmd.kind.slice(5)
        : cmd.kind;

      const targetFuncState = state.functions.find(f =>
        f.id.toString().toLowerCase() === funcIdFromCommand.toString().toLowerCase()
      );
      // ------------------------------------------

      if (targetFuncState) {
        if (targetFuncState.program.length === 0) {
           currentContext.stepIndex += 1;
           stack[stack.length - 1] = currentContext;
           return { ...state, callStack: stack };
        }

        stack.push({ program: targetFuncState.program, stepIndex: 0 });
        return { ...state, callStack: stack };
      }

      const nextState = applyCmd(state, cmd.kind);
      currentContext.stepIndex += 1;
      stack[stack.length - 1] = currentContext;

      return { 
        ...nextState, 
        callStack: stack,
        stepIndex: stack.length === 1 ? currentContext.stepIndex : state.stepIndex 
      };
    }


    case 'ADD_TO_MAIN': {
      const limit = state.level.maxMain ?? 99;
      if (state.program.length >= limit) return state;

      return {
        ...state,
        program: [...state.program, { id: crypto.randomUUID(), kind: action.kind }]
      };
    }

    case 'REMOVE_FROM_MAIN': {
      const removedCmd = state.program.find(c => c.id === action.id);
      return {
        ...state,
        program: state.program.filter(c => c.id !== action.id),
        loops: cascadeRemoveLoop(state.loops, removedCmd),
      };
    }

    case 'SET_PROGRAM_MAIN':
      return { 
        ...state, 
        program: action.program 
      };

    case 'ADD_TO_FUNC': {
      const funcIndex = state.functions.findIndex(f => f.id === action.funcId);

      if (funcIndex === -1) return state;

      const funcState = state.functions[funcIndex];

      if (funcState.program.length >= funcState.maxCommands) return state;

      if (action.kind.toUpperCase() === `CALL_${action.funcId.toUpperCase()}`) {
        alert("Nesta versão, uma função não pode chamar a si mesma!");
        return state;
      }

      const newFunctions = [...state.functions];
      newFunctions[funcIndex] = {
        ...funcState,
        program: [...funcState.program, { id: crypto.randomUUID(), kind: action.kind }]
      };

      return { ...state, functions: newFunctions };
    }

    case 'REMOVE_FROM_FUNC': {
      const funcIndex = state.functions.findIndex(f => f.id === action.funcId);
      if (funcIndex === -1) return state;

      const removedCmd = state.functions[funcIndex].program.find(c => c.id === action.id);
      const newFunctions = [...state.functions];
      newFunctions[funcIndex] = {
        ...newFunctions[funcIndex],
        program: newFunctions[funcIndex].program.filter(c => c.id !== action.id)
      };

      return { ...state, functions: newFunctions, loops: cascadeRemoveLoop(state.loops, removedCmd) };
    }

    case 'SET_PROGRAM_FUNC': {
      const funcIndex = state.functions.findIndex(f => f.id === action.funcId);
      if (funcIndex === -1) return state;

      const newFunctions = [...state.functions];
      newFunctions[funcIndex] = {
        ...newFunctions[funcIndex],
        program: action.program
      };

      return { ...state, functions: newFunctions };
    }

    case 'RENAME_FUNC': {
      const funcIndex = state.functions.findIndex(f => f.id === action.funcId);
      if (funcIndex === -1) return state;

      const newFunctions = [...state.functions];
      newFunctions[funcIndex] = {
        ...newFunctions[funcIndex],
        name: action.newName 
      };

      return { ...state, functions: newFunctions };
    }

    case 'MOVE_COMMAND': {
      const { fromContainer, toContainer, cmdId, toIndex } = action;
      if (fromContainer === toContainer) return state;

      const getProgram = (containerId: string) =>
        containerId === 'main' ? state.program : state.functions.find(f => f.id === containerId)?.program;

      const sourceProgram = getProgram(fromContainer);
      const cmd = sourceProgram?.find(c => c.id === cmdId);
      if (!sourceProgram || !cmd) return state;

      if (toContainer !== 'main' && cmd.kind.toUpperCase() === `CALL_${toContainer.toUpperCase()}`) {
        alert("Nesta versão, uma função não pode chamar a si mesma!");
        return state;
      }

      const targetLimit = toContainer === 'main'
        ? (state.level.maxMain ?? 99)
        : state.functions.find(f => f.id === toContainer)?.maxCommands ?? 99;

      const targetProgram = getProgram(toContainer);
      if (!targetProgram || targetProgram.length >= targetLimit) return state;

      const newSourceProgram = sourceProgram.filter(c => c.id !== cmdId);
      const newTargetProgram = targetProgram.slice();
      newTargetProgram.splice(Math.min(toIndex, newTargetProgram.length), 0, cmd);

      const applyProgram = (s: GameState, containerId: string, program: Cmd[]): GameState =>
        containerId === 'main'
          ? { ...s, program }
          : { ...s, functions: s.functions.map(f => f.id === containerId ? { ...f, program } : f) };

      let next = applyProgram(state, fromContainer, newSourceProgram);
      next = applyProgram(next, toContainer, newTargetProgram);
      return next;
    }

    case 'ADD_FUNCTION': {
      const extraCount = state.functions.length - state.level.functionsConfig.length;
      const maxExtra = state.level.maxExtraFunctions ?? 0;
      if (extraCount >= maxExtra) return state;

      return {
        ...state,
        functions: [...state.functions, { id: action.id, name: action.name, program: [], maxCommands: action.maxCommands }]
      };
    }

    case 'REMOVE_FUNCTION': {
      const isBaseFunction = state.level.functionsConfig.some(c => c.id === action.funcId);
      const funcState = state.functions.find(f => f.id === action.funcId);
      if (isBaseFunction || !funcState || funcState.program.length > 0) return state;

      return { ...state, functions: state.functions.filter(f => f.id !== action.funcId) };
    }

    case 'ADD_LOOP': {
      const loopsConfig = state.level.loopsConfig;
      if (!loopsConfig) return state;
      if (state.loops.length >= loopsConfig.maxLoops) return state;

      const targetLimit = action.container === 'main'
        ? (state.level.maxMain ?? 99)
        : state.functions.find(f => f.id === action.container)?.maxCommands ?? 99;

      const targetProgram = action.container === 'main'
        ? state.program
        : state.functions.find(f => f.id === action.container)?.program;

      if (!targetProgram || targetProgram.length >= targetLimit) return state;

      const loopId = `loop-${crypto.randomUUID().slice(0, 8)}`;
      const newLoop: LoopDef = {
        id: loopId,
        times: loopsConfig.minTimes,
        program: [],
        maxCommands: loopsConfig.maxCommands,
      };
      const refCmd: Cmd = { id: crypto.randomUUID(), kind: `LOOP_${loopId}` as CmdKind };
      const withLoop: GameState = { ...state, loops: [...state.loops, newLoop] };

      return action.container === 'main'
        ? { ...withLoop, program: [...withLoop.program, refCmd] }
        : { ...withLoop, functions: withLoop.functions.map(f => f.id === action.container ? { ...f, program: [...f.program, refCmd] } : f) };
    }

    case 'ADD_TO_LOOP': {
      const loopIndex = state.loops.findIndex(l => l.id === action.loopId);
      if (loopIndex === -1) return state;

      const loopState = state.loops[loopIndex];
      if (loopState.program.length >= loopState.maxCommands) return state;

      const newLoops = [...state.loops];
      newLoops[loopIndex] = {
        ...loopState,
        program: [...loopState.program, { id: crypto.randomUUID(), kind: action.kind }]
      };

      return { ...state, loops: newLoops };
    }

    case 'REMOVE_FROM_LOOP': {
      const loopIndex = state.loops.findIndex(l => l.id === action.loopId);
      if (loopIndex === -1) return state;

      const newLoops = [...state.loops];
      newLoops[loopIndex] = {
        ...newLoops[loopIndex],
        program: newLoops[loopIndex].program.filter(c => c.id !== action.id)
      };

      return { ...state, loops: newLoops };
    }

    case 'SET_PROGRAM_LOOP': {
      const loopIndex = state.loops.findIndex(l => l.id === action.loopId);
      if (loopIndex === -1) return state;

      const newLoops = [...state.loops];
      newLoops[loopIndex] = { ...newLoops[loopIndex], program: action.program };

      return { ...state, loops: newLoops };
    }

    case 'SET_LOOP_TIMES': {
      const loopIndex = state.loops.findIndex(l => l.id === action.loopId);
      if (loopIndex === -1) return state;

      const loopsConfig = state.level.loopsConfig;
      const min = loopsConfig?.minTimes ?? 1;
      const max = loopsConfig?.maxTimes ?? 99;
      const times = clamp(action.times, min, max);

      const newLoops = [...state.loops];
      newLoops[loopIndex] = { ...newLoops[loopIndex], times };

      return { ...state, loops: newLoops };
    }

    default: return state;
  }
}
