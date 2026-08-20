import { useDroppable, useDndContext } from '@dnd-kit/core';
import { useRef } from 'react';
import clsx from 'clsx';
import { AiOutlineDelete, AiOutlineCode, AiOutlineInbox } from 'react-icons/ai';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Cmd } from '../game/types';
import { Command } from './Command';

function SortableCommandItem({ item, onRemove, functionName, loopTimes, onOpenLoop, isExecuting }: { item: Cmd; onRemove: (id: string) => void; functionName?: string; loopTimes?: number; onOpenLoop?: () => void; isExecuting?: boolean }) {
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
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Command
        kind={item.kind}
        id={item.id}
        onRemove={onRemove}
        onOpen={onOpenLoop}
        attributes={attributes}
        listeners={listeners}
        functionName={functionName}
        loopTimes={loopTimes}
        isDragging={isDragging}
        isExecuting={isExecuting}
      />
    </div>
  );
}


export function Program({ programId, title, limitText, onTitleChange, isFull, items, onRemove, functions, loops, onOpenLoop, isSelected, onSelect, onDelete, accentColor, executingCmdId }:
  { programId: string; title: string; limitText: string;
    onTitleChange?: (newName: string) => void;
    isFull: boolean;
    items: Cmd[], onRemove: (id: string)=>void;
  functions?: { id: string; name: string; program: Cmd[] }[];
  loops?: { id: string; times: number; program: Cmd[] }[];
  onOpenLoop?: (loopId: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  accentColor?: string;
  executingCmdId?: string | null;
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

  const panelStyle = accentColor
    ? ({ '--function-accent': accentColor, borderColor: accentColor } as React.CSSProperties)
    : undefined;

  return (
    <section className={clsx('panel', isSelected && 'is-target')} style={panelStyle}>
      <h3 onClick={onSelect} style={onSelect ? { cursor: 'pointer' } : undefined}>
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
          <span title={title} aria-label={title}>
            <AiOutlineCode size={18} aria-hidden="true" />
          </span>
        )}
        
        {limitText && (
          <span className={`limit-count ${isFull ? 'is-full' : ''}`}>
            {limitText}
          </span>
        )}

        {onDelete && (
          <button
            type="button"
            className="delete-function-btn"
            title="Remover função"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <AiOutlineDelete size={14} />
          </button>
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
       <SortableContext items={items.map(i => `prog-${i.id}`)} strategy={rectSortingStrategy}>
          {items.map((cmd) => {
            const isFunction = String(cmd.kind).startsWith('CALL_');
            const isLoop = String(cmd.kind).startsWith('LOOP_');
            let funcData;
            let loopData: { id: string; times: number } | undefined;

            if (isFunction) {
              const funcId = String(cmd.kind).replace('CALL_', '');
              funcData = functions?.find(f => String(f.id).toUpperCase() === funcId.toUpperCase());
            }

            if (isLoop) {
              const loopId = String(cmd.kind).replace('LOOP_', '');
              loopData = loops?.find(l => l.id.toLowerCase() === loopId.toLowerCase());
            }

            return (
              <SortableCommandItem
                key={cmd.id}
                item={cmd}
                onRemove={() => onRemove(cmd.id)}
                functionName={funcData?.name}
                loopTimes={loopData?.times}
                onOpenLoop={isLoop ? () => onOpenLoop?.(loopData?.id ?? String(cmd.kind).replace('LOOP_', '')) : undefined}
                isExecuting={cmd.id === executingCmdId}
              />
            );
          })}
        </SortableContext>
        {items.length === 0 && (
          <p className="hint" title="Arraste comandos aqui" aria-label="Arraste comandos aqui">
            <AiOutlineInbox size={26} aria-hidden="true" />
          </p>
        )}
      </div>
    </section>
  );
}