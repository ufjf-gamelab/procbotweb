import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import robotTip from '../assets/robot_tip.png';

export type TutorialStep = {
  target: string;
  text: string;
};

type Props = {
  steps: TutorialStep[];
  onFinish: () => void;
};

type Side = 'top' | 'bottom' | 'left' | 'right';

type Placement = {
  top: number;
  left: number;
  arrowSide: Side;
  arrowPos: number;
  arrowAxis: 'x' | 'y';
};

const MARGIN = 12;
const GAP = 14;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function computePlacement(rect: DOMRect, cw: number, ch: number): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceAbove = rect.top;
  const spaceBelow = vh - rect.bottom;
  const spaceLeft = rect.left;
  const spaceRight = vw - rect.right;

  const needed = (side: Side) => (side === 'top' || side === 'bottom' ? ch : cw) + GAP + MARGIN;
  const candidates: { side: Side; space: number }[] = [
    { side: 'bottom', space: spaceBelow },
    { side: 'top', space: spaceAbove },
    { side: 'right', space: spaceRight },
    { side: 'left', space: spaceLeft },
  ];
  const fitting = candidates.filter(c => c.space >= needed(c.side));
  const chosen = (fitting.length > 0 ? fitting : candidates).sort((a, b) => b.space - a.space)[0].side;

  let top: number;
  let left: number;

  if (chosen === 'bottom' || chosen === 'top') {
    top = chosen === 'bottom' ? rect.bottom + GAP : rect.top - GAP - ch;
    left = rect.left + rect.width / 2 - cw / 2;
  } else {
    left = chosen === 'right' ? rect.right + GAP : rect.left - GAP - cw;
    top = rect.top + rect.height / 2 - ch / 2;
  }

  top = clamp(top, MARGIN, vh - ch - MARGIN);
  left = clamp(left, MARGIN, vw - cw - MARGIN);

  if (chosen === 'top' || chosen === 'bottom') {
    const targetCenter = rect.left + rect.width / 2;
    return {
      top, left,
      arrowSide: chosen === 'bottom' ? 'top' : 'bottom',
      arrowPos: clamp(targetCenter - left, 20, cw - 20),
      arrowAxis: 'x',
    };
  }

  const targetCenter = rect.top + rect.height / 2;
  return {
    top, left,
    arrowSide: chosen === 'right' ? 'left' : 'right',
    arrowPos: clamp(targetCenter - top, 20, ch - 20),
    arrowAxis: 'y',
  };
}

export function Tutorial({ steps, onFinish }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  useLayoutEffect(() => {
    function measureTarget() {
      const candidates = document.querySelectorAll(`[data-tutorial="${step.target}"]`);
      let visibleRect: DOMRect | null = null;
      candidates.forEach((el) => {
        if (visibleRect) return;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) visibleRect = r;
      });
      setRect(visibleRect);
    }
    measureTarget();
    window.addEventListener('resize', measureTarget);
    window.addEventListener('orientationchange', measureTarget);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('orientationchange', measureTarget);
    };
  }, [step.target]);

  useLayoutEffect(() => {
    if (!rect || !calloutRef.current) {
      setPlacement(null);
      return;
    }
    const cw = calloutRef.current.offsetWidth;
    const ch = calloutRef.current.offsetHeight;
    setPlacement(computePlacement(rect, cw, ch));
  }, [rect, stepIndex]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleNext() {
    if (isLast) {
      onFinish();
    } else {
      setStepIndex(i => i + 1);
    }
  }

  return (
    <div className="tutorial-overlay">
      {rect && (
        <div
          className="tutorial-spotlight"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      )}

      <div
        ref={calloutRef}
        className="tutorial-callout"
        style={{
          top: placement?.top ?? -9999,
          left: placement?.left ?? -9999,
          opacity: placement ? 1 : 0,
        }}
      >
        {placement && (
          <span
            className={`tutorial-callout-arrow tutorial-callout-arrow-${placement.arrowSide}`}
            style={placement.arrowAxis === 'x' ? { left: placement.arrowPos } : { top: placement.arrowPos }}
          />
        )}

        <div className="tutorial-callout-header">
          <img src={robotTip} alt="" className="tutorial-callout-avatar" />
          <div className="tutorial-dots">
            {steps.map((_, i) => (
              <span key={i} className={`tutorial-dot ${i === stepIndex ? 'is-active' : ''}`} />
            ))}
          </div>
        </div>

        <p>{step.text}</p>

        <div className="tutorial-actions">
          <button type="button" className="tutorial-skip-btn" onClick={onFinish}>
            Pular
          </button>
          <button type="button" className="btn-primary" onClick={handleNext}>
            {isLast ? 'Entendi!' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
