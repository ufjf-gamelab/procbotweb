import {
    AiOutlineArrowUp,
    AiOutlineRotateRight,
    AiOutlineRotateLeft,
    AiOutlineBulb,
    AiOutlineSync,
  } from "react-icons/ai";
  import type { CmdKind } from './types';

export type CmdTheme = { icon: React.ReactNode; label: string; color: string; dark: string; glow: string };

export const CMD_CONFIG: Record<CmdKind, CmdTheme> = {
ANDAR: {
    icon: <AiOutlineArrowUp size={20} />,
    label: 'Andar',
    color: '#60a5fa',
    dark: '#1e3a8a',
    glow: 'rgba(96, 165, 250, 0.35)'
},
ESQUERDA: {
    icon: <AiOutlineRotateLeft size={20} />,
    label: 'Esq.',
    color: '#fb923c',
    dark: '#9a3412',
    glow: 'rgba(251, 146, 60, 0.35)'
},
DIREITA: {
    icon: <AiOutlineRotateRight size={20} />,
    label: 'Dir.',
    color: '#fb923c',
    dark: '#9a3412',
    glow: 'rgba(251, 146, 60, 0.35)'
},
ACENDER: {
    icon: <AiOutlineBulb size={20} />,
    label: 'Luz',
    color: '#34d399',
    dark: '#065f46',
    glow: 'rgba(52, 211, 153, 0.35)'
}
};

export const FUNCTION_THEME: CmdTheme = {
  icon: null,
  label: 'Função',
  color: '#a78bfa',
  dark: '#4c1d95',
  glow: 'rgba(167, 139, 250, 0.35)'
};

const FUNCTION_PALETTE: { color: string; dark: string; glow: string }[] = [
  { color: '#a78bfa', dark: '#4c1d95', glow: 'rgba(167, 139, 250, 0.35)' },
  { color: '#facc15', dark: '#854d0e', glow: 'rgba(250, 204, 21, 0.35)' },
  { color: '#22d3ee', dark: '#0e7490', glow: 'rgba(34, 211, 238, 0.35)' },
  { color: '#2dd4bf', dark: '#115e59', glow: 'rgba(45, 212, 191, 0.35)' },
  { color: '#4ade80', dark: '#166534', glow: 'rgba(74, 222, 128, 0.35)' },
  { color: '#f97316', dark: '#7c2d12', glow: 'rgba(249, 115, 22, 0.35)' },
  { color: '#818cf8', dark: '#3730a3', glow: 'rgba(129, 140, 248, 0.35)' },
  { color: '#e879f9', dark: '#86198f', glow: 'rgba(232, 121, 249, 0.35)' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getFunctionTheme(funcId: string): CmdTheme {
  const entry = FUNCTION_PALETTE[hashString(funcId.toUpperCase()) % FUNCTION_PALETTE.length];
  return { ...FUNCTION_THEME, ...entry };
}

export const LOOP_THEME: CmdTheme = {
  icon: <AiOutlineSync size={20} />,
  label: 'Repetir',
  color: '#f472b6',
  dark: '#831843',
  glow: 'rgba(244, 114, 182, 0.35)'
};

export function getCommandLabel(
  kind: CmdKind | string,
  opts?: { functionName?: string; loopTimes?: number }
): string {
  const kindStr = String(kind);

  if (kindStr.startsWith('CALL_')) {
    return `Chamar função ${opts?.functionName ?? kindStr.replace('CALL_', '')}`;
  }

  if (kindStr === 'REPEAT_NEW') return 'Adicionar repetição';

  if (kindStr.startsWith('LOOP_')) {
    return opts?.loopTimes ? `Repetir ${opts.loopTimes} vezes` : 'Repetir';
  }

  return CMD_CONFIG[kindStr as CmdKind]?.label ?? kindStr;
}