import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { CmdKind } from '../game/types';
// import { CMD_CONFIG } from '../game/constants';
import { Command } from './Command';

const BASE_COMMANDS: CmdKind[] = ['ANDAR','ESQUERDA','DIREITA','ACENDER'];

type PalItemProps = {
  kind: string;
  onCommandClick: () => void;
  dynamicLabel?: string;
};

function PalItem({ kind, onCommandClick, dynamicLabel }: PalItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `pal-${kind}` });

  const style = {
    transform: CSS.Translate.toString(transform), 
    opacity: isDragging ? 0.6 : 1,
    touchAction: 'none',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="palette-item-wrapper"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCommandClick}
    >
      <Command 
        kind={kind as CmdKind}
        id={`pal-${kind}`} 
        isDragging={isDragging}
        attributes={attributes}
        listeners={listeners}
        functionName={dynamicLabel} 
      />
    </motion.div>
  );
}

type PaletteProps = {
  onCommandClick: (kind: CmdKind| string) => void;
  functions: { id: string; name: string }[];
};

export function Palette({onCommandClick, functions = []}: PaletteProps) {
  return (
    <section className="panel">
      <h3>Paleta de comandos</h3>
      <div className="palette-grid">
        {BASE_COMMANDS.map(k => (
          <PalItem 
            key={k} 
            kind={k} 
            onCommandClick={() => onCommandClick(k)} 
          />
        ))}
        {functions.map(f => {
          
          const cmdKind = `CALL_${f.id.toUpperCase()}`; 
          return (
            <PalItem 
              key={f.id} 
              kind={cmdKind} 
              onCommandClick={() => onCommandClick(cmdKind)} 
              dynamicLabel={f.name} 
            />
          );
        })}
      </div>
    </section>
  );
}
