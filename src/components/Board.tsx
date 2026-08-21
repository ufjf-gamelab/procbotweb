import type { Level } from '../game/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { type JSX, useState, useEffect, useRef } from 'react';

import robotFront from '../assets/robot_idle.png';
import robotBack from '../assets/robot_back.png';
import robotSide from '../assets/robot_side.png';
import robotDuck from '../assets/robot_duck.png';

const bumpOffset = (dir: number) => {
  switch (dir % 4) {
    case 0: return { x: 0, y: -14 };
    case 1: return { x: 14, y: 0 };
    case 2: return { x: 0, y: 14 };
    case 3: return { x: -14, y: 0 };
    default: return { x: 0, y: 0 };
  }
};

const buildAnimations = (bumpDir: number) => ({
  jump: {
    animate: { x: 0, y: [0, -34, 4, 0], scaleY: [1, 1.22, 0.82, 1], scaleX: [1, 0.85, 1.15, 1], rotate: 0 },
    transition: { duration: 0.5, times: [0, 0.45, 0.75, 1], ease: 'easeOut' as const },
  },
  bump: {
    animate: {
      x: [0, bumpOffset(bumpDir).x, 0],
      y: [0, bumpOffset(bumpDir).y, 0],
      scaleX: [1, 0.85, 1],
      scaleY: [1, 1.12, 1],
      rotate: 0,
    },
    transition: { duration: 0.3, times: [0, 0.4, 1], ease: 'easeOut' as const },
  },
  step: {
    animate: { x: 0, y: [0, 3, -8, -1, 0], scaleY: [1, 0.93, 1.08, 0.97, 1], scaleX: [1, 1.06, 0.94, 1.02, 1], rotate: 0 },
    transition: { duration: 0.46, times: [0, 0.15, 0.55, 0.8, 1], ease: 'easeInOut' as const },
  },
  turn: {
    animate: { x: 0, y: 0, rotate: [0, -10, 8, 0], scaleX: [1, 0.88, 0.94, 1], scaleY: [1, 1.08, 1.02, 1] },
    transition: { duration: 0.32, times: [0, 0.4, 0.75, 1], ease: 'easeOut' as const },
  },
  idle: {
    animate: { x: 0, y: 0, rotate: 0, scaleY: 1, scaleX: 1 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
});

export function Board({
  level, robot, lit, bump, running
}: {
  level: Level;
  robot: { x: number; y: number; dir: 0|1|2|3 };
  lit: Set<string>;
  bump?: { seq: number; dir: 0|1|2|3 } | null;
  running?: boolean;
}) {
  const cells: JSX.Element[] = [];
  const [celebrating, setCelebrating] = useState(false);
  const [moveEffect, setMoveEffect] = useState<'step' | 'turn' | null>(null);
  const [bumping, setBumping] = useState(false);
  const prevRobotRef = useRef({ x: robot.x, y: robot.y, dir: robot.dir });
  const prevLitRef = useRef<Set<string>>(new Set());
  const lastBumpSeq = useRef(0);

  useEffect(() => {
    if (!bump || bump.seq === lastBumpSeq.current || !running) return;
    lastBumpSeq.current = bump.seq;
    setBumping(true);
    const timer = setTimeout(() => setBumping(false), 320);
    return () => clearTimeout(timer);
  }, [bump, running]);

  useEffect(() => {
    if (!running) setBumping(false);
  }, [running]);

  useEffect(() => {
    const currentKey = `${robot.x},${robot.y}`;
    const justLit = lit.has(currentKey) && !prevLitRef.current.has(currentKey);
    prevLitRef.current = lit;

    if (justLit) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [robot.x, robot.y, lit]);

  useEffect(() => {
    const prev = prevRobotRef.current;
    const moved = prev.x !== robot.x || prev.y !== robot.y;
    const turned = !moved && prev.dir !== robot.dir;
    prevRobotRef.current = { x: robot.x, y: robot.y, dir: robot.dir };

    if (!moved && !turned) return;

    setMoveEffect(moved ? 'step' : 'turn');
    const timer = setTimeout(() => setMoveEffect(null), 420);
    return () => clearTimeout(timer);
  }, [robot.x, robot.y, robot.dir]);

  const getRobotAsset = (dir: number, isHappy: boolean) => {
    const baseStyle: React.CSSProperties = {
      width: 'auto',
      height: '140%',       
      position: 'absolute',
      bottom: '0',          
      left: '50%',
      transform: 'translateX(-50%)', 
      pointerEvents: 'none',
      zIndex: 20
    };

    if (isHappy) {
      return { src: robotDuck, style: { ...baseStyle } };
    }

    switch(dir) {
      case 0: return { src: robotBack, style: { ...baseStyle } };
      case 1: return { src: robotSide, style: { ...baseStyle } }; 
      case 2: return { src: robotFront, style: { ...baseStyle } };
      case 3: 
        return { 
          src: robotSide, 
          style: { ...baseStyle, transform: 'translateX(-50%) scaleX(-1)' } 
        };
      default: return { src: robotFront, style: { ...baseStyle } };
    }
  };

  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      
      const lamp = level.lamps.some(p => p.x === x && p.y === y);
      const isLit = lit.has(`${x},${y}`);
      const isRobotHere = (robot.x === x && robot.y === y);
      
      const showJump = isRobotHere && celebrating;
      const showBump = isRobotHere && bumping && !!running;
      const animKind = showJump ? 'jump' : showBump ? 'bump' : moveEffect === 'step' ? 'step' : moveEffect === 'turn' ? 'turn' : 'idle';
      const anim = buildAnimations(bump?.dir ?? 0)[animKind];

      cells.push(
        <div 
          key={`${x}-${y}`} 
          className={clsx('cell', lamp && (isLit ? 'lamp-lit' : 'lamp'), isRobotHere && 'robot-here')}
          style={{ position: 'relative' }}
        >
          {isRobotHere && (
            <motion.div
              layoutId="robot-actor"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                zIndex: 20
              }}
            >
              <motion.div
                animate={anim.animate}
                transition={anim.transition}
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                {(() => {
                  const { src, style } = getRobotAsset(robot.dir, showJump);
                  return (
                    <img
                      src={src}
                      alt=""
                      className="robot-sprite"
                      style={{
                        ...style,
                        filter: showBump ? 'brightness(1.4) saturate(1.6) drop-shadow(0 0 6px #f87171)' : 'none',
                        transition: 'filter 0.15s ease-out',
                      }}
                    />
                  );
                })()}
              </motion.div>
            </motion.div>
          )}

        </div>
      );
    }
  }

  return (
    <section className="board-wrap" aria-label="Tabuleiro do robô" role="img" data-tutorial="board">
      <div
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${level.width}, 1fr)`,
          gridTemplateRows: `repeat(${level.height}, 1fr)`
        }}
      >
        {cells}
      </div>
    </section>
  );
}