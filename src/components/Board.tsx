import type { Level } from '../game/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { type JSX, useState, useEffect } from 'react';

import robotFront from '../assets/robot_idle.png';
import robotBack from '../assets/robot_back.png';
import robotSide from '../assets/robot_side.png';
import robotDuck from '../assets/robot_duck.png';

export function Board({
  level, robot, lit
}: {
  level: Level;
  robot: { x: number; y: number; dir: 0|1|2|3 };
  lit: Set<string>;
}) {
  const cells: JSX.Element[] = [];
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const currentKey = `${robot.x},${robot.y}`;
    if (lit.has(currentKey)) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 400);
      return () => clearTimeout(timer);
    } else {
      setCelebrating(false);
    }
  }, [robot.x, robot.y, lit]);

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

      cells.push(
        <div 
          key={`${x}-${y}`} 
          className={clsx('cell', lamp && (isLit ? 'lamp-lit' : 'lamp'))}
          style={{ position: 'relative' }}
        >
          {isRobotHere && (
            <motion.div
              layoutId="robot-actor"
              animate={showJump ? { y: [0, -30, 0] } : { y: 0 }}
              transition={showJump 
                ? { duration: 0.4, times: [0, 0.5, 1] } 
                : { type: "spring", stiffness: 300, damping: 30 }
              }
              style={{ 
                width: '100%', 
                height: '100%', 
                position: 'relative', 
                zIndex: 20 
              }}
            >
              {(() => {
                const { src, style } = getRobotAsset(robot.dir, showJump);
                return (
                  <img 
                    src={src} 
                    alt="Robô"
                    className="robot-sprite"
                    style={style}
                  />
                );
              })()}
            </motion.div>
          )}

        </div>
      );
    }
  }

  return (
    <section className="board-wrap">
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