import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineDelete, AiOutlineSetting } from 'react-icons/ai';
import { IoVolumeHighOutline, IoVolumeMuteOutline } from 'react-icons/io5';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { APP_VERSION } from '../game/version';
import { canFullscreen, enterFullscreen, exitFullscreen, isFullscreen } from '../game/fullscreen';

type SpeedInfo = { label: string; Icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }> };

type Props = {
  isOpen: boolean;
  muted: boolean;
  speedInfo: SpeedInfo;
  onToggleMute: () => void;
  onCycleSpeed: () => void;
  onResetData: () => void;
  onClose: () => void;
};

export function SettingsModal({ isOpen, muted, speedInfo, onToggleMute, onCycleSpeed, onResetData, onClose }: Props) {
  const [fullscreen, setFullscreen] = useState(isFullscreen);

  useEffect(() => {
    const update = () => setFullscreen(isFullscreen());
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

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

          {canFullscreen() && (
            <button type="button" className="settings-modal-item" aria-pressed={fullscreen} onClick={() => void (fullscreen ? exitFullscreen() : enterFullscreen())}>
              {fullscreen ? <MdFullscreenExit size={22} aria-hidden="true" /> : <MdFullscreen size={22} aria-hidden="true" />}
              <span>{fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span>
            </button>
          )}

          <button type="button" className="settings-modal-item settings-modal-danger" onClick={onResetData}>
            <AiOutlineDelete size={22} aria-hidden="true" />
            <span>Apagar todos os dados</span>
          </button>
        </div>

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
