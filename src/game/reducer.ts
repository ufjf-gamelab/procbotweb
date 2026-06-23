import type { Action, GameState, Cmd, CmdKind } from './types';
import { 
  // level1, 
  // level2, 
  level8 } from './levels';

const key = (x: number, y: number) => `${x},${y}`;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const initialProgram: Cmd[] = [];

export const initialState: GameState = {
  level: level8,
  robot: { ...level8.start },
  lit: new Set<string>(),
  program: initialProgram,
  function1: {
    name: "Função 1",
    program: [],
  },
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
    s.robot.dir = ((s.robot.dir + 3) % 4) as any;
  } else if (kind === 'DIREITA') {
    s.robot.dir = ((s.robot.dir + 1) % 4) as any;
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
      return { ...state, 
        program: [], 
        function1: { 
          ...state.function1, 
          program: [] 
        },
        stepIndex: 0, 
        running: false, 
        win: false };
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

      if (cmd.kind === 'CALL_F1') {
        if (state.function1.program.length === 0) {
           currentContext.stepIndex += 1;
           stack[stack.length - 1] = currentContext;
           return { ...state, callStack: stack };
        }

        stack.push({ program: state.function1.program, stepIndex: 0 });
        
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
    case 'load_level':
    return {
      ...initialState,
      level: action.level,
      robot: { ...action.level.start },
    };
    case 'rename_f1':
      return { ...state, function1: { ...state.function1, name: action.name } };
    
      case 'ADD_TO_MAIN':
        var limit = state.level.maxMain ?? 99;
        if (state.program.length >= limit) {
        return state; 
      }
      return { 
        ...state, 
        program: [...state.program, { id: crypto.randomUUID(), kind: action.kind }] 
      };

    case 'REMOVE_FROM_MAIN':
      return { 
        ...state, 
        program: state.program.filter(c => c.id !== action.id) 
      };

    case 'SET_PROGRAM_MAIN':
      return { 
        ...state, 
        program: action.program 
      };

    case 'ADD_TO_F1':
      limit = state.level.maxF1 ?? 99;

      if (limit === 0 || state.function1.program.length >= limit) {
        return state;
      }

      if (action.kind === 'CALL_F1') {
        alert("Uma função não pode chamar ela mesma!"); 
        return state;
      }
      
      return { 
        ...state, 
        function1: {
          ...state.function1,
          program: [...state.function1.program, { id: crypto.randomUUID(), kind: action.kind }]
        }
      };

    case 'REMOVE_FROM_F1':
      return { 
        ...state, 
        function1: {
          ...state.function1,
          program: state.function1.program.filter(c => c.id !== action.id)
        }
      };

    case 'SET_PROGRAM_F1':
      return { 
        ...state, 
        function1: {
          ...state.function1,
          program: action.program
        }
      };

    default: return state;
  }
}
