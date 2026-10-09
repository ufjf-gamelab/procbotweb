import { levelBlocks } from '../game/levels';
import type { Level } from '../game/types';
import { AiFillCheckCircle, AiFillLock, AiFillPlayCircle, AiFillStar } from "react-icons/ai";
 import { BsRobot } from "react-icons/bs";
 import robotTip from "../assets/robot_tip.png";

type Props = {
  onSelectLevel: (level: Level) => void;
  completedLevels: string[];
  levelStars: Record<string, number>;
};

const BLOCK_ACCENTS: Record<string, string> = {
  basicos: '#06b6d4',
  procedimentos: '#a78bfa',
  lacos: '#fb923c',
};

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

      <div className="level-blocks">
        {levelBlocks.map((block, blockIndex) => {
          const accent = BLOCK_ACCENTS[block.key];
          const blockStars = block.levels.reduce((sum, level) => sum + (levelStars[level.id] ?? 0), 0);
          const blockStarsMax = block.levels.length * 3;
          const openLevels = block.levels.filter(level => level.anterior == null || completedLevels.includes(level.anterior));
          const pendingLevels = openLevels.filter(level => !completedLevels.includes(level.id));
          const hasDependents = (level: Level) => block.levels.some(other => other.anterior === level.id);
          const nextLocked = pendingLevels.length !== 1 ? undefined : block.levels
            .filter(level => !openLevels.includes(level) && level.anterior === pendingLevels[0].id)
            .sort((a, b) => Number(hasDependents(b)) - Number(hasDependents(a)) || Number(a.id) - Number(b.id))[0];
          const upcomingLevels = nextLocked ? [nextLocked] : [];
          const orderedLevels = [
            ...upcomingLevels,
            ...pendingLevels,
            ...[...completedLevels].reverse().flatMap(id => openLevels.filter(level => level.id === id)),
          ];

          return (
            <section
              className="level-block"
              key={block.key}
              style={{ '--block-accent': accent } as React.CSSProperties}
            >
              <div className="level-block-header">
                <span className="level-block-index">{blockIndex + 1}</span>
                <h2>{block.title}</h2>
                <span className="level-block-stars">
                  <AiFillStar aria-hidden="true" />
                  {blockStars}/{blockStarsMax}
                </span>
              </div>

              <div className="level-block-row">
                {orderedLevels.map((level) => {
                  const isCompleted = completedLevels.includes(level.id);
                  const isLocked = upcomingLevels.includes(level);
                  const starsEarned = levelStars[level.id] ?? 0;
                  const levelName = level.name ?? `Fase ${level.id}`;

                  const cardLabel = `${levelName}${isLocked ? ', bloqueada' : isCompleted ? `, concluída com ${starsEarned} de 3 estrelas` : ', disponível'}`;

                  return (
                    <button
                      key={level.id}
                      className={`
                        level-card
                        ${isCompleted ? "completed" : ""}
                        ${isLocked ? "locked" : ""}
                      `}
                      onClick={() => onSelectLevel(level)}
                      disabled={isLocked}
                      aria-label={cardLabel}
                    >
                      {!isLocked && (
                        <span className="level-badge" aria-hidden="true">
                          {isCompleted ? <AiFillCheckCircle /> : <AiFillPlayCircle />}
                        </span>
                      )}
                      <span className="level-number" aria-hidden="true">
                        {level.id}
                      </span>
                      {isLocked ? (
                        <AiFillLock className="lock-icon" size={26} aria-hidden="true" />
                      ) : (
                        <>
                          <BsRobot className="level-robot" aria-hidden="true" />
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
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>

    <div className="levels-mascot">
      <img src={robotTip} alt="Robot" />

      <div className="mascot-bubble">
        Vamos aprender programação!
      </div>
    </div>
  </div>
);
}