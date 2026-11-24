import { useState } from 'react';
import { motion } from 'framer-motion';
import { AiFillPlayCircle, AiOutlineInfoCircle, AiOutlineStar } from 'react-icons/ai';
import robotIdle from '../assets/robot_idle.png';
import { CreditsModal } from './CreditsModal';
import { SurveyModal } from './SurveyModal';
import { APP_VERSION } from '../game/version';
import { enterFullscreenOnMobile } from '../game/fullscreen';

type Props = {
  onPlay: () => void;
};

export function HomeScreen({ onPlay }: Props) {
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);

  return (
    <div className="level-page home-page">
      <div className="level-bg-overlay" />

      <main className="home-content">
        <motion.img
          src={robotIdle}
          alt=""
          className="home-robot"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="home-main">
          <h1 className="home-title">ProcBot</h1>
          <p className="home-subtitle">Programe o robô e acenda todas as luzes!</p>

          <div className="home-actions">
            <button type="button" className="btn-primary home-play" onClick={() => { enterFullscreenOnMobile(); onPlay(); }}>
              <AiFillPlayCircle size={28} aria-hidden="true" />
              Jogar
            </button>
            <button type="button" className="btn-secondary home-credits" onClick={() => setCreditsOpen(true)}>
              <AiOutlineInfoCircle size={20} aria-hidden="true" />
              Créditos
            </button>
            <button type="button" className="btn-secondary home-credits" onClick={() => setSurveyOpen(true)}>
              <AiOutlineStar size={20} aria-hidden="true" />
              Avaliar
            </button>
          </div>
        </div>
      </main>

      <span className="app-version home-version">{APP_VERSION}</span>

      <CreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
      <SurveyModal isOpen={surveyOpen} onClose={() => setSurveyOpen(false)} />
    </div>
  );
}
