# ADR-003 — Idioma padrão

- **Status:** Aceita
- **Data:** 2026-11-10

## Contexto

A Ticket pra Já é uma empresa brasileira, com equipe, clientes e operação em português. Documentos e descrições em outros idiomas dificultam a leitura pela equipe de produto e projetos.

## Decisão

O **português do Brasil** é o idioma padrão da organização.

**Escrever sempre em português:**

- Documentação (README, ADRs, guias, runbooks).
- Títulos e descrições de pull requests e issues.
- Mensagens de commit (o texto após o prefixo).
- Descrições de repositórios, times e Projects.
- Comentários de revisão.

**Exceções (manter como estão):**

- Prefixos de commit convencionais: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. Exemplo: `fix: corrige cálculo de taxa no checkout`.
- Nomes de código (classes, variáveis, rotas e tabelas): seguem o padrão já usado em cada repositório.
- Termos técnicos sem tradução consagrada (deploy, branch, pull request, merge, token).
- Nomes de repositórios, conforme o [padrão de nomes](../governance/repository-naming.md).

## Consequências

- Agentes de IA devem escrever em português, conforme o [AGENTS.md](../../AGENTS.md).
- Conteúdo antigo em outro idioma não precisa ser traduzido de uma vez; é atualizado quando for alterado.
