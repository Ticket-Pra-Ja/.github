# Fluxo de desenvolvimento

Como uma tarefa sai da ideia e chega em produção na Ticket Pra Já. Decisão registrada na [ADR-004](../decisions/ADR-004-fluxo-de-desenvolvimento.md).

> **Situação: em piloto.** Este fluxo vale apenas para os repositórios listados em [Adoção](#adoção). Os demais seguem como estão até serem migrados.

## Papéis

| Papel | Quem | Responsabilidade |
|---|---|---|
| PO | Rafael | Prioriza o Backlog, responde pendências `needs-owner`, autoriza e executa os merges em produção (releases e hotfixes) |
| Desenvolvedor | Juan, Wagner | Escolhe tarefa em **Pronto**, conduz o agente no Cursor, revisa o código gerado, revisa o PR do colega, mescla em `development` após aprovação, testa em homologação |
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
| Bloqueado | Parada aguardando o PO (`needs-owner`) ou um impedimento (`blocked`) | Automático pelo label |

Ninguém precisa arrastar card depois de **Pronto**: o status acompanha o que acontece no GitHub.

## Pendências com o PO

Quando uma tarefa depende de algo que só o Rafael pode dar — decisão, autorização, acesso, gasto ou segredo — o agente ou o dev:

1. adiciona o label `needs-owner` na issue;
2. comenta começando com `**Ação do PO necessária:**`: o que é preciso e por quê, as opções com recomendação e onde agir. Segredos nunca são pedidos na issue.

O card vai para **Bloqueado** e o Rafael é marcado num comentário automático.

**Caixa de entrada do PO:** [issues abertas com `needs-owner`](https://github.com/issues?q=is%3Aopen+org%3ATicket-Pra-Ja+label%3Aneeds-owner).

Para liberar, o Rafael responde na issue e remove o label. O card volta para **Em andamento** (ou **Pronto**, se ninguém estiver atribuído) e o responsável é marcado para retomar. Só o Rafael pode remover `needs-owner`: se outra pessoa remover, a automação devolve o label.

Impedimentos técnicos ou externos (outra issue, sistema fora do ar) usam o label `blocked`, que qualquer um remove quando o impedimento acaba.

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
7. Outro desenvolvedor (ou o Rafael) revisa e aprova. Com a aprovação e os checks verdes, o autor ou o revisor faz o merge em `development`. O card vai para **Homologação**.
8. Teste os critérios de aceite no ambiente de homologação.
9. Na release, um desenvolvedor abre o PR `development → main/master` listando o que vai para produção. Outra pessoa aprova e **só o Rafael faz o merge**. No merge, os cards vão para **Concluído** e as issues são fechadas.

## Quem pode mesclar

| Destino | Quem aprova | Quem mescla | Como o GitHub garante |
|---|---|---|---|
| `development` (homologação) | Qualquer pessoa com escrita, **exceto o autor** | Qualquer desenvolvedor autorizado, depois da aprovação e dos checks | Regra da branch: PR obrigatório, 1 aprovação, aprovação refeita se houver push novo, check **Validar padrão do PR** |
| `main`/`master` (produção), inclusive `hotfix/` | Qualquer pessoa com escrita, **exceto o autor** | **Somente o Rafael** | Regra da organização `protege-branch-principal` (PR + 1 aprovação) e regra do repositório que só deixa o owner da organização atualizar a branch, e apenas por PR |

O autor nunca aprova o próprio PR (o GitHub bloqueia). O agente de IA nunca mescla nada.

## O que é automático e o que bloqueia

| Item | Onde | Bloqueia o merge? |
|---|---|---|
| Padrão de branch, título e `Closes #N` | `padrao-pr.yml` | Sim, nos repositórios em piloto |
| Movimento dos cards | `sincroniza-board.yml` | Nunca |
| 1 aprovação + sem push direto na branch padrão | Ruleset `protege-branch-principal` | Sim, em todos os repositórios |
| 1 aprovação de outra pessoa em `development` | Ruleset `protege-development` | Sim, nos repositórios em piloto |
| Merge em produção só pelo Rafael | Ruleset `producao-somente-po` | Sim, nos repositórios em piloto |
| Regras para o agente | `.cursor/rules/fluxo-ticketpraja.mdc` | Orienta o agente no Cursor |

## Adoção

A adoção é por repositório, sem afetar os demais:

1. Criar a branch `development` a partir da branch padrão, se não existir.
2. Copiar para o repositório:
   - `modelos/ISSUE_TEMPLATE/*` → `.github/ISSUE_TEMPLATE/`
   - `modelos/PULL_REQUEST_TEMPLATE.md` → `.github/PULL_REQUEST_TEMPLATE.md`
   - `modelos/cursor/rules/fluxo-ticketpraja.mdc` → `.cursor/rules/`
   - `workflow-templates/padrao-ticketpraja.yml` → `.github/workflows/`
3. Criar os labels `needs-owner` ("Aguardando decisão do PO", vermelho) e `blocked` ("Parada por impedimento técnico ou externo", laranja).
4. Criar no repositório a regra `protege-development` para a branch `development`: exigir PR, 1 aprovação, aprovação refeita após push novo, check **Validar padrão do PR** e bloquear exclusão e force push. Sem lista de exceções.
5. Criar no repositório a regra `producao-somente-po` para a branch padrão: **Restrict updates**, com exceção apenas para **Organization admin**, no modo **For pull requests only**.
6. Atualizar a tabela abaixo.

| Repositório | Situação |
|---|---|
| `marketplace.ticketpraja` | Piloto escolhido (issue #6); adoção pendente |

## Limites do que o GitHub garante

- "Só o Rafael mescla em produção" é garantido pelo papel **owner da organização**, e não pelo usuário dele. Quando houver um segundo owner, ele também poderá mesclar.
- A aprovação exigida pode vir de qualquer pessoa com escrita no repositório, inclusive do Rafael. Com só dois desenvolvedores, a ausência de um deles faz o outro depender do Rafael para aprovar.
- O agente do Cursor usa a credencial do desenvolvedor. A proibição de o agente mesclar vem da regra do Cursor; o que impede um merge sem revisão é a aprovação obrigatória de outra pessoa.
- Até a validação virar obrigatória pela organização (passo seguinte ao piloto), quem tem acesso de administrador ao repositório pode desligar a regra do próprio repositório. Os desenvolvedores têm acesso de escrita, não de administrador.

## Pré-requisito único

Um GitHub App da organização para mover os cards, com os secrets `TPJ_BOARD_APP_ID` e `TPJ_BOARD_APP_KEY`. Sem eles, a validação de PR funciona normalmente e o board apenas não é atualizado.
