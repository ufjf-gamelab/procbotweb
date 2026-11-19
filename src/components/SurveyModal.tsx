import { motion } from 'framer-motion';
import { SURVEY_URLS } from '../game/survey';
import { getSurveyState, setSurveyState } from '../game/persistence';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const OPTIONS = [
  { label: 'Tenho menos de 18 anos', url: SURVEY_URLS.kids },
  { label: 'Tenho 18 anos ou mais', url: SURVEY_URLS.adult },
];

export function SurveyModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="win-overlay" onClick={onClose}>
      <motion.div
        className="win-modal survey-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-modal-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <h1 id="survey-modal-title">Ajude a melhorar o ProcBot!</h1>
        <p className="survey-text">
          Conte para a gente o que você achou do jogo. São perguntas rápidas e você não precisa se identificar.
        </p>
        <p className="survey-question">Qual é a sua idade?</p>

        <div className="survey-options">
          {OPTIONS.map(({ label, url }) =>
            url ? (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="btn-primary survey-option" onClick={() => { setSurveyState({ ...getSurveyState(), answered: true }); onClose(); }}>
                {label}
              </a>
            ) : (
              <button key={label} type="button" className="btn-primary survey-option" disabled>
                {label}
              </button>
            ),
          )}
        </div>

        <div className="win-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Agora não
          </button>
        </div>
      </motion.div>
    </div>
  );
}
