import { motion } from 'framer-motion';
import { AiOutlineSetting } from 'react-icons/ai';
import { IoVolumeHighOutline, IoVolumeMuteOutline } from 'react-icons/io5';

type SpeedInfo = { label: string; Icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }> };

type Props = {
  isOpen: boolean;
  muted: boolean;
  speedInfo: SpeedInfo;
  onToggleMute: () => void;
  onCycleSpeed: () => void;
  onClose: () => void;
};

export function SettingsModal({ isOpen, muted, speedInfo, onToggleMute, onCycleSpeed, onClose }: Props) {
  if (!isOpen) return null;

  const SpeedIcon = speedInfo.Icon;

  return (
    <div className="win-overlay" onClick={onClose}>
      <motion.div
        className="win-modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <AiOutlineSetting className="settings-modal-icon" size={36} aria-hidden="true" />
        <h1 id="settings-modal-title">Configurações</h1>

        <div className="settings-modal-options">
          <button type="button" className="settings-modal-item" aria-pressed={muted} onClick={onToggleMute}>
            {muted ? <IoVolumeMuteOutline size={22} aria-hidden="true" /> : <IoVolumeHighOutline size={22} aria-hidden="true" />}
            <span>{muted ? 'Ativar som' : 'Silenciar som'}</span>
          </button>

          <button type="button" className="settings-modal-item" onClick={onCycleSpeed}>
            <SpeedIcon size={22} aria-hidden="true" />
            <span>Velocidade: {speedInfo.label}</span>
          </button>
        </div>

        <div className="win-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
