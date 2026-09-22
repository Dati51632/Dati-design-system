# Design System — Dati

Sistema de marca e diretrizes de composição da **Dati** (consultoria em cloud, dados e IA, parceira AWS), construído a partir do guia de marca oficial e de exemplos reais de apresentações, posts e one-pagers já produzidos pelo time. Serve para manter qualquer material — feito pelo time ou gerado por IA — consistente com a identidade e o posicionamento da empresa.

## Estrutura do repositório

```
design-system-dati/
├── SKILL.md                        ← ponto de entrada para o Claude (skill)
├── tokens/                         ← valores prontos para consumo por código/IA
│   ├── colors.json / colors.css
│   └── typography.json
├── assets/
│   ├── logo/                       ← logo e símbolo em PNG, várias variantes de cor
│   └── fonts/                      ← Manrope, 7 pesos (.ttf)
└── docs/                           ← guias em Markdown, legíveis por humanos e por qualquer IA
    ├── 01-marca-e-posicionamento.md
    ├── 02-cores.md
    ├── 03-tipografia.md
    ├── 04-logo-e-simbolo.md
    ├── 05-elementos-graficos.md
    └── materiais/
        ├── apresentacoes.md
        ├── posts-redes-sociais.md
        ├── one-pagers-e-propostas.md
        └── documentos-internos.md
```

## Instalação e uso no Claude Code

Este repositório funciona como uma **skill do Claude**: o `SKILL.md` na raiz é o que o Claude lê para saber como aplicar a marca. A skill cobre dois tipos de uso — a skill de design e o gerador de PPTX.

### Pré-requisitos

- **Node.js** ≥ 18 instalado (para o gerador de PPTX)
- Arquivo `MAP.pptx` colocado em `assets/template-source/MAP.pptx` (template visual de referência — solicite ao time)

### Windows

```bat
REM 1. Clone o repositório
git clone https://github.com/Dati51632/Dati-design-system.git

REM 2. Instale as dependências do engine
cd Dati-design-system\templates
npm install

REM 3. Copie a pasta para o diretório de skills do Claude Code
xcopy /E /I "C:\caminho\Dati-design-system" "C:\Users\<seu-usuario>\.claude\skills\dati-design-system"
```

**Usar o gerador de PPTX (Windows):**
```bat
node "C:\Users\<seu-usuario>\.claude\skills\dati-design-system\templates\pptx-template-engine.mjs" "C:\caminho\slides-input.json"
REM Saída padrão: C:\Users\<seu-usuario>\Downloads\dati-apresentacao-gerada.pptx
```

Para abrir o arquivo gerado automaticamente:
```bat
start "" "C:\Users\<seu-usuario>\Downloads\dati-apresentacao-gerada.pptx"
```

### Mac

```bash
# 1. Clone o repositório
git clone https://github.com/Dati51632/Dati-design-system.git

# 2. Instale as dependências do engine
cd Dati-design-system/templates
npm install

# 3. Copie a pasta para o diretório de skills do Claude Code
cp -r ~/caminho/Dati-design-system ~/.claude/skills/dati-design-system
```

**Usar o gerador de PPTX (Mac):**
```bash
node ~/.claude/skills/dati-design-system/templates/pptx-template-engine.mjs ~/caminho/slides-input.json
# Saída padrão: ~/Downloads/dati-apresentacao-gerada.pptx
```

Para abrir o arquivo gerado automaticamente:
```bash
open ~/Downloads/dati-apresentacao-gerada.pptx
```

### Atualizar para a versão mais recente

```bash
# Dentro da pasta do repositório
git pull origin main

# Windows — re-sincronize os skills
xcopy /E /I /Y "." "C:\Users\<seu-usuario>\.claude\skills\dati-design-system"

# Mac — re-sincronize os skills
cp -r . ~/.claude/skills/dati-design-system
```

> Como o skill é só arquivos de texto, imagem e um script Node, **qualquer membro do time que clonar/atualizar o repositório sempre tem a versão mais recente** — não há build além do `npm install` na pasta `templates/`.

## Como usar em outras IAs (ChatGPT, Gemini, etc.)

Os arquivos em `docs/` são Markdown puro, sem nada específico do Claude — podem ser colados diretamente como contexto/instrução em qualquer assistente de IA:

1. Cole o conteúdo de `docs/01-marca-e-posicionamento.md` + o guia de material relevante (ex. `docs/materiais/apresentacoes.md`) no início da conversa.
2. Anexe os arquivos de `tokens/` se a ferramenta aceitar anexos, para valores exatos de cor/tipografia.
3. Anexe os arquivos de `assets/logo/` quando a ferramenta permitir upload de imagem de referência.

## Como manter atualizado

Este repositório é a fonte única da verdade — atualizações devem ser feitas aqui, nunca em cópias locais soltas.

- **Pequenos ajustes** (corrigir um valor, adicionar um exemplo): edite o arquivo Markdown/JSON relevante e publique um commit direto.
- **Mudanças de marca** (nova cor, novo padrão visual): atualize `tokens/` **e** o `docs/*.md` correspondente na mesma alteração, para que nunca fiquem dessincronizados.
- **Novo tipo de material real** (ex. um relatório interno real, um novo formato de post): siga o mesmo processo usado para construir os guias atuais — analise 2-3 exemplos reais antes de escrever o guia, para que ele descreva o que o time realmente faz, não um padrão inventado.
- Registre a mudança em `CHANGELOG.md`.

## Origem deste material

Construído em setembro de 2026 a partir de:
- Guia de marca oficial da Dati (21 páginas, produzido pela Firmorama).
- 4 apresentações reais (DataFrete Summit, Vibe to Production, Proposta Comercial, Além do EIXO).
- 16 posts reais da campanha "Série IA" (Instagram/LinkedIn).
- 2 one-pagers reais (formato programa/oferta e formato case de sucesso).
