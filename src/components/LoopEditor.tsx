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
};

export function LoopEditor({ loop, loopsConfig, functions, onClose, onAddCommand, onRemoveCommand, onSetTimes, onDeleteLoop }: Props) {
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
            disabled={loop.times <= loopsConfig.minTimes}
          >
            <AiOutlineMinus size={14} />
          </button>
          <strong>{loop.times}</strong>
          <button
            type="button"
            onClick={() => onSetTimes(loop.times + 1)}
            disabled={loop.times >= loopsConfig.maxTimes}
          >
            <AiOutlinePlus size={14} />
          </button>
          <span>vezes</span>
        </div>

        <button type="button" className="loop-delete-btn" title="Remover repetição" onClick={onDeleteLoop}>
          <AiOutlineDelete size={16} />
          <span>Excluir</span>
        </button>
      </div>

      <Palette onCommandClick={onAddCommand} functions={functions} />

      <Program
        programId={loop.id}
        title="Dentro do Repetir"
        limitText={`(${loop.program.length}/${loop.maxCommands})`}
        isFull={isFull}
        items={loop.program}
        onRemove={onRemoveCommand}
        functions={functions}
        isSelected
      />
    </section>
  );
}
