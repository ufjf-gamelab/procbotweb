import { allLevels } from '../game/levels';
import type { Level } from '../game/types';
import { AiFillLock,
  AiOutlineHome,
  AiFillStar
 } from "react-icons/ai";
 import robotTip from "../assets/robot_tip.png";
 import robotFace from "../assets/robot_face.png";

type Props = {
  onSelectLevel: (level: Level) => void;
  completedLevels: string[];
};

export function LevelSelect({ onSelectLevel, completedLevels }: Props) {
  return (
  <div className="level-page">
    
    <div className="level-bg-overlay" />

    <header className="levels-header">
      <button className="home-button">
        <AiOutlineHome size={22} />
      </button>

      <div className="player-progress">
        <div className="progress-stars">
          <AiFillStar />
          <span>12</span>
        </div>

        <div className="progress-coins">
          <span>⚡</span>
          <span>120</span>
        </div>
      </div>
    </header>

    <main className="levels-content">
      <h1>ESCOLHA UMA FASE</h1>

      <div className="levels-grid">
        {allLevels.map((level) => {
          const isCompleted = completedLevels.includes(level.id);

          const prevLevelCompleted =
            level.id === "1" ||
            completedLevels.includes(
              String(Number(level.id) - 1)
            );

          const isLocked = !prevLevelCompleted;

          return (
            <button
              key={level.id}
              className={`
                level-card
                ${isCompleted ? "completed" : ""}
                ${isLocked ? "locked" : ""}
              `}
              onClick={() =>
                !isLocked && onSelectLevel(level)
              }
              disabled={isLocked}
            >
              <span className="level-number">
                {level.id}
              </span>
              {!isLocked && (
               <img
                  src={robotFace}
                  alt="robot"
                  className="level-robot"
                />
        )}
              {isLocked ? (
                <AiFillLock
                  className="lock-icon"
                  size={26}
                />
              ) : (
                <div className="stars-row">
                  {isCompleted ? "⭐" : ""}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="levels-mascot">
        <img src={robotTip} alt="Robot" />

        <div className="mascot-bubble">
          Vamos aprender programação!
        </div>
      </div>
    </main>
  </div>
);
}