# Fluxo de desenvolvimento

Como uma tarefa sai da ideia e chega em produção na Ticket Pra Já. Decisão registrada na [ADR-004](../decisions/ADR-004-fluxo-de-desenvolvimento.md).

> **Situação: em piloto.** Este fluxo vale apenas para os repositórios listados em [Adoção](#adoção). Os demais seguem como estão até serem migrados.

## Papéis

| Papel | Quem | Responsabilidade |
|---|---|---|
| PO e revisor | Rafael | Prioriza o Backlog, aprova PRs, autoriza releases para produção |
| Desenvolvedor | Juan, Wagner | Escolhe tarefa em **Pronto**, conduz o agente no Cursor, revisa o código gerado, testa em homologação |
| Projetos | Marcos | Acompanha o board (somente leitura) |
| Agente de IA | Cursor | Escreve o código a partir da issue, seguindo `.cursor/rules/fluxo-ticketpraja.mdc` |

## Board

Um único board para todos os repositórios: **[Ticket Pra Já — Desenvolvimento](https://github.com/orgs/Ticket-Pra-Ja/projects/4)**. Cada card mostra o repositório de origem.

| Status | Significa | Quem move |
|---|---|---|
| Backlog | Ideia registrada, ainda não refinada | Automático ao criar a issue |
| Pronto | Refinada, com critérios de aceite; pode ser puxada | Rafael |
| Em andamento | Alguém assumiu e está desenvolvendo | Automático ao atribuir a issue |
| Em revisão | PR aberto aguardando revisão | Automático ao abrir o PR |
| Homologação | Mesclado em `development`, em teste no ambiente de homologação | Automático no merge |
| Concluído | Em produção | Automático no merge da release |

Ninguém precisa arrastar card depois de **Pronto**: o status acompanha o que acontece no GitHub.

## Tipos de tarefa

Toda tarefa nasce como issue, por formulário:

- **Funcionalidade** (`feat`) — algo novo ou melhorado para cliente ou operação.
- **Bug** (`fix`) — comportamento errado.
- **Tarefa técnica** (`chore`) — refatoração, infraestrutura, dependências, segurança.

Todos os formulários exigem **critérios de aceite**. É a partir deles que o agente gera o código e que a homologação é feita.

## Branches

```
hotfix/N-...  ──────────────────────────────► main/master  (produção)
                                                  ▲
feat/N-... ─┐                                     │ PR de release
fix/N-...  ─┼──► development (homologação) ───────┘
chore/N-...─┘
```

- `main`/`master`: produção. Protegida; só recebe PR de release ou `hotfix/`.
- `development`: homologação. Protegida; só recebe PR.
- Branch de trabalho: `tipo/NUMERO-descricao-curta`, criada a partir de `development`.
  - `tipo`: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `hotfix`
  - Exemplo: `feat/123-cupom-por-lote`
- Branches pessoais (`fulano_dev`) deixam de ser usadas nos repositórios em piloto.

## Commits e PRs

Padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), descrição em português:

```
feat(checkout): permite cupom por lote
fix: corrige arredondamento do NFC-e
```

- O título do PR segue o mesmo padrão.
- O corpo do PR começa com `Closes #NUMERO` (palavra-chave do GitHub, mantida em inglês).
- O número da issue no corpo deve ser o mesmo da branch.

## Passo a passo do desenvolvedor

1. No board, escolha um card em **Pronto**.
2. No Cursor, peça ao agente: *"Implemente a issue #123"*.
3. O agente lê a issue, se atribui a ela, cria a branch e implementa.
4. O agente mostra o resumo do que mudou. **Revise o diff.** Peça ajustes até ficar bom.
5. Autorize o commit. O agente faz commit e abre o PR para `development`.
6. A validação automática confere branch, título e vínculo com a issue. Se falhar, peça ao agente para corrigir.
7. Rafael revisa e faz o merge. O card vai para **Homologação**.
8. Teste os critérios de aceite no ambiente de homologação.
9. Na release, Rafael abre o PR `development → main/master`. No merge, os cards vão para **Concluído** e as issues são fechadas.

## O que é automático e o que bloqueia

| Item | Onde | Bloqueia o merge? |
|---|---|---|
| Padrão de branch, título e `Closes #N` | `padrao-pr.yml` | Sim, nos repositórios em piloto |
| Movimento dos cards | `sincroniza-board.yml` | Nunca |
| 1 aprovação + sem push direto na branch padrão | Ruleset `protege-branch-principal` | Sim, em todos os repositórios |
| Regras para o agente | `.cursor/rules/fluxo-ticketpraja.mdc` | Orienta o agente no Cursor |

## Adoção

A adoção é por repositório, sem afetar os demais:

1. Criar a branch `development` a partir da branch padrão, se não existir.
2. Copiar para o repositório:
   - `modelos/ISSUE_TEMPLATE/*` → `.github/ISSUE_TEMPLATE/`
   - `modelos/PULL_REQUEST_TEMPLATE.md` → `.github/PULL_REQUEST_TEMPLATE.md`
   - `modelos/cursor/rules/fluxo-ticketpraja.mdc` → `.cursor/rules/`
   - `workflow-templates/padrao-ticketpraja.yml` → `.github/workflows/`
3. Proteger `development` (PR obrigatório) e exigir o check **Validar padrão do PR**.
4. Atualizar a tabela abaixo.

| Repositório | Situação |
|---|---|
| — | Nenhum ainda; piloto a definir |

## Pré-requisito único

Um GitHub App da organização para mover os cards, com os secrets `TPJ_BOARD_APP_ID` e `TPJ_BOARD_APP_KEY`. Sem eles, a validação de PR funciona normalmente e o board apenas não é atualizado.
