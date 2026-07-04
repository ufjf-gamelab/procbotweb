# procbotweb

Jogo web/mobile (TCC) pra ensinar pensamento computacional/lógico a crianças e adolescentes. Stack: Vite + React + TS. Base do `main` já funciona.

## Sobre a aprência do jogo
- O jogo deve sempre priorizar interfaces que sejam atrativas para o público infantil e que seja simples de manusear.
- O jogo será usado princialmente em dispositivos mobiles, por isso, é importante que seja sempre responsivo e pensado para usabilidade em telas pequenas (tanto vertical, quanto horizontal).

## Preferências do usuário
- Pouco limite de tokens — respostas curtas, direto ao ponto, sem resumos longos.
- Não adicionar comentários no código.
- Agrupar pedidos, evitar rodar build/dev a cada edit pequeno.

## Estado da branch `feature/adjustments-to-the-user-experience`
Troca de CSS + adição de imagens deixou o jogo lento. Causas e correções já aplicadas em `src/styles.css`:
- `fundo_home.png`/`fundo_laboratorio.png` eram PNGs brutos de 1,6–2,2MB → convertidos pra `.jpg` (~160–280KB) via `sips`.
- Removido `filter: blur()` full-screen sobre o fundo do tabuleiro (`.layout::before`) — era o maior custo.
- Removidos 8 de 10 `backdrop-filter: blur()` (botões, painéis, tabuleiro, cards, header, balão de fala), trocados por fundo sólido semi-opaco. Mantidos só os 2 de overlays esporádicos (aviso de girar tela, modal de vitória).
- Removidos assets órfãos não usados: `icones_personagem1/2/3.png` (~7,3MB) e 4 PNGs `_antigo`.
- Corrigido path errado `./src/assets/...` → `./assets/...` no CSS (relativo a `src/styles.css`).

## Cuidado ao adicionar novas imagens/CSS no futuro
- Sempre comprimir imagens de fundo antes de commitar (JPEG/WebP, não PNG cru). Meta: <300KB por imagem full-screen.
- Evitar `backdrop-filter`/`filter: blur()` em elementos permanentemente visíveis — é uma das operações CSS mais caras. Só usar em overlays transitórios (modais, avisos).
- `vite.config.ts` tem `base: "/procbotweb/"` (GitHub Pages) — paths de asset em CSS são relativos ao arquivo CSS, não ao root.

## Ambiente
- `chromium-cli` não está instalado, mas o pacote `playwright` (com Chromium já baixado em cache) fica disponível via `npx playwright` — dá pra escrever um script `_electron`-style (`import { chromium } from 'playwright'`) pra dirigir o app headless e tirar screenshot. `npx` resolve o pacote num diretório de cache próprio (`~/.npm/_npx/<hash>/node_modules`); rode o script de dentro desse diretório (ou copie pra lá) pra a resolução de módulos ESM encontrar o `playwright`.
- `npm run build`/`npm run lint` passam limpos (0 erros). Restou só 1 warning pré-existente e inofensivo em `src/App.tsx` (`react-hooks/exhaustive-deps` no `useEffect` de `saveSession`).
- Bug pré-existente (não introduzido por nenhuma feature recente, confirmado via `git stash`): em viewports desktop por volta de 1280×800, o tabuleiro (`.board-grid`) renderiza largo demais e visualmente sobrepõe a `.sidebar`, interceptando cliques em elementos do canto superior direito do painel direito. Não afeta portrait/landscape mobile nem viewports desktop mais largos (testado em 1800×900). Ainda não investigado a fundo nem corrigido.
- rode `npm run lint` no final de edições e corija erros e warnings.
