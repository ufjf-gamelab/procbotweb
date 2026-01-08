import { 
    AiOutlineArrowUp, 
    AiOutlineRotateRight,
    AiOutlineRotateLeft,
    AiOutlineBulb, 
    AiOutlineFunction 
  } from "react-icons/ai";
  import type { CmdKind } from './types';

export const CMD_CONFIG: Record<CmdKind, { icon: React.ReactNode; label: string; color?: string }> = {
ANDAR: { 
    icon: <AiOutlineArrowUp size={20} />, 
    label: 'Andar',
    color: '#60a5fa' 
},
ESQUERDA: { 
    icon: <AiOutlineRotateLeft size={20} />, 
    label: 'Esq.',
    color: '#fbbf24' 
},
DIREITA: { 
    icon: <AiOutlineRotateRight size={20} />, 
    label: 'Dir.',
    color: '#fbbf24' 
},
ACENDER: { 
    icon: <AiOutlineBulb size={20} />, 
    label: 'Luz',
    color: '#34d399' 
},
CALL_F1: { 
    icon: <AiOutlineFunction size={20} />, 
    label: 'Func 1', 
    color: '#a78bfa' 
},
};