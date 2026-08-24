import { cloneElement, isValidElement } from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { AiOutlineSync, AiOutlineDelete, AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import type { CmdKind } from '../game/types';
import { CMD_CONFIG, LOOP_THEME, getCommandLabel, getFunctionTheme } from '../game/constants';

type Props = {
  kind: CmdKind;
  id: string;
  isDragging?: boolean;
  onRemove?: (id: string) => void;
  isLoopExpanded?: boolean;
  onToggleLoopExpand?: () => void;
  onLoopDelta?: (delta: 1 | -1) => void;
  onLoopCycleCmd?: () => void;
  loopMin?: number;
  loopMax?: number;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  functionName?: string;
  loopTimes?: number;
  loopCmd?: CmdKind;
  isExecuting?: boolean;
};

export function Command({
  kind,
  id,
  isDragging = false,
  onRemove,
  isLoopExpanded = false,
  onToggleLoopExpand,
  onLoopDelta,
  onLoopCycleCmd,
  loopMin,
  loopMax,
  attributes,
  listeners,
  functionName,
  loopTimes,
  loopCmd,
  isExecuting = false
}: Props) {
  const className = `block ${isDragging ? 'dragging' : ''} ${isExecuting ? 'is-executing' : ''} ${isLoopExpanded ? 'is-loop-expanded' : ''}`;

  const isFunction = String(kind).startsWith('CALL_');
  const isLoop = String(kind).startsWith('LOOP_');
  let config;

  if (isFunction) {
    const funcId = String(kind).replace('CALL_', '');
    config = {
      ...getFunctionTheme(funcId),
      icon: <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>{functionName}</span>
    };
  } else if (isLoop || String(kind) === 'REPEAT_NEW') {
    config = LOOP_THEME;
  } else {
    config = CMD_CONFIG[kind]
  }

  if (!config) return null;

  const loopCmdConfig = isLoop && loopCmd ? CMD_CONFIG[loopCmd] : undefined;
  const label = getCommandLabel(kind, { functionName, loopTimes, loopCmd });
  const actionHint = isLoop
    ? (isLoopExpanded ? 'Toque no ícone para trocar o comando, use os botões para ajustar' : 'Toque para ajustar, arraste um comando por cima para trocar')
    : onRemove ? 'Clique para remover' : undefined;
  const atMin = loopMin != null && (loopTimes ?? loopMin) <= loopMin;
  const atMax = loopMax != null && (loopTimes ?? loopMax) >= loopMax;

  return (
    <div
      className={className}
      {...attributes}
      {...(isLoopExpanded ? {} : listeners)}
      aria-label={actionHint ? `${label}. ${actionHint}` : label}
      onClick={() => {
        if (isLoop && onToggleLoopExpand) {
          onToggleLoopExpand();
        } else if (onRemove) {
          onRemove(id);
        }
      }}

      style={{
        '--block-color': config.color,
        '--block-dark': config.dark,
        '--block-glow': config.glow,
        '--loop-accent': LOOP_THEME.color,
        borderColor: isDragging ? config.color : undefined,
        cursor: isLoopExpanded ? 'default' : 'grab',
        touchAction: 'manipulation',
        display: 'flex',
        justifyContent: isLoopExpanded ? 'space-between' : 'center',
        alignItems: 'center',
        gap: isLoopExpanded ? '2px' : undefined,
        minHeight: '40px',
        height: '100%',
        position: 'relative'
      } as React.CSSProperties}
      title={actionHint ?? `Arrastar para mover, Clique para remover`}
    >
      {isLoop && isLoopExpanded ? (
        <>
          <button
            type="button"
            className="loop-step-btn"
            title="Menos vezes"
            aria-label="Menos vezes"
            disabled={atMin}
            onClick={(e) => { e.stopPropagation(); onLoopDelta?.(-1); }}
          >
            <AiOutlineMinus size={13} />
          </button>
          <span className="loop-expanded-icon">
            <button
              type="button"
              className="loop-cmd-cycle-btn"
              title="Trocar comando"
              aria-label="Trocar comando"
              onClick={(e) => { e.stopPropagation(); onLoopCycleCmd?.(); }}
            >
              <span style={{ fontSize: '16px', color: loopCmdConfig?.color }}>{loopCmdConfig?.icon ?? config.icon}</span>
            </button>
            <button
              type="button"
              className="loop-badge-btn"
              title="Fechar"
              aria-label="Fechar ajuste de repetição"
              onClick={(e) => { e.stopPropagation(); onToggleLoopExpand?.(); }}
            >
              <span className="loop-badge">×{loopTimes ?? '?'}</span>
            </button>
          </span>
          <button
            type="button"
            className="loop-step-btn"
            title="Mais vezes"
            aria-label="Mais vezes"
            disabled={atMax}
            onClick={(e) => { e.stopPropagation(); onLoopDelta?.(1); }}
          >
            <AiOutlinePlus size={13} />
          </button>
          {onRemove && (
            <button
              type="button"
              className="loop-step-btn loop-step-delete"
              title="Remover repetição"
              aria-label="Remover repetição"
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            >
              <AiOutlineDelete size={13} />
            </button>
          )}
        </>
      ) : (
        <span aria-hidden="true" className="command-icon-wrap" style={{ display: 'flex', fontSize: '24px' }}>
          {isFunction ? (
            <span className="command-label">
              {functionName || config.icon}
            </span>
          ) : isLoop ? (
            <span className="loop-label">
              <span className="loop-icon-row">
                <AiOutlineSync className="loop-repeat-icon" size={14} aria-hidden="true" />
                <span style={{ color: loopCmdConfig?.color, display: 'flex' }}>
                  {(() => {
                    const cmdIcon = loopCmdConfig?.icon ?? config.icon;
                    return isValidElement<{ size?: number }>(cmdIcon) ? cloneElement(cmdIcon, { size: 14 }) : cmdIcon;
                  })()}
                </span>
              </span>
              <span className="loop-badge">×{loopTimes ?? '?'}</span>
            </span>
          ) : (
            <span style={{ fontSize: '24px' }}>
              {config.icon}
            </span>
          )}
        </span>
      )}
    </div>
  );
}