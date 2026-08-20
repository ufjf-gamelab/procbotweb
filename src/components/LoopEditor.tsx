import { AiOutlineArrowLeft, AiOutlineMinus, AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';
import type { Cmd, LoopDef, LoopsConfig } from '../game/types';
import { Palette } from './Palette';
import { Program } from './Program';

type Props = {
  loop: LoopDef;
  loopsConfig: LoopsConfig;
  functions: { id: string; name: string; program: Cmd[] }[];
  onClose: () => void;
  onAddCommand: (kind: string) => void;
  onRemoveCommand: (id: string) => void;
  onSetTimes: (times: number) => void;
  onDeleteLoop: () => void;
  executingCmdId?: string | null;
  disabled?: boolean;
  wobble?: boolean;
};

export function LoopEditor({ loop, loopsConfig, functions, onClose, onAddCommand, onRemoveCommand, onSetTimes, onDeleteLoop, executingCmdId, disabled, wobble }: Props) {
  const isFull = loop.program.length >= loop.maxCommands;

  return (
    <section className="panel loop-editor">
      <div className="loop-editor-header">
        <button type="button" className="loop-back-btn" onClick={onClose}>
          <AiOutlineArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        <div className="loop-times-stepper">
          <span>Repetir</span>
          <button
            type="button"
            onClick={() => onSetTimes(loop.times - 1)}
            disabled={disabled || loop.times <= loopsConfig.minTimes}
          >
            <AiOutlineMinus size={14} />
          </button>
          <strong>{loop.times}</strong>
          <button
            type="button"
            onClick={() => onSetTimes(loop.times + 1)}
            disabled={disabled || loop.times >= loopsConfig.maxTimes}
          >
            <AiOutlinePlus size={14} />
          </button>
          <span>vezes</span>
        </div>

        <button type="button" className="loop-delete-btn" title="Remover repetição" onClick={onDeleteLoop} disabled={disabled}>
          <AiOutlineDelete size={16} />
          <span>Excluir</span>
        </button>
      </div>

      <Palette onCommandClick={onAddCommand} functions={functions} disabled={disabled} />

      <Program
        programId={loop.id}
        title="Dentro do Repetir"
        count={loop.program.length}
        max={loop.maxCommands}
        isFull={isFull}
        items={loop.program}
        onRemove={onRemoveCommand}
        functions={functions}
        isSelected
        executingCmdId={executingCmdId}
        disabled={disabled}
        wobble={wobble}
      />
    </section>
  );
}
