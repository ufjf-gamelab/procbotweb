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
import { MascotModal } from './components/MascotModal';
import { Tutorial } from './components/Tutorial';
import type { TutorialStep } from './components/Tutorial';
import robotTip from './assets/robot_tip.png';
import { LoopEditor } from './components/LoopEditor';
import type { Cmd, CmdKind, Level } from './game/types';
import { getFunctionTheme } from './game/constants';
import { useGameAudio } from './game/useGameAudio';
import { isMuted, setMuted, playClick, playBump } from './game/audio';
import { hasSeenTutorial, markTutorialSeen, getSpeed, setSpeed } from './game/persistence';
import type { Speed } from './game/persistence';
import {
  AiOutlineHome,
  AiFillStar,
  AiOutlinePlayCircle,
  AiOutlinePauseCircle,
  AiOutlineStepForward,
  AiOutlineReload,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineSetting
} from "react-icons/ai";
import { TbBraces } from "react-icons/tb";
import { GiTurtle, GiRabbit, GiSprint } from "react-icons/gi";
import { SettingsModal } from './components/SettingsModal';
import './styles.css';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const SPEED_ORDER: Speed[] = ['slow', 'normal', 'fast'];
const SPEED_CONFIG: Record<Speed, { label: string; stepDelay: number; Icon: typeof GiTurtle }> = {
  slow: { label: 'Lento', stepDelay: 900, Icon: GiTurtle },
  normal: { label: 'Normal', stepDelay: 500, Icon: GiRabbit },
  fast: { label: 'Rápido', stepDelay: 250, Icon: GiSprint },
};

const TUTORIAL_STEPS: TutorialStep[] = [
  { target: 'board', text: 'Esse é o tabuleiro! Seu robô precisa se mover até a lâmpada e acender ela. 💡' },
  { target: 'palette', text: 'Aqui ficam os comandos. Toque ou arraste um comando para o Programa Principal.' },
  { target: 'program-main', text: 'Os comandos que você escolher aparecem aqui, na ordem que o robô vai seguir.' },
  { target: 'play-button', text: 'Quando terminar seu programa, toque em Play para ver o robô em ação!' },
];

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
  const [openFunctionId, setOpenFunctionId] = useState<string | null>(null);
  const [openLoopId, setOpenLoopId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [renamingFuncId, setRenamingFuncId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wobbleTarget, setWobbleTarget] = useState<string | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState(() => hasSeenTutorial());
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const runLoopActiveRef = useRef(false);
  const [muted, setMutedState] = useState(() => isMuted());
  const [speed, setSpeedState] = useState<Speed>(() => getSpeed());
  const [autoPlaying, setAutoPlaying] = useState(false);
  useGameAudio(state);

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

  useEffect(() => {
    if (state.functions.length === 0) {
      setOpenFunctionId(null);
      return;
    }
    if (!state.functions.some(f => f.id === openFunctionId)) {
      setOpenFunctionId(state.functions[0].id);
    }
  }, [state.functions, openFunctionId]);

  useEffect(() => {
    if (!state.running || !state.currentCmd) return;
    const { ownerId } = state.currentCmd;

    if (ownerId === 'main') {
      setOpenLoopId(null);
      setActiveCmdTab('main');
    } else if (state.functions.some(f => f.id === ownerId)) {
      setOpenLoopId(null);
      setActiveCmdTab(ownerId);
      setOpenFunctionId(ownerId);
    } else if (state.loops.some(l => l.id === ownerId)) {
      setOpenLoopId(ownerId);
    }
  }, [state.currentCmd, state.running, state.functions, state.loops]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  async function handleRun() {
    if (state.program.length === 0) return;

    if (state.running || runLoopActiveRef.current) {
      dispatch({ type: 'setRunning', value: false });
      return;
    }

    runLoopActiveRef.current = true;
    setAutoPlaying(true);
    dispatch({ type: 'resetLevel' });

    const stepDelay = SPEED_CONFIG[speed].stepDelay;

    try {
      await delay(300);
      dispatch({ type: 'setRunning', value: true });

      while (
        stateRef.current.stepIndex < stateRef.current.program.length &&
        !stateRef.current.win
      ) {
        dispatch({ type: 'stepOnce' });
        await delay(stepDelay);

        if (!stateRef.current.running) break;
      }

      dispatch({ type: 'setRunning', value: false });
    } finally {
      runLoopActiveRef.current = false;
      setAutoPlaying(false);
    }
  }

  function handleStep() {
    if (state.program.length === 0 || autoPlaying) return;
    playClick();

    if (!state.running) {
      dispatch({ type: 'resetLevel' });
      dispatch({ type: 'setRunning', value: true });
    }
    dispatch({ type: 'stepOnce' });
  }

  function handleDragStart(e: DragStartEvent) {
    if (state.running) return;
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
    if (state.running) return;
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

      if (!targetContainer) return;

      if (isContainerFull(targetContainer)) {
        triggerWobble(targetContainer);
        return;
      }

      if (targetContainer === 'main') {
        dispatch({ type: 'ADD_TO_MAIN', kind });
      } else if (state.loops.find(l => l.id === targetContainer)) {
        dispatch({ type: 'ADD_TO_LOOP', loopId: targetContainer, kind });
      } else {
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

  function isContainerFull(containerId: string): boolean {
    if (containerId === 'main') return state.program.length >= (state.level.maxMain ?? 99);
    const func = state.functions.find(f => f.id === containerId);
    if (func) return func.program.length >= func.maxCommands;
    const loop = state.loops.find(l => l.id === containerId);
    if (loop) return loop.program.length >= loop.maxCommands;
    return false;
  }

  function triggerWobble(containerId: string) {
    playBump();
    setWobbleTarget(containerId);
    window.setTimeout(() => {
      setWobbleTarget(current => (current === containerId ? null : current));
    }, 450);
  }

  function handleAddByClick(kind: CmdKind) {
    if (state.running) return;
    if (String(kind) === 'REPEAT_NEW') {
      dispatch({ type: 'ADD_LOOP', container: activeCmdTab });
      return;
    }
    if (isContainerFull(activeCmdTab)) {
      triggerWobble(activeCmdTab);
      return;
    }
    playClick();
    if (activeCmdTab === 'main') {
      dispatch({ type: 'ADD_TO_MAIN', kind });
    } else {
      dispatch({ type: 'ADD_TO_FUNC', funcId: activeCmdTab, kind });
    }
  }

  function handleToggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playClick();
  }

  function handleCycleSpeed() {
    const nextIndex = (SPEED_ORDER.indexOf(speed) + 1) % SPEED_ORDER.length;
    const next = SPEED_ORDER[nextIndex];
    setSpeed(next);
    setSpeedState(next);
    playClick();
  }

  function handleAddToLoop(kind: CmdKind | string) {
    if (!openLoopId || state.running) return;
    if (isContainerFull(openLoopId)) {
      triggerWobble(openLoopId);
      return;
    }
    playClick();
    dispatch({ type: 'ADD_TO_LOOP', loopId: openLoopId, kind: kind as CmdKind });
  }

  function handleOpenLoop(loopId: string) {
    if (state.running) return;
    setOpenLoopId(loopId);
  }

  function handleCloseLoop() {
    setOpenLoopId(null);
  }

  function handleDeleteLoop(loopId: string) {
    if (state.running) return;
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
    if (state.running) return;
    const extraCount = state.functions.length - state.level.functionsConfig.length;
    const maxExtra = state.level.maxExtraFunctions ?? 0;
    if (extraCount >= maxExtra) return;

    const id = `custom-${crypto.randomUUID().slice(0, 8)}`;
    const name = `F${state.functions.length + 1}`;
    dispatch({ type: 'ADD_FUNCTION', id, name, maxCommands: 5 });
    setActiveCmdTab(id);
    setOpenFunctionId(id);
  }

  function handleRemoveFunction(funcId: string) {
    if (state.running) return;
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

  function handleFinishTutorial() {
    markTutorialSeen();
    setTutorialSeen(true);
    setMascotTipOpen(false);
  }

  const showTutorial = view === 'GAME' && state.level.id === '1' && !tutorialSeen;

  useEffect(() => {
    if (view !== 'GAME') return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (confirmClearOpen || settingsOpen || mascotTipOpen || showWinModal || showTutorial || renamingFuncId) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleRun();
      } else if (e.key === 'r' || e.key === 'R') {
        playClick();
        dispatch({ type: 'resetLevel' });
      } else if (e.key === 'ArrowRight') {
        handleStep();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, confirmClearOpen, settingsOpen, mascotTipOpen, showWinModal, showTutorial, renamingFuncId, state.program.length, state.running, autoPlaying]);

  function renderRunControls() {
    return (
      <div className="btns btns-compact">
        <button
          onClick={handleRun}
          disabled={!state.running && state.program.length === 0}
          className={`btn-action btn-run ${state.running ? 'is-stop' : ''}`}
          title={state.running ? 'Parar' : 'Executar'}
          aria-label={state.running ? 'Parar execução' : 'Executar'}
          data-tutorial="play-button"
        >
          {state.running ? (
            <AiOutlinePauseCircle size={16} aria-hidden="true" />
          ) : (
            <AiOutlinePlayCircle size={16} aria-hidden="true" />
          )}
        </button>

        <button
          onClick={handleStep}
          disabled={autoPlaying || state.program.length === 0}
          className="btn-action btn-step"
          title="Passo a passo"
          aria-label="Executar um comando por vez"
        >
          <AiOutlineStepForward size={16} aria-hidden="true" />
        </button>

        <button
          onClick={() => { playClick(); dispatch({ type: 'resetLevel' }); }}
          disabled={state.running}
          className="btn-action btn-reset"
          title="Reiniciar"
          aria-label="Reiniciar"
        >
          <AiOutlineReload size={16} aria-hidden="true" />
        </button>
      </div>
    );
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

  const activeChainByOwner = new Map<string, string>();
  if (state.running) {
    for (let i = 0; i < state.callStack.length - 1; i++) {
      const frame = state.callStack[i];
      const cmd = frame.program[frame.stepIndex];
      if (cmd) activeChainByOwner.set(frame.ownerId, cmd.id);
    }
    if (state.currentCmd) activeChainByOwner.set(state.currentCmd.ownerId, state.currentCmd.id);
  }
  const execCmdIdFor = (ownerId: string) => activeChainByOwner.get(ownerId) ?? null;

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

      {showTutorial ? (
        <Tutorial steps={TUTORIAL_STEPS} onFinish={handleFinishTutorial} />
      ) : (
        <MascotModal
          isOpen={mascotTipOpen}
          tip={mascotTip}
          onClose={() => setMascotTipOpen(false)}
        />
      )}

      <SettingsModal
        isOpen={settingsOpen}
        muted={muted}
        speedInfo={SPEED_CONFIG[speed]}
        onToggleMute={handleToggleMute}
        onCycleSpeed={handleCycleSpeed}
        onClose={() => setSettingsOpen(false)}
      />

      <div className="level-controls">
       
      </div>

        <header className="game-header">
        <div className="header-center">
          <div className="nav-group">
            <button
              className="home-btn nav-home-btn"
              aria-label="Voltar ao menu de fases"
              onClick={handleBackToMenu}>
              <AiOutlineHome size={18} aria-hidden="true" />
            </button>

            <button
              className="home-btn mascot-header-btn"
              aria-label="Mostrar dica do mascote"
              onClick={() => setMascotTipOpen(true)}>
              <img src={robotTip} alt="" className="mascot-header-icon" />
            </button>

            <button
              className="home-btn settings-header-btn"
              aria-label="Configurações"
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen(true)}>
              <AiOutlineSetting size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="nav-hud-card">
            <div className="status-badge phase-badge">
              <span className="phase-badge-label">FASE </span>
              <span className="phase-badge-number">{state.level.id.padStart(2, '0')}</span>
            </div>
            <div className="status-badge stars-badge" title={`${currentStars} de 3 estrelas`} aria-label={`${currentStars} de 3 estrelas`}>
              <AiFillStar className="icon-star" aria-hidden="true" />
              <span className="stars-badge-value">{currentStars}</span>
              <span className="stars-badge-suffix"> / 3</span>
            </div>
          </div>
        </div>
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
          <div className="center">
            <Board level={state.level} robot={state.robot} lit={state.lit} bump={state.bump} running={state.running} />
          </div>

          {!openLoop && (
            <div className="command-rail" data-tutorial="palette">
              <Palette
                onCommandClick={(kind) => handleAddByClick(kind as CmdKind)}
                functions={state.functions}
                showLoopTile={canAddLoop}
                disabled={state.running}
              />
            </div>
          )}

          <div className="sidebar">
            <div className="right">
              {openLoop ? (
                <LoopEditor
                  loop={openLoop}
                  loopsConfig={loopsConfig!}
                  functions={state.functions}
                  onClose={handleCloseLoop}
                  onAddCommand={handleAddToLoop}
                  onRemoveCommand={(cmdId) => { playClick(); dispatch({ type: 'REMOVE_FROM_LOOP', loopId: openLoop.id, id: cmdId }); }}
                  onSetTimes={(times) => dispatch({ type: 'SET_LOOP_TIMES', loopId: openLoop.id, times })}
                  onDeleteLoop={() => handleDeleteLoop(openLoop.id)}
                  executingCmdId={execCmdIdFor(openLoop.id)}
                  disabled={state.running}
                  wobble={wobbleTarget === openLoop.id}
                />
              ) : (
                <>
                  <div id="cmd-panel-main" className="cmd-tab-panel is-active">
                    <Program
                        programId="main"
                        title="Programa Principal"
                        count={countMain}
                        max={limitMain}
                        isFull={countMain >= limitMain}
                        items={state.program}
                        onRemove={(id) => { playClick(); dispatch({ type: 'REMOVE_FROM_MAIN', id }); }}
                        functions={state.functions}
                        loops={state.loops}
                        onOpenLoop={handleOpenLoop}
                        isSelected={activeCmdTab === 'main'}
                        onSelect={() => setActiveCmdTab('main')}
                        executingCmdId={execCmdIdFor('main')}
                        disabled={state.running}
                        wobble={wobbleTarget === 'main'}
                        headerActions={renderRunControls()}
                        cornerAction={
                          <div className="btns btns-compact">
                            <button
                              onClick={() => setConfirmClearOpen(true)}
                              disabled={state.running || (state.program.length === 0 && state.functions.every(f => f.program.length === 0))}
                              className={`btn-action btn-clear ${(state.program.length > 0 || state.functions.some(f => f.program.length > 0)) ? 'is-armed' : ''}`}
                              title="Limpar tudo"
                              aria-label="Limpar todos os comandos"
                            >
                              <AiOutlineDelete size={16} aria-hidden="true" />
                            </button>
                          </div>
                        }
                      />
                  </div>

                  {state.functions.length > 0 && (
                    <div className="cmd-tabs" role="tablist" aria-label="Funções">
                      {state.functions.map((funcData) => {
                        const isActive = openFunctionId === funcData.id;
                        const isSelectedTab = activeCmdTab === funcData.id;
                        const isCustom = !state.level.functionsConfig.some(c => c.id === funcData.id);
                        const canDelete = isCustom && funcData.program.length === 0 && !state.running;
                        const isFull = funcData.program.length >= funcData.maxCommands;
                        const isRenaming = renamingFuncId === funcData.id;
                        const fillPct = funcData.maxCommands > 0 ? Math.min(100, (funcData.program.length / funcData.maxCommands) * 100) : 0;
                        const selectTab = () => { setOpenFunctionId(funcData.id); setActiveCmdTab(funcData.id); };

                        return (
                          <div
                            key={funcData.id}
                            role="tab"
                            tabIndex={0}
                            id={`cmd-tab-${funcData.id}`}
                            aria-selected={isActive}
                            aria-controls={`cmd-panel-${funcData.id}`}
                            className={`cmd-tab ${isActive ? 'is-active' : ''} ${isSelectedTab ? 'is-selected' : ''} ${execCmdIdFor(funcData.id) ? 'is-executing-tab' : ''}`}
                            onClick={selectTab}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTab(); } }}
                            title={`Função ${funcData.name}`}
                            style={{ '--function-accent': getFunctionTheme(funcData.id).color } as React.CSSProperties}
                          >
                            {isRenaming ? (
                              <input
                                type="text"
                                autoFocus
                                value={funcData.name}
                                maxLength={12}
                                className="cmd-tab-rename-input"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => dispatch({ type: 'RENAME_FUNC', funcId: funcData.id, newName: e.target.value })}
                                onBlur={() => setRenamingFuncId(null)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.currentTarget.blur(); } }}
                              />
                            ) : (
                              <>
                                {isActive && <TbBraces className="cmd-tab-icon" size={14} aria-hidden="true" />}
                                <span className="cmd-tab-label">{funcData.name}</span>
                                <span className="cmd-tab-count">{funcData.program.length}/{funcData.maxCommands}</span>
                                <span className="cmd-tab-track">
                                  <span
                                    className={`cmd-tab-fill ${isFull ? 'is-full' : ''} ${wobbleTarget === funcData.id ? 'is-wobbling' : ''}`}
                                    style={{ width: `${fillPct}%` }}
                                  />
                                </span>
                              </>
                            )}

                            {isActive && !state.running && !isRenaming && (
                              <span className="cmd-tab-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="cmd-tab-icon-btn"
                                  title="Renomear função"
                                  aria-label="Renomear função"
                                  onClick={() => setRenamingFuncId(funcData.id)}
                                >
                                  <AiOutlineEdit size={12} aria-hidden="true" />
                                </button>
                                {canDelete && (
                                  <button
                                    type="button"
                                    className="cmd-tab-icon-btn cmd-tab-icon-danger"
                                    title="Remover função"
                                    aria-label="Remover função"
                                    onClick={() => handleRemoveFunction(funcData.id)}
                                  >
                                    <AiOutlineDelete size={12} aria-hidden="true" />
                                  </button>
                                )}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {canAddCustomFunction && (
                        <button
                          type="button"
                          className="cmd-tab cmd-tab-add"
                          onClick={handleAddFunction}
                          disabled={state.running}
                          title="Adicionar nova função"
                          aria-label="Adicionar nova função"
                        >
                          +
                        </button>
                      )}
                    </div>
                  )}

                  {(() => {
                    const funcData = state.functions.find(f => f.id === openFunctionId);
                    if (!funcData) return null;

                    return (
                      <div
                        key={funcData.id}
                        id={`cmd-panel-${funcData.id}`}
                        role="tabpanel"
                        aria-labelledby={`cmd-tab-${funcData.id}`}
                        className="cmd-tab-panel is-active"
                      >
                        <Program
                          programId={funcData.id}
                          title={funcData.name}
                          count={funcData.program.length}
                          max={funcData.maxCommands}
                          hideHeader
                          items={funcData.program}
                          isFull={funcData.program.length >= funcData.maxCommands}
                          onRemove={(cmdId) => {
                            playClick();
                            dispatch({
                              type: 'REMOVE_FROM_FUNC',
                              funcId: funcData.id,
                              id: cmdId
                            });
                          }}
                          functions={state.functions}
                          loops={state.loops}
                          onOpenLoop={handleOpenLoop}
                          isSelected={activeCmdTab === funcData.id}
                          onSelect={() => setActiveCmdTab(funcData.id)}
                          accentColor={getFunctionTheme(funcData.id).color}
                          executingCmdId={execCmdIdFor(funcData.id)}
                          disabled={state.running}
                          wobble={wobbleTarget === funcData.id}
                        />
                      </div>
                    );
                  })()}
                  {canAddCustomFunction && state.functions.length === 0 && (
                    <button
                      type="button"
                      className="btn-action add-function-btn"
                      onClick={handleAddFunction}
                      disabled={state.running}
                    >
                      <span>+ Nova função</span>
                    </button>
                  )}
                  <div className="spacer" />
                </>
              )}
            </div>

            {!openLoop && (
              <div className="action-tray">
                {renderRunControls()}
              </div>
            )}
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
