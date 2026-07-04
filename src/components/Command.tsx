import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { CmdKind } from '../game/types';
import { CMD_CONFIG, FUNCTION_THEME, LOOP_THEME } from '../game/constants';

type Props = {
  kind: CmdKind;
  id: string;
  isDragging?: boolean;
  onRemove?: (id: string) => void;
  onOpen?: () => void;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  functionName?: string;
  loopTimes?: number;
};

export function Command({
  kind,
  id,
  isDragging = false,
  onRemove,
  onOpen,
  attributes,
  listeners,
  functionName,
  loopTimes
}: Props) {
  const className = `block ${isDragging ? 'dragging' : ''}`;

  const isFunction = String(kind).startsWith('CALL_');
  const isLoop = String(kind).startsWith('LOOP_');
  let config;

  if (isFunction) {
    config = {
      ...FUNCTION_THEME,
      icon: <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>{functionName}</span>
    };
  } else if (isLoop || String(kind) === 'REPEAT_NEW') {
    config = LOOP_THEME;
  } else {
    config = CMD_CONFIG[kind]
  }

  if (!config) return null;

  return (
    <div
      className={className}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (isLoop && onOpen) {
          onOpen();
        } else if (onRemove) {
          onRemove(id);
        }
      }}

      style={{
        '--block-color': config.color,
        '--block-dark': config.dark,
        '--block-glow': config.glow,
        borderColor: isDragging ? config.color : undefined,
        cursor: 'grab',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40px',
        height: '100%',
        position: 'relative'
      } as React.CSSProperties}
      title={isLoop ? 'Clique para editar o laço' : `Arrastar para mover, Clique para remover`}
    >
      <span style={{ color: config.color, display: 'flex', fontSize: '24px' }}>
        {isFunction ? (
          <span className="command-label">
            {functionName || config.icon}
          </span>
        ) : isLoop ? (
          <span className="loop-label">
            <span style={{ fontSize: '20px' }}>{config.icon}</span>
            <span className="loop-badge">×{loopTimes ?? '?'}</span>
          </span>
        ) : (
          <span style={{ fontSize: '24px' }}>
            {config.icon}
          </span>
        )}
      </span>
    </div>
  );
}