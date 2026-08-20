import { motion } from 'framer-motion';
import { AiOutlineDelete } from 'react-icons/ai';

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ isOpen, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="win-overlay" onClick={onCancel}>
      <motion.div
        className="win-modal confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <AiOutlineDelete className="confirm-icon" size={40} aria-hidden="true" />
        <h1 id="confirm-modal-title">{title}</h1>
        <p>{message}</p>

        <div className="win-actions">
          <button onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-primary btn-danger">
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
