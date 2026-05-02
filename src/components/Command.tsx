import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { CmdKind } from '../game/types';
import { CMD_CONFIG } from '../game/constants'; 

type Props = {
  kind: CmdKind;
  id: string;
  isDragging?: boolean;
  onRemove?: (id: string) => void;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  functionName?: string;
};

const FUNCTION_THEME_COLOR = '#a78bfa';

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
      color: FUNCTION_THEME_COLOR,
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
        borderColor: isDragging ? config.color : undefined,
        cursor: 'grab',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40px',
        height: '100%' 
      }}
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