import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { CmdKind } from '../game/types';
import { CMD_CONFIG, FUNCTION_THEME } from '../game/constants';

type Props = {
  kind: CmdKind;
  id: string;
  isDragging?: boolean;
  onRemove?: (id: string) => void;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  functionName?: string;
};

export function Command({
  kind,
  id,
  isDragging = false,
  onRemove,
  attributes,
  listeners,
  functionName
}: Props) {
  const className = `block ${isDragging ? 'dragging' : ''}`;

  const isFunction = String(kind).startsWith('CALL_');
  let config;

  if (isFunction) {
    config = {
      ...FUNCTION_THEME,
      icon: <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>{functionName}</span>
    };
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
        if (onRemove) onRemove(id);
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
        height: '100%'
      } as React.CSSProperties}
      title={`Arrastar para mover, Clique para remover`}
    >
      <span style={{ color: config.color, display: 'flex', fontSize: '24px' }}>
        {isFunction ? (
          <span className="command-label">
            {functionName || config.icon}
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