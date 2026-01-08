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
};

export function Command({
  kind,
  id,
  isDragging = false,
  onRemove,
  attributes,
  listeners,
}: Props) {
  const className = `block ${isDragging ? 'dragging' : ''}`;
  const config = CMD_CONFIG[kind];

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
        {config.icon}
      </span>
    </div>
  );
}