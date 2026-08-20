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
  disabled?: boolean;
};

function PalItem({ kind, onCommandClick, dynamicLabel, disabled }: PalItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `pal-${kind}`, disabled });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: disabled ? 0.5 : isDragging ? 0.6 : 1,
    touchAction: 'manipulation',
    pointerEvents: disabled ? 'none' as const : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="palette-item-wrapper"
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={disabled ? undefined : onCommandClick}
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
  showLoopTile?: boolean;
  disabled?: boolean;
};

export function Palette({onCommandClick, functions = [], showLoopTile = false, disabled = false}: PaletteProps) {
  return (
    <section className="panel" aria-label="Paleta de comandos">
      <div className="palette-grid">
        {BASE_COMMANDS.map(k => (
          <PalItem
            key={k}
            kind={k}
            onCommandClick={() => onCommandClick(k)}
            disabled={disabled}
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
              disabled={disabled}
            />
          );
        })}
        {showLoopTile && (
          <PalItem
            kind="REPEAT_NEW"
            onCommandClick={() => onCommandClick('REPEAT_NEW')}
            disabled={disabled}
          />
        )}
      </div>
    </section>
  );
}
