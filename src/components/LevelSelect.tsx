import { allLevels } from '../game/levels';
import type { Level } from '../game/types';
import { AiFillLock,
  AiFillStar
 } from "react-icons/ai";
 import { BsRobot } from "react-icons/bs";
 import robotTip from "../assets/robot_tip.png";

type Props = {
  onSelectLevel: (level: Level) => void;
  completedLevels: string[];
  levelStars: Record<string, number>;
};

const LEVEL_ACCENTS = ['#06b6d4', '#a78bfa', '#fb923c', '#f472b6'];

export function LevelSelect({ onSelectLevel, completedLevels, levelStars }: Props) {
  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);

  return (
  <div className="level-page">
    
    <div className="level-bg-overlay" />

    <header className="levels-header">
      <div className="player-progress">
        <div className="progress-stars" title={`${totalStars} estrelas no total`} aria-label={`${totalStars} estrelas no total`}>
          <AiFillStar aria-hidden="true" />
          <span>{totalStars}</span>
        </div>
      </div>
    </header>

    <main className="levels-content">
      <h1>ESCOLHA UMA FASE</h1>

      <div className="levels-grid">
        {allLevels.map((level, index) => {
          const isCompleted = completedLevels.includes(level.id);

          const prevLevelCompleted =
            level.id === "1" ||
            completedLevels.includes(
              String(Number(level.id) - 1)
            );

          const isLocked = !prevLevelCompleted;
          const accent = LEVEL_ACCENTS[index % LEVEL_ACCENTS.length];
          const starsEarned = levelStars[level.id] ?? 0;

          const cardLabel = isLocked
            ? `Fase ${level.id}, bloqueada`
            : `Fase ${level.id}${isCompleted ? `, concluída com ${starsEarned} de 3 estrelas` : ', disponível'}`;

          return (
            <button
              key={level.id}
              className={`
                level-card
                ${isCompleted ? "completed" : ""}
                ${isLocked ? "locked" : ""}
              `}
              style={{ '--level-accent': accent } as React.CSSProperties}
              onClick={() =>
                !isLocked && onSelectLevel(level)
              }
              disabled={isLocked}
              aria-label={cardLabel}
            >
              <span className="level-number" aria-hidden="true">
                {level.id}
              </span>
              {!isLocked && (
                <BsRobot className="level-robot" aria-hidden="true" />
              )}
              {isLocked ? (
                <AiFillLock
                  className="lock-icon"
                  size={26}
                  aria-hidden="true"
                />
              ) : (
                <div className="level-footer" aria-hidden="true">
                  <div className="level-lamps">
                    {level.lamps.map((_, i) => (
                      <span key={i} className="mini-lamp" />
                    ))}
                  </div>
                  <div className="stars-row">
                    {isCompleted ? "⭐".repeat(starsEarned).padEnd(3, "☆") : ""}
                  </div>
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