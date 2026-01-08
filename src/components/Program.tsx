import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Cmd } from '../game/types';
import { Command } from './Command';

function SortableCommandItem({ item, onRemove }: { item: Cmd; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `prog-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Command
        kind={item.kind}
        id={item.id}
        onRemove={onRemove}
        attributes={attributes}
        listeners={listeners}
      />
    </div>
  );
}


export function Program({ programId, title, items, onRemove, onRename }: 
  { programId: string; title: string; items: Cmd[], onRemove: (id: string)=>void, onRename?: (newName: string) => void; }) {
  const itemIds = items.map(item => `prog-${item.id}`);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `program-drop-${programId}`,
  });

  return (
    <section className="panel">
      {onRename ? (
        <input
          type="text"
          value={title}
          onChange={(e) => onRename(e.target.value)}
          style={{ background: 'none', border: '1px solid #fff', color: '#fff', fontSize: '14px', marginBottom: '8px' }}
        />
      ) : (
        <h3>{title}</h3>
      )}
      <div
        ref={setNodeRef}
        className="program-list"
        style={{
          outline: isOver ? '2px solid #5877ff' : '1px dashed rgba(255,255,255,.12)',
          outlineOffset: '2px',
        }}
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          {items.map(item => (
            <SortableCommandItem key={item.id} item={item} onRemove={onRemove} />
          ))}
        </SortableContext>
        {items.length === 0 && <p className="hint">Arraste comandos aqui</p>}
      </div>
    </section>
  );
}