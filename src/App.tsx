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
import { loadSession, saveSession, restoreGameState } from './game/persistence';
import { computeStars, totalCommandsUsed } from './game/scoring';
import { Palette } from './components/Palette';
import { Program } from './components/Program';
import { Command } from './components/Command';
import { Board } from './components/Board';
import { WinModal } from './components/WinModal';
import { RotateOverlay } from './components/RotateOverlay';
import type { Cmd, CmdKind } from './game/types';
import {
  AiOutlineHome,
  AiFillStar
} from "react-icons/ai";
import {
  GiPlayButton,
  GiBroom,
  GiCycle
} from "react-icons/gi";
import './styles.css';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function App() {
  // const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [saved] = useState(() => loadSession());
  const [completedLevels, setCompletedLevels] = useState<string[]>(saved?.completedLevels ?? ["1","2","3","4","5"]);
  const [levelStars, setLevelStars] = useState<Record<string, number>>(saved?.levelStars ?? {});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, dispatch] = useReducer(reducer, undefined, () => restoreGameState(saved) ?? initialState);
  const [showWinModal, setShowWinModal] = useState(false);
  const [view, setView] = useState<'MENU' | 'GAME'>(saved?.view ?? 'MENU');
  const [mascotTip, setMascotTip] = useState("Vamos lá! Arraste os comandos para o Programa Principal.");
  const [mascotTipOpen, setMascotTipOpen] = useState(true);
  const [activeCmdTab, setActiveCmdTab] = useState<string>('main');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    saveSession({
      completedLevels,
      levelStars,
      view,
      levelId: state.level.id,
      robot: state.robot,
      lit: Array.from(state.lit),
      program: state.program,
      functions: state.functions,
      stepIndex: state.stepIndex,
    });
  }, [completedLevels, levelStars, view, state]);

  useEffect(() => {
    if (state.win) {
      if (!completedLevels.includes(state.level.id)) {
        setCompletedLevels(prev => [...prev, state.level.id]);
      }
      const earnedStars = computeStars(state);
      setLevelStars(prev => ({
        ...prev,
        [state.level.id]: Math.max(prev[state.level.id] ?? 0, earnedStars),
      }));
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
      } else if (activeContainer && targetContainer && activeContainer !== targetContainer) {
        const cmdId = activeId.replace('prog-', '');
        const targetProgram = targetContainer === 'main'
          ? state.program
          : state.functions.find(f => f.id === targetContainer)?.program ?? [];

        const overIsItem = overId.startsWith('prog-');
        const overIndex = overIsItem ? targetProgram.findIndex(c => `prog-${c.id}` === overId) : -1;
        const toIndex = overIndex === -1 ? targetProgram.length : overIndex;

        dispatch({ type: 'MOVE_COMMAND', fromContainer: activeContainer, toContainer: targetContainer, cmdId, toIndex });
      }
    }
  }

  function handleAddByClick(kind: CmdKind) {
    if (activeCmdTab === 'main') {
      dispatch({ type: 'ADD_TO_MAIN', kind });
    } else {
      dispatch({ type: 'ADD_TO_FUNC', funcId: activeCmdTab, kind });
    }
  }

  function handleAddFunction() {
    const extraCount = state.functions.length - state.level.functionsConfig.length;
    const maxExtra = state.level.maxExtraFunctions ?? 0;
    if (extraCount >= maxExtra) return;

    const id = `custom-${crypto.randomUUID().slice(0, 8)}`;
    const name = `F${state.functions.length + 1}`;
    dispatch({ type: 'ADD_FUNCTION', id, name, maxCommands: 5 });
    setActiveCmdTab(id);
  }

  function handleRemoveFunction(funcId: string) {
    dispatch({ type: 'REMOVE_FUNCTION', funcId });
    if (activeCmdTab === funcId) setActiveCmdTab('main');
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
  const currentStars = computeStars(state);
  const canAddCustomFunction =
    (state.functions.length - state.level.functionsConfig.length) < (state.level.maxExtraFunctions ?? 0);

  if (view === 'MENU') {
    return (
      <>
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          completedLevels={completedLevels}
          levelStars={levelStars}
        />
      </>
    );
  }

  return (
    <>

      <WinModal
              isOpen={showWinModal}
              stepsCount={totalCommandsUsed(state)}
              stars={computeStars(state)}
              isLastLevel={isLastLevel}
              onNextLevel={handleNextLevel}
              onReplay={handleReplay}
              onMenu={handleMenu}
            />

      <div className="level-controls">
       
      </div>

        <header className="game-header">
        <div className="header-center">
          <button
            className="home-btn"
            onClick={handleBackToMenu}>
            <AiOutlineHome size={18} />
          </button>

          <div className="status-badge phase-badge">
            <span>FASE {state.level.id.padStart(2, '0')}</span>
          </div>
          <div className="status-badge stars-badge">
            <AiFillStar className="icon-star" />
            <span>{currentStars} / 3</span>
          </div>
        </div>
      </header>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}>
        <main className="layout">
          <aside className={`mascot-area ${mascotTipOpen ? 'tip-open' : ''}`}>
          <div className="mascot-tip-container">
            <img
              src="./src/assets/robot_tip.png"
              alt="Mascote Robô"
              className="mascot-image"
              role="button"
              aria-expanded={mascotTipOpen}
              onClick={() => setMascotTipOpen(open => !open)}
            />

            <div className="speech-bubble" key={mascotTip}>
              <p>{mascotTip}</p>
            </div>
          </div>
        </aside>

          <div className="center">
            <Board level={state.level} robot={state.robot} lit={state.lit} />
            <div className="controls-wrap">
                <div className="btns">
                  <button
                    onClick={handleRun}
                    disabled={state.running || state.program.length === 0}
                    className="btn-action btn-run"
                  >
                    <GiPlayButton size={18} />
                    <span>Executar</span>
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'resetProgram' })}
                    disabled={state.running}
                    className="btn-action btn-clear"
                  >
                    <GiBroom size={18} />
                    <span>Limpar</span>
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'resetLevel' })}
                    disabled={state.running}
                    className="btn-action btn-reset"
                  >
                    <GiCycle size={18} />
                    <span>Reiniciar</span>
                  </button>
                </div>
              </div>
          </div>

          <div className="sidebar">
            <div className="left">
              <Palette
                onCommandClick={(kind) => handleAddByClick(kind as CmdKind)}
                functions={state.functions}
              />
            </div>
            <div className="right">
              <div className="cmd-tabs">
                <button
                  type="button"
                  className={`cmd-tab ${activeCmdTab === 'main' ? 'is-active' : ''}`}
                  onClick={() => setActiveCmdTab('main')}
                >
                  <span className="cmd-tab-label">Programa</span>
                  <span className="cmd-tab-count">{countMain}/{limitMain}</span>
                </button>
                {state.functions.map((funcData) => (
                  <button
                    type="button"
                    key={funcData.id}
                    className={`cmd-tab ${activeCmdTab === funcData.id ? 'is-active' : ''}`}
                    onClick={() => setActiveCmdTab(funcData.id)}
                  >
                    <span className="cmd-tab-label">{funcData.name}</span>
                    <span className="cmd-tab-count">{funcData.program.length}/{funcData.maxCommands}</span>
                  </button>
                ))}
                {canAddCustomFunction && (
                  <button
                    type="button"
                    className="cmd-tab"
                    onClick={handleAddFunction}
                    title="Adicionar nova função"
                  >
                    +
                  </button>
                )}
              </div>

              <div className={`cmd-tab-panel ${activeCmdTab === 'main' ? 'is-active' : ''}`}>
                <Program
                    programId="main"
                    title="Programa Principal"
                    limitText={`(${countMain}/${limitMain})`}
                    isFull={countMain >= limitMain}
                    items={state.program}
                    onRemove={(id) => dispatch({ type: 'REMOVE_FROM_MAIN', id })}
                    functions={state.functions}
                    isSelected={activeCmdTab === 'main'}
                    onSelect={() => setActiveCmdTab('main')}
                  />
              </div>
              {state.functions.map((funcData) => {
                const isCustom = !state.level.functionsConfig.some(c => c.id === funcData.id);

                return (
                  <div
                    key={funcData.id}
                    className={`cmd-tab-panel ${activeCmdTab === funcData.id ? 'is-active' : ''}`}
                  >
                    <Program
                      programId={funcData.id}
                      title={funcData.name}
                      limitText={`(${funcData.program.length}/${funcData.maxCommands})`}
                      onTitleChange={(newName) => dispatch({
                        type: 'RENAME_FUNC',
                        funcId: funcData.id,
                        newName: newName
                      })}
                      items={funcData.program}
                      isFull={funcData.program.length >= funcData.maxCommands}
                      onRemove={(cmdId) => dispatch({
                        type: 'REMOVE_FROM_FUNC',
                        funcId: funcData.id,
                        id: cmdId
                      })}
                      functions={state.functions}
                      isSelected={activeCmdTab === funcData.id}
                      onSelect={() => setActiveCmdTab(funcData.id)}
                      onDelete={isCustom && funcData.program.length === 0 ? () => handleRemoveFunction(funcData.id) : undefined}
                    />
                  </div>
                );
              })}
              {canAddCustomFunction && (
                <button
                  type="button"
                  className="btn-action add-function-btn"
                  onClick={handleAddFunction}
                >
                  <span>+ Nova função</span>
                </button>
              )}
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
