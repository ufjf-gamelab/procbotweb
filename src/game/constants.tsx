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

export const LOOP_THEME: CmdTheme = {
  icon: <AiOutlineSync size={20} />,
  label: 'Repetir',
  color: '#f472b6',
  dark: '#831843',
  glow: 'rgba(244, 114, 182, 0.35)'
};