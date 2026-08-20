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
import { ConfirmModal } from './components/ConfirmModal';
import { LoopEditor } from './components/LoopEditor';
import type { Cmd, CmdKind, Level } from './game/types';
import { getFunctionTheme } from './game/constants';
import {
  AiOutlineHome,
  AiFillStar,
  AiOutlinePlayCircle,
  AiOutlineReload,
  AiOutlineCode,
  AiOutlineDelete
} from "react-icons/ai";
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
  const [mascotTip] = useState("Vamos lá! Arraste os comandos para o Programa Principal.");
  const [mascotTipOpen, setMascotTipOpen] = useState(true);
  const [activeCmdTab, setActiveCmdTab] = useState<string>('main');
  const [openLoopId, setOpenLoopId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
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
      loops: state.loops,
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

  function handleSelectLevel(level: Level) {
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

      for (const loop of state.loops) {
        if (loop.program.find(i => `prog-${i.id}` === id)) {
          return loop.id;
        }
      }

      return null;
    }

    function getContainerItems(containerId: string): Cmd[] {
      if (containerId === 'main') return state.program;
      const func = state.functions.find(f => f.id === containerId);
      if (func) return func.program;
      const loop = state.loops.find(l => l.id === containerId);
      if (loop) return loop.program;
      return [];
    }

    function dispatchSetProgram(containerId: string, program: Cmd[]) {
      if (containerId === 'main') {
        dispatch({ type: 'SET_PROGRAM_MAIN', program });
      } else if (state.functions.find(f => f.id === containerId)) {
        dispatch({ type: 'SET_PROGRAM_FUNC', funcId: containerId, program });
      } else if (state.loops.find(l => l.id === containerId)) {
        dispatch({ type: 'SET_PROGRAM_LOOP', loopId: containerId, program });
      }
    }

    const targetContainer = findContainer(overId);

    if (activeId.startsWith('pal-')) {
      const kind = activeId.replace('pal-', '') as CmdKind;

      if (String(kind) === 'REPEAT_NEW') {
        if (targetContainer) {
          dispatch({ type: 'ADD_LOOP', container: targetContainer });
        }
        return;
      }

      if (targetContainer === 'main') {
        dispatch({ type: 'ADD_TO_MAIN', kind });
      } else if (targetContainer && state.loops.find(l => l.id === targetContainer)) {
        dispatch({ type: 'ADD_TO_LOOP', loopId: targetContainer, kind });
      } else if (targetContainer && targetContainer !== 'main') {
        dispatch({ type: 'ADD_TO_FUNC', funcId: targetContainer, kind });
      }
      return;
    }

    if (activeId.startsWith('prog-') && activeId !== overId) {
      const activeContainer = findContainer(activeId);

      if (activeContainer && activeContainer === targetContainer) {
        const containerItems = getContainerItems(activeContainer);
        const oldIndex = containerItems.findIndex(c => `prog-${c.id}` === activeId);
        const newIndex = containerItems.findIndex(c => `prog-${c.id}` === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newProgram = arrayMove(containerItems, oldIndex, newIndex);
          dispatchSetProgram(activeContainer, newProgram);
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
    if (String(kind) === 'REPEAT_NEW') {
      dispatch({ type: 'ADD_LOOP', container: activeCmdTab });
      return;
    }
    if (activeCmdTab === 'main') {
      dispatch({ type: 'ADD_TO_MAIN', kind });
    } else {
      dispatch({ type: 'ADD_TO_FUNC', funcId: activeCmdTab, kind });
    }
  }

  function handleAddToLoop(kind: CmdKind | string) {
    if (!openLoopId) return;
    dispatch({ type: 'ADD_TO_LOOP', loopId: openLoopId, kind: kind as CmdKind });
  }

  function handleOpenLoop(loopId: string) {
    setOpenLoopId(loopId);
  }

  function handleCloseLoop() {
    setOpenLoopId(null);
  }

  function handleDeleteLoop(loopId: string) {
    const loopKind = `LOOP_${loopId}`;
    const mainCmd = state.program.find(c => c.kind === loopKind);

    if (mainCmd) {
      dispatch({ type: 'REMOVE_FROM_MAIN', id: mainCmd.id });
    } else {
      const owner = state.functions.find(f => f.program.some(c => c.kind === loopKind));
      const cmd = owner?.program.find(c => c.kind === loopKind);
      if (owner && cmd) {
        dispatch({ type: 'REMOVE_FROM_FUNC', funcId: owner.id, id: cmd.id });
      }
    }

    setOpenLoopId(null);
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
      state.functions.flatMap(f => f.program).find(cmd => `prog-${cmd.id}` === activeId) ||
      state.loops.flatMap(l => l.program).find(cmd => `prog-${cmd.id}` === activeId)
    ) : undefined;

  const limitMain = state.level.maxMain ?? 99;
  const countMain = state.program.length;
  const currentStars = computeStars(state);
  const canAddCustomFunction =
    (state.functions.length - state.level.functionsConfig.length) < (state.level.maxExtraFunctions ?? 0);
  const loopsConfig = state.level.loopsConfig;
  const canAddLoop = !!loopsConfig && state.loops.length < loopsConfig.maxLoops;
  const openLoop = openLoopId ? state.loops.find(l => l.id === openLoopId) : undefined;

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

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Apagar tudo?"
        message="Isso vai apagar todos os comandos do Programa Principal e das funções."
        confirmLabel="Apagar"
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          dispatch({ type: 'resetProgram' });
          setConfirmClearOpen(false);
        }}
      />

      <div className="level-controls">
       
      </div>

        <header className="game-header">
        <div className="header-center">
          <button
            className="home-btn"
            aria-label="Voltar ao menu de fases"
            onClick={handleBackToMenu}>
            <AiOutlineHome size={18} aria-hidden="true" />
          </button>

          <div className="status-badge phase-badge">
            <span>FASE {state.level.id.padStart(2, '0')}</span>
          </div>
          <div className="status-badge stars-badge" title={`${currentStars} de 3 estrelas`} aria-label={`${currentStars} de 3 estrelas`}>
            <AiFillStar className="icon-star" aria-hidden="true" />
            <span>{currentStars} / 3</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfirmClearOpen(true)}
          disabled={state.running || (state.program.length === 0 && state.functions.every(f => f.program.length === 0))}
          className="header-clear-btn"
          title="Limpar tudo"
          aria-label="Limpar todos os comandos"
        >
          <AiOutlineDelete size={18} aria-hidden="true" />
        </button>
      </header>

      <p className="sr-only" role="status" aria-live="polite">
        {state.win
          ? 'Nível concluído!'
          : state.running
            ? 'Executando programa…'
            : 'Pronto para executar'}
      </p>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}>
        <main className="layout">
          <aside className={`mascot-area ${mascotTipOpen ? 'tip-open' : ''}`}>
          <div className="mascot-tip-container">
            <button
              type="button"
              className="mascot-image-btn"
              aria-expanded={mascotTipOpen}
              aria-controls="mascot-speech-bubble"
              aria-label={mascotTipOpen ? 'Ocultar dica do mascote' : 'Mostrar dica do mascote'}
              onClick={() => setMascotTipOpen(open => !open)}
            >
              <img
                src="./src/assets/robot_tip.png"
                alt=""
                className="mascot-image"
              />
            </button>

            <div id="mascot-speech-bubble" className="speech-bubble" key={mascotTip}>
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
                    title="Executar"
                    aria-label="Executar"
                  >
                    <AiOutlinePlayCircle size={22} aria-hidden="true" />
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'resetLevel' })}
                    disabled={state.running}
                    className="btn-action btn-reset"
                    title="Reiniciar"
                    aria-label="Reiniciar"
                  >
                    <AiOutlineReload size={22} aria-hidden="true" />
                  </button>
                </div>
              </div>
          </div>

          <div className="sidebar">
            {!openLoop && (
              <div className="left">
                <Palette
                  onCommandClick={(kind) => handleAddByClick(kind as CmdKind)}
                  functions={state.functions}
                  showLoopTile={canAddLoop}
                />
              </div>
            )}
            <div className="right">
              {openLoop ? (
                <LoopEditor
                  loop={openLoop}
                  loopsConfig={loopsConfig!}
                  functions={state.functions}
                  onClose={handleCloseLoop}
                  onAddCommand={handleAddToLoop}
                  onRemoveCommand={(cmdId) => dispatch({ type: 'REMOVE_FROM_LOOP', loopId: openLoop.id, id: cmdId })}
                  onSetTimes={(times) => dispatch({ type: 'SET_LOOP_TIMES', loopId: openLoop.id, times })}
                  onDeleteLoop={() => handleDeleteLoop(openLoop.id)}
                />
              ) : (
                <>
                  <div className="cmd-tabs" role="tablist" aria-label="Programa e funções">
                    <button
                      type="button"
                      role="tab"
                      id="cmd-tab-main"
                      aria-selected={activeCmdTab === 'main'}
                      aria-controls="cmd-panel-main"
                      className={`cmd-tab ${activeCmdTab === 'main' ? 'is-active' : ''}`}
                      onClick={() => setActiveCmdTab('main')}
                      title="Programa Principal"
                      aria-label="Programa Principal"
                    >
                      <AiOutlineCode size={16} aria-hidden="true" />
                      <span className="cmd-tab-count">{countMain}/{limitMain}</span>
                    </button>
                    {state.functions.map((funcData) => (
                      <button
                        type="button"
                        role="tab"
                        id={`cmd-tab-${funcData.id}`}
                        aria-selected={activeCmdTab === funcData.id}
                        aria-controls={`cmd-panel-${funcData.id}`}
                        key={funcData.id}
                        className={`cmd-tab ${activeCmdTab === funcData.id ? 'is-active' : ''}`}
                        onClick={() => setActiveCmdTab(funcData.id)}
                        title={`Função ${funcData.name}`}
                        style={{ '--function-accent': getFunctionTheme(funcData.id).color } as React.CSSProperties}
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
                        aria-label="Adicionar nova função"
                      >
                        +
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmClearOpen(true)}
                      disabled={state.running || (state.program.length === 0 && state.functions.every(f => f.program.length === 0))}
                      className="cmd-tab cmd-tab-danger"
                      title="Limpar tudo"
                      aria-label="Limpar todos os comandos"
                    >
                      <AiOutlineDelete size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div
                    id="cmd-panel-main"
                    role="tabpanel"
                    aria-labelledby="cmd-tab-main"
                    className={`cmd-tab-panel ${activeCmdTab === 'main' ? 'is-active' : ''}`}
                  >
                    <Program
                        programId="main"
                        title="Programa Principal"
                        limitText={`(${countMain}/${limitMain})`}
                        isFull={countMain >= limitMain}
                        items={state.program}
                        onRemove={(id) => dispatch({ type: 'REMOVE_FROM_MAIN', id })}
                        functions={state.functions}
                        loops={state.loops}
                        onOpenLoop={handleOpenLoop}
                        isSelected={activeCmdTab === 'main'}
                        onSelect={() => setActiveCmdTab('main')}
                      />
                  </div>
                  {state.functions.map((funcData) => {
                    const isCustom = !state.level.functionsConfig.some(c => c.id === funcData.id);

                    return (
                      <div
                        key={funcData.id}
                        id={`cmd-panel-${funcData.id}`}
                        role="tabpanel"
                        aria-labelledby={`cmd-tab-${funcData.id}`}
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
                          loops={state.loops}
                          onOpenLoop={handleOpenLoop}
                          isSelected={activeCmdTab === funcData.id}
                          onSelect={() => setActiveCmdTab(funcData.id)}
                          onDelete={isCustom && funcData.program.length === 0 ? () => handleRemoveFunction(funcData.id) : undefined}
                          accentColor={getFunctionTheme(funcData.id).color}
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
                </>
              )}
            </div>
          </div>
        </main>
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            activeId.startsWith('prog-') && activeCommand ? (
              <div aria-hidden="true" style={{ height: '50px' }}>
                <Command
                  kind={activeCommand.kind}
                  id={activeCommand.id}
                  isDragging
                  functionName={
                    activeCommand.kind.startsWith('CALL_')
                      ? state.functions.find(f => String(f.id).toUpperCase() === activeCommand.kind.replace('CALL_', ''))?.name
                      : state.functions.find(f => f.id === activeCommand.kind)?.name
                  }
                  loopTimes={
                    activeCommand.kind.startsWith('LOOP_')
                      ? state.loops.find(l => l.id.toLowerCase() === activeCommand.kind.replace('LOOP_', '').toLowerCase())?.times
                      : undefined
                  }
                />
      </div>
    ) : activeId.startsWith('pal-') ? (
      <div aria-hidden="true" style={{ height: '50px' }}>
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
