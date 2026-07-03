# procbotweb

Jogo web/mobile (TCC) pra ensinar pensamento computacional/lógico a crianças e adolescentes. Stack: Vite + React + TS. Base do `main` já funciona.

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
- Sem `chromium-cli`/Playwright instalados — não dá pra tirar screenshot do app rodando sem instalar antes.
- `npm run build` atualmente falha no `tsc` por causa de 2 unused vars pré-existentes em `src/App.tsx` (`setMascotTip`, `handleAddByClick`) — não relacionado a CSS/imagens, não foi corrigido ainda.
