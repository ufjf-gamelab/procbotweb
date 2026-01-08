import { allLevels } from '../game/levels';
import type { Level } from '../game/types';
import { AiFillLock } from "react-icons/ai";

type Props = {
  onSelectLevel: (level: Level) => void;
  completedLevels: string[];
};

export function LevelSelect({ onSelectLevel, completedLevels }: Props) {
  return (
    <div className="level-select-container">
      <h1>Escolha uma Fase</h1>
      
      <div className="levels-grid">
        {allLevels.map((level) => {
          const isCompleted = completedLevels.includes(level.id);
          
          const prevLevelCompleted = level.id === '1' || completedLevels.includes(String(Number(level.id)-1));
          
          const isLocked = !prevLevelCompleted;

          return (
            <button
              key={level.id}
              className={`level-card ${isCompleted ? 'completed' : ''}`}
              onClick={() => !isLocked && onSelectLevel(level)}
              disabled={isLocked}
            >
                {isLocked ? (
                <AiFillLock size={24} color="#ffffff50" />
              ) : (
                <>
                  <span className="level-number">{level.id}</span>
                  {isCompleted && <span className="star">⭐</span>}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}