import { useEffect, useRef } from 'react';
import type { GameState } from './types';
import { playStep, playTurn, playLight, playBump, playWin } from './audio';

export function useGameAudio(state: GameState): void {
  const prevRobot = useRef({ x: state.robot.x, y: state.robot.y, dir: state.robot.dir });
  const prevLit = useRef<Set<string>>(new Set(state.lit));
  const lastBumpSeq = useRef(state.bump?.seq ?? 0);
  const prevWin = useRef(state.win);

  useEffect(() => {
    const prev = prevRobot.current;
    const moved = prev.x !== state.robot.x || prev.y !== state.robot.y;
    const turned = !moved && prev.dir !== state.robot.dir;
    prevRobot.current = { x: state.robot.x, y: state.robot.y, dir: state.robot.dir };

    if (!state.running) return;
    if (moved) playStep();
    else if (turned) playTurn();
  }, [state.robot.x, state.robot.y, state.robot.dir, state.running]);

  useEffect(() => {
    const key = `${state.robot.x},${state.robot.y}`;
    const justLit = state.lit.has(key) && !prevLit.current.has(key);
    prevLit.current = state.lit;

    if (justLit && state.running) playLight();
  }, [state.lit, state.robot.x, state.robot.y, state.running]);

  useEffect(() => {
    if (!state.bump || !state.running || state.bump.seq === lastBumpSeq.current) return;
    lastBumpSeq.current = state.bump.seq;
    playBump();
  }, [state.bump, state.running]);

  useEffect(() => {
    if (state.win && !prevWin.current) playWin();
    prevWin.current = state.win;
  }, [state.win]);
}
