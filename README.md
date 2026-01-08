# Proc Bot Web

> Base arquitetural web responsiva para o ensino de Pensamento Computacional e Reuso de Código.

Este projeto é o artefato prático do Trabalho de Conclusão de Curso em Ciência da Computação da Universidade Federal de Juiz de Fora (Ufjf). Trata-se de um protótipo de alta fidelidade de um jogo educativo (*Serious Game*) focado em ensinar lógica de programação para crianças, com ênfase na experiência de usuário em dispositivos móveis.

## 🎯 Objetivos do Projeto

- **Acessibilidade Mobile:** Resolver o problema de usabilidade de ferramentas de blocos (VPL) em telas de toque, implementando física de arraste (*drag-and-drop*) e layouts responsivos.
- **Ensino de Abstração:** Introduzir o conceito de **Funções** (reuso de código) através de mecânicas de jogo que limitam recursos e forçam a otimização.
- **Arquitetura Sólida:** Estabelecer uma base de engenharia de software robusta (Frontend) para futuras expansões.

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido como uma *Single Page Application* (SPA) moderna, utilizando:

- **[React](https://react.dev/)**: Biblioteca principal para construção da interface.
- **[TypeScript](https://www.typescriptlang.org/)**: Para tipagem estática e segurança lógica do interpretador.
- **[Dnd Kit](https://dndkit.com/)**: Implementação dos sensores de toque, colisão e física de arraste.
- **[Framer Motion](https://www.framer.com/motion/)**: Animações de layout, transições e feedback visual.

## ✨ Funcionalidades Implementadas

- ✅ **Interpretador de Comandos:** Execução sequencial de blocos lógicos.
- ✅ **Sistema de Arraste Otimizado:** Diferenciação entre gestos de *scroll* e *drag* em celulares.
- ✅ **Layout Responsivo Inteligente:** Detecção de orientação (Portrait/Landscape) e adaptação de Grid.
- ✅ **Máquina de Estados Finita:** Gerenciamento robusto dos estados do jogo (Executando, Vitória, Falha).
- ✅ **Mecânica de Funções:** Suporte a sub-rotinas e pilha de execução (*Call Stack*).

## 📦 Como Rodar o Projeto

Pré-requisitos: Você precisa ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

```bash
# 1. Clone este repositório
git clone [https://github.com/ufjf-gamelab/procbotweb](https://github.com/ufjf-gamelab/procbotweb.git)

# 2. Acesse a pasta do projeto
cd procbotweb

# 3. Instale as dependências
npm install

# 4. Execute o projeto em modo de desenvolvimento
npm run dev

```

Autora: Rafaela Oliveira de Souza 
Orientador: Igor de Oliveira Knop 
Instituição: Universidade Federal de Juiz de Fora (Ufjf)
