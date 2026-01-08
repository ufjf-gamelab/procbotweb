export function Controls({
    running, canStep, onRun, onStep, onResetProg, onResetLevel, win
  }: {
    running: boolean; canStep: boolean; win: boolean;
    onRun: () => void; onStep: () => void;
    onResetProg: () => void; onResetLevel: () => void;
  }) {
    return (
      <section className="panel controls">
        <button onClick={onRun} disabled={running || !canStep}>▶ Run</button>
        <button onClick={onStep} disabled={running || !canStep}>⏭ Step</button>
        <button onClick={onResetProg} disabled={running}>🧹 Limpar programa</button>
        <button onClick={onResetLevel} disabled={running}>↺ Resetar nível</button>
        <div className="status">
          {win ? '✨ Vitória!' : running ? 'Executando…' : 'Pronto'}
        </div>
      </section>
    );
  }
  