import { motion } from 'framer-motion';
import { APP_VERSION } from '../game/version';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CREDITS = [
  { role: 'Desenvolvimento', names: ['Rafaela Oliveira de Souza'] },
  { role: 'Orientação', names: ['Prof. Igor de Oliveira Knop'] },
  { role: 'Realização', names: ['Universidade Federal de Juiz de Fora', 'Departamento de Ciência da Computação'] },
  { role: 'Inspiração', names: ['Lightbot'] },
  { role: 'Efeitos sonoros', names: ['Kenney (kenney.nl) — CC0'] },
];

export function CreditsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="win-overlay" onClick={onClose}>
      <motion.div
        className="win-modal credits-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <h1 id="credits-modal-title">Créditos</h1>

        <dl className="credits-list">
          {CREDITS.map(({ role, names }) => (
            <div key={role} className="credits-item">
              <dt>{role}</dt>
              {names.map(name => <dd key={name}>{name}</dd>)}
            </div>
          ))}
        </dl>

        <p className="app-version">{APP_VERSION}</p>

        <div className="win-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
