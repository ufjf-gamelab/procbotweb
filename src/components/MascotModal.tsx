import { motion } from 'framer-motion';
import robotTip from '../assets/robot_tip.png';

type Props = {
  isOpen: boolean;
  tip: string;
  onClose: () => void;
};

export function MascotModal({ isOpen, tip, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="win-overlay" onClick={onClose}>
      <motion.div
        className="win-modal mascot-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mascot-modal-tip"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <img src={robotTip} alt="" className="mascot-modal-image" />
        <p id="mascot-modal-tip">{tip}</p>
        <button onClick={onClose} className="btn-primary">
          Entendi
        </button>
      </motion.div>
    </div>
  );
}
