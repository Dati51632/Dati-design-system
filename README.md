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

## Como usar no Claude (Cowork / Claude Code)

Este repositório funciona como uma **skill do Claude**: o arquivo `SKILL.md` na raiz é o que o Claude lê para saber como aplicar a marca. Para instalar:

1. Clone ou baixe este repositório.
2. Coloque a pasta `design-system-dati/` dentro do diretório de skills do seu projeto/organização (consulte a documentação de skills do Claude para o caminho exato do seu ambiente).
3. A partir daí, qualquer pedido de criar apresentação, post, one-pager ou proposta para a Dati vai acionar automaticamente as diretrizes deste repositório.

Como o skill é só arquivos de texto e imagem em uma pasta, **qualquer membro do time que clonar/atualizar o repositório sempre tem a versão mais recente** — não há build ou instalação além de copiar a pasta.

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
