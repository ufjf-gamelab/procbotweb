import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useEffect, useState } from 'react';

import { AiFillHome, AiOutlineRedo, AiOutlineArrowRight, AiFillStar, AiOutlineStar } from "react-icons/ai";

type Props = {
  isOpen: boolean;
  onNextLevel: () => void;
  onMenu: () => void;
  onReplay: () => void;
  isLastLevel: boolean;
  stepsCount: number;
  stars: 1 | 2 | 3;
};

export function WinModal({ isOpen, onNextLevel, onMenu, onReplay, isLastLevel, stepsCount, stars }: Props) {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="win-overlay">
      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />

      <motion.div 
        className="win-modal"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <h1>Parabéns!</h1>

        <div className="win-stars">
          {[1, 2, 3].map(i => (
            i <= stars
              ? <AiFillStar key={i} className="icon-star" size={36} />
              : <AiOutlineStar key={i} className="icon-star" size={36} />
          ))}
        </div>

        <div className="win-stats">
          <p>Você completou o desafio!</p>
          <div className="stat-box">
            <span>Comandos usados:</span>
            <strong>{stepsCount}</strong>
          </div>
        </div>

        <div className="win-actions">
          <button onClick={onMenu} className="btn-secondary" title="Menu">
            <AiFillHome size={20} />
          </button>
          
          <button onClick={onReplay} className="btn-secondary" title="Jogar Novamente">
            <AiOutlineRedo size={20} />
          </button>

          {/* Se for a última fase, manda pro menu, senão próxima fase */}
          {!isLastLevel ? (
            <button onClick={onNextLevel} className="btn-primary">
              Próxima Fase <AiOutlineArrowRight />
            </button>
          ) : (
            <button onClick={onMenu} className="btn-primary">
              Concluir Jogo! 🏆
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}