import { useEffect, useReducer, useRef, useState } from 'react';
import { 
  DndContext, 
  MouseSensor, 
  TouchSensor, 
  KeyboardSensor, 
  useSensor, 
  useSensors, 
  closestCenter, 
  DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { allLevels } from './game/levels';
import { LevelSelect } from './components/LevelSelect';
import { arrayMove } from '@dnd-kit/sortable';
import { reducer, initialState } from './game/reducer';
import { Palette } from './components/Palette';
import { Program } from './components/Program';
import { Command } from './components/Command';
import { Board } from './components/Board';
import { WinModal } from './components/WinModal';
import type { Cmd, CmdKind } from './game/types';
import { 
  AiFillPlayCircle, 
  AiOutlineDelete, 
  AiOutlineReload,
  AiOutlineHome,
} from "react-icons/ai";
import './styles.css';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<string[]>(["1","2","3","4","5","6","7"]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showWinModal, setShowWinModal] = useState(false);
  const [view, setView] = useState<'MENU' | 'GAME'>('MENU');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    if (state.win) {
      if (!completedLevels.includes(state.level.id)) {
        setCompletedLevels(prev => [...prev, state.level.id]);
      }
      const timer = setTimeout(() => {
        setShowWinModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowWinModal(false);
    }
  }, [state.win, state.level.id, completedLevels]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  async function handleRun() {
    if (state.program.length === 0) return;

    if (state.running) {
      dispatch({ type: 'setRunning', value: false });
      return; 
    }

    dispatch({ type: 'resetLevel' });
    
    await delay(400);
    dispatch({ type: 'setRunning', value: true });

    while (
      stateRef.current.stepIndex < stateRef.current.program.length && 
      !stateRef.current.win
    ) {
      dispatch({ type: 'stepOnce' });
      await delay(500); 

      if (!stateRef.current.running) break;
    }

    dispatch({ type: 'setRunning', value: false });
  }

  function handleDragStart(e: DragStartEvent) {
  setActiveId(String(e.active.id));
  }

  function handleSelectLevel(level: any) {
    dispatch({ type: 'load_level', level: level });
    setView('GAME');
  }

  function handleBackToMenu() {
    setView('MENU');
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    function findContainer(id: string) {
      if (id === 'program-drop-main') return 'main';
      
      if (id.startsWith('program-drop-')) {
        const containerId = id.replace('program-drop-', '');
        if (containerId !== 'main') return containerId; 
      }

      if (state.program.find(i => `prog-${i.id}` === id)) return 'main';

      for (const func of state.functions) {
        if (func.program.find(i => `prog-${i.id}` === id)) {
          return func.id; 
        }
      }

      return null;
    }

    const targetContainer = findContainer(overId);

    if (activeId.startsWith('pal-')) {
      const kind = activeId.replace('pal-', '') as CmdKind;
      
      if (targetContainer === 'main') {
        dispatch({ type: 'ADD_TO_MAIN', kind });
      } else if (targetContainer && targetContainer !== 'main') {
        dispatch({ type: 'ADD_TO_FUNC', funcId: targetContainer, kind });
      }
      return;
    }

    if (activeId.startsWith('prog-') && activeId !== overId) {
      const activeContainer = findContainer(activeId); 
      
      if (activeContainer && activeContainer === targetContainer) {
          
          if (activeContainer === 'main') {
            const oldIndex = state.program.findIndex(c => `prog-${c.id}` === activeId);
            const newIndex = state.program.findIndex(c => `prog-${c.id}` === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
              const newProgram = arrayMove(state.program, oldIndex, newIndex);
              dispatch({ type: 'SET_PROGRAM_MAIN', program: newProgram });
            }
          }
          else {
            const funcState = state.functions.find(f => f.id === activeContainer);
            if (funcState) {
              const oldIndex = funcState.program.findIndex(c => `prog-${c.id}` === activeId);
              const newIndex = funcState.program.findIndex(c => `prog-${c.id}` === overId);

              if (oldIndex !== -1 && newIndex !== -1) {
                const newProgram = arrayMove(funcState.program, oldIndex, newIndex);
                dispatch({ type: 'SET_PROGRAM_FUNC', funcId: activeContainer, program: newProgram });
              }
            }
          }
      }
    }
  }

  function handleAddByClick(kind: CmdKind) {
    dispatch({ type: 'ADD_TO_MAIN', kind });
  }
  const currentRealIndex = allLevels.findIndex(l => l.id === state.level.id);
  const isLastLevel = currentRealIndex === allLevels.length - 1;

  function handleNextLevel() {
    const actualIndex = allLevels.findIndex(l => l.id === state.level.id);
    
    if (actualIndex < allLevels.length - 1) {
      const nextLevel = allLevels[actualIndex + 1];
      dispatch({ type: 'load_level', level: nextLevel });
    } else {
      setView('MENU');
    }
  }

  function handleReplay() {
    dispatch({ type: 'resetLevel' });
    dispatch({ type: 'clearWin' });
  }

  function handleMenu() {
    setView('MENU');
  }

  const activeCommand: Cmd | undefined = activeId
    ? (
      state.program.find(cmd => `prog-${cmd.id}` === activeId) ||
      state.functions.flatMap(f => f.program).find(cmd => `prog-${cmd.id}` === activeId)
    ) : undefined;

  const limitMain = state.level.maxMain ?? 99;
  const countMain = state.program.length;
  const titleMain = state.level.maxMain 
    ? `Programa Principal (${countMain}/${limitMain})` 
    : "Programa Principal";

  // const limitF1 = state.level.maxF1 ?? 0;
  // const countF1 = state.function1.program.length;
  // const showF1 = limitF1 > 0;
  // const titleF1 = `Função (${countF1}/${limitF1})`;


  if (view === 'MENU') {
    return (
      <>
        <div id="rotate-overlay">Gire o aparelho para jogar</div>
        
        <LevelSelect 
          onSelectLevel={handleSelectLevel}
          completedLevels={completedLevels}
        />
      </>
    );
  }

  return (
    <>
      <div id="rotate-overlay">Gire o aparelho para jogar</div>
 
      <WinModal 
              isOpen={showWinModal}
              stepsCount={state.program.length}
              isLastLevel={isLastLevel}
              onNextLevel={handleNextLevel}
              onReplay={handleReplay}
              onMenu={handleMenu}
            />

      <div className="level-controls">
       <button 
        onClick={handleBackToMenu}
        style={{ position: 'fixed', top: 10, left: 10, zIndex: 100 }}
        >
        <AiOutlineHome size={18} />
        </button>
      </div>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}>
        <main className="layout">
          <div className="center">
            <Board level={state.level} robot={state.robot} lit={state.lit} />
            <div className="controls-wrap">
                <div className="btns">
                  <button 
                    onClick={handleRun} 
                    disabled={state.running || state.program.length === 0}
                    className="btn-action"
                  >
                    <AiFillPlayCircle size={18} />
                    <span>Executar</span>
                  </button>

                  <button 
                    onClick={() => dispatch({ type: 'resetProgram' })} 
                    disabled={state.running}
                    className="btn-action"
                  >
                    <AiOutlineDelete size={18} />
                    <span>Limpar</span>
                  </button>

                  <button 
                    onClick={() => dispatch({ type: 'resetLevel' })} 
                    disabled={state.running}
                    className="btn-action"
                  >
                    <AiOutlineReload size={18} />
                    <span>Reiniciar</span>
                  </button>
                </div>
              </div>
          </div>

          <div className="sidebar">
            <div className="left">
              <Palette 
                onCommandClick={(kind) => dispatch({ type: 'ADD_TO_MAIN', kind: kind as CmdKind })}
                functions={state.functions} 
              />
            </div>
            <div className="right">
              <Program
                  programId="main"
                  title="Programa Principal" 
                  limitText={`(${countMain}/${limitMain})`} 
                  isFull={countMain >= limitMain}
                  items={state.program}
                  onRemove={(id) => dispatch({ type: 'REMOVE_FROM_MAIN', id })}
                  functions={state.functions} 
                />
              {state.level.functionsConfig.map((config) => {
                const funcData = state.functions.find(f => f.id === config.id);
                
                if (!funcData) return null;

                return (
                  <Program
                    key={config.id}
                    programId={config.id}
                    title={funcData.name} 
                    limitText={`(${funcData.program.length}/${config.maxCommands})`}
                    onTitleChange={(newName) => dispatch({ 
                      type: 'RENAME_FUNC', 
                      funcId: config.id, 
                      newName: newName 
                    })}
                    items={funcData.program}
                    isFull={funcData.program.length >= config.maxCommands}
                    onRemove={(cmdId) => dispatch({ 
                      type: 'REMOVE_FROM_FUNC', 
                      funcId: config.id, 
                      id: cmdId 
                    })}
                    functions={state.functions}
                  />
                );
              })}
              <div className="spacer" />
            </div>
          </div>
        </main>
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            activeId.startsWith('prog-') && activeCommand ? (
              <div style={{ height: '50px' }}>
                <Command 
                  kind={activeCommand.kind} 
                  id={activeCommand.id} 
                  isDragging 
                  functionName={
                    activeCommand.kind.startsWith('CALL_') 
                      ? state.functions.find(f => String(f.id).toUpperCase() === activeCommand.kind.replace('CALL_', ''))?.name
                      : state.functions.find(f => f.id === activeCommand.kind)?.name
                  } 
                />
      </div>
    ) : activeId.startsWith('pal-') ? (
      <div style={{ height: '50px' }}>
        <Command 
          kind={activeId.replace('pal-', '') as CmdKind} 
          id="ghost" 
          isDragging 
          functionName={
            activeId.includes('CALL_')
              ? state.functions.find(f => String(f.id).toUpperCase() === activeId.replace('pal-CALL_', ''))?.name
              : state.functions.find(f => f.id === activeId.replace('pal-', ''))?.name
          }
        />
      </div>
    ) : null
  ) : null}
</DragOverlay>
      </DndContext>
    </>
  );
}
