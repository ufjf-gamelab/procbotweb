import { useDroppable, useDndContext } from '@dnd-kit/core';
import { useRef } from 'react';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Cmd } from '../game/types';
import { Command } from './Command';

function SortableCommandItem({ item, onRemove, functionName }: { item: Cmd; onRemove: (id: string) => void; functionName?: string }) {
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
    opacity: isDragging ? 0.3 : 1,
    height: '50px',
    marginBottom: '4px',
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Command
        kind={item.kind}
        id={item.id}
        onRemove={onRemove}
        attributes={attributes}
        listeners={listeners}
        functionName={functionName}
        isDragging={isDragging}
      />
    </div>
  );
}


export function Program({ programId, title, limitText, onTitleChange, isFull, items, onRemove, functions }: 
  { programId: string; title: string; limitText: string; 
    onTitleChange?: (newName: string) => void; 
    isFull: boolean;
    items: Cmd[], onRemove: (id: string)=>void;
  functions?: { id: string; name: string; program: Cmd[] }[];
 }) {

  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodeRef } = useDroppable({
    id: `program-drop-${programId}`,
  });

  const { over } = useDndContext();
  const isOverContainer = 
    over?.id === `program-drop-${programId}` || 
    items.some(cmd => `prog-${cmd.id}` === over?.id);

  let dropClassName = "program-list";
  if (isOverContainer) {
    dropClassName += isFull ? " is-full" : " is-valid";
  }

  return (
    <section className="panel">
      <h3>
        {onTitleChange ? (
          <div className="editable-title-wrapper" onClick={() => inputRef.current?.focus()}>
            <svg className="edit-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <input 
              ref={inputRef}
              type="text" 
              value={title} 
              onChange={(e) => onTitleChange(e.target.value)}
              className="editable-title"
              maxLength={12}
            />
          </div>
        ) : (
          <span>{title}</span>
        )}
        
        {limitText && (
          <span className={`limit-count ${isFull ? 'is-full' : ''}`}>
            {limitText}
          </span>
        )}
      </h3>
      <div
        ref={setNodeRef}
        className={dropClassName}
        style={{
          outline: isOverContainer ? '2px solid #5877ff' : '1px dashed rgba(255,255,255,.12)',
          outlineOffset: '2px',
        }}
      >
       <SortableContext items={items.map(i => `prog-${i.id}`)} strategy={verticalListSortingStrategy}>
          {items.map((cmd) => {
            const isFunction = String(cmd.kind).startsWith('CALL_');
            let funcData;

            if (isFunction) {
              const funcId = String(cmd.kind).replace('CALL_', '');
              funcData = functions?.find(f => String(f.id).toUpperCase() === funcId.toUpperCase());
            }
            
            return (
              <SortableCommandItem
                key={cmd.id}
                item={cmd}
                onRemove={() => onRemove(cmd.id)}
                functionName={funcData?.name}
              />
            );
          })}
        </SortableContext>
        {items.length === 0 && <p className="hint">Arraste comandos aqui</p>}
      </div>
    </section>
  );
}