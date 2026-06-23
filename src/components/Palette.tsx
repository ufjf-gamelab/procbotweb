import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { CmdKind } from '../game/types';
import { CMD_CONFIG } from '../game/constants';

const PALETTE: CmdKind[] = ['ANDAR','ESQUERDA','DIREITA','ACENDER', 'CALL_F1'];

type PalItemProps = {
  kind: CmdKind;
  onCommandClick: () => void;
  dynamicLabel?: string;
};

function PalItem({ kind, onCommandClick }: PalItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `pal-${kind}` });

  const config = CMD_CONFIG[kind];

  const style = {
    transform: CSS.Translate.toString(transform), 
    opacity: isDragging ? 0.6 : 1,
    touchAction: 'none',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="block"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCommandClick}
      {...listeners} {...attributes}
    >
      <span style={{ color: config.color, display: 'flex', alignItems: 'center' }}>
        {config.icon}
        </span>
    </motion.div>
  );
}

type PaletteProps = {
  onCommandClick: (kind: CmdKind) => void;
  functionName: string;
  showF1Button: boolean;
};

export function Palette({onCommandClick, functionName, showF1Button = true}: PaletteProps) {
  return (
    <section className="panel">
      <h3>Paleta</h3>
      <div className="palette-grid">
        {PALETTE
        .filter(k => showF1Button || k !== 'CALL_F1')
        .map(k => (
          <PalItem 
            key={k} 
            kind={k} 
            onCommandClick={() => onCommandClick(k)} 
            // dynamicLabel={k === 'CALL_F1' ? functionName : undefined}
          />
        ))}
      </div>
    </section>
  );
}
