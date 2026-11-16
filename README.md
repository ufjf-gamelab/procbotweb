# ProcBot Web

Jogo educacional web para o ensino de pensamento computacional e reuso de código a crianças e adolescentes.

O ProcBot Web está sendo desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Bacharelado em Ciência da Computação do Departamento de Ciência da Computação (DCC) do Instituto de Ciências Exatas (ICE) da Universidade Federal de Juiz de Fora (UFJF).

**Versão publicada:** https://ufjf-gamelab.github.io/procbotweb/

## Sobre o projeto

O jogo é um *serious game* inspirado no Lightbot. O jogador programa um robô com blocos de comandos para que ele percorra o tabuleiro e acenda todas as lâmpadas da fase. O projeto prioriza o uso em dispositivos móveis, tanto em orientação retrato quanto paisagem, sem necessidade de instalação.

As fases estão organizadas em três blocos, com dificuldade progressiva e desbloqueio em árvore:

| Bloco | Conceitos trabalhados |
| --- | --- |
| Básicos | Sequência de comandos, estado e algoritmo |
| Procedimentos | Abstração, decomposição, reconhecimento de padrões e reuso por meio de funções |
| Laços | Repetição por meio de recursão |

## Objetivos

- Oferecer uma ferramenta de programação por blocos adequada a telas de toque, com arraste de comandos e layout responsivo.
- Introduzir o conceito de funções (procedimentos) por meio de mecânicas que limitam a quantidade de comandos e incentivam o reuso.
- Disponibilizar um jogo gratuito, executável no navegador de computadores, tablets e celulares.

## Funcionalidades

- Interpretador de comandos com execução contínua, passo a passo e três velocidades.
- Funções (sub-rotinas) com pilha de execução, incluindo chamadas recursivas.
- Pontuação em estrelas conforme o número de comandos utilizados.
- Tutoriais guiados e dicas por fase.
- Progresso salvo localmente no navegador, com opção de apagar todos os dados.
- Layout responsivo para retrato e paisagem.

## Tecnologias

- [React](https://react.dev/) e [TypeScript](https://www.typescriptlang.org/), com [Vite](https://vite.dev/)
- [dnd kit](https://dndkit.com/) para arrastar e soltar comandos
- [Framer Motion](https://www.framer.com/motion/) para animações

## Execução local

Pré-requisito: [Node.js](https://nodejs.org/) instalado.

```bash
git clone https://github.com/ufjf-gamelab/procbotweb.git
cd procbotweb
npm install
npm run dev
```

Para gerar a versão de produção, utilize `npm run build`.

## Autoria

- **Autora:** Rafaela Oliveira de Souza (rafaela.oliveira@estudante.ufjf.br)
- **Orientador:** Prof. Igor de Oliveira Knop (igor.knop@ufjf.br)

Departamento de Ciência da Computação, Universidade Federal de Juiz de Fora (UFJF).

## Créditos

- Efeitos sonoros: [Kenney](https://kenney.nl/), licença CC0.
