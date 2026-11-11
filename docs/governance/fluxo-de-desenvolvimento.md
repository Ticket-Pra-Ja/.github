# Fluxo de desenvolvimento

Como uma tarefa sai da ideia e chega em produção na Ticket Pra Já. Decisão registrada na [ADR-004](../decisions/ADR-004-fluxo-de-desenvolvimento.md).

> **Situação: em piloto.** Este fluxo vale apenas para os repositórios listados em [Adoção](#adoção). Os demais seguem como estão até serem migrados.

## Papéis

| Papel | Quem | Responsabilidade |
|---|---|---|
| PO | Rafael | Prioriza o Backlog, responde pendências `needs-owner` e é o único que mescla em produção (releases e hotfixes) |
| Desenvolvedor | Juan, Wagner | Escolhe tarefa em **Pronto**, conduz o agente (Claude Code no VS Code ou Cursor), revisa o código gerado, mescla o próprio PR em `development` quando a validação passar, testa em homologação, abre o PR de release |
| Projetos | Marcos | Acompanha o board (somente leitura) |
| Agente de IA | Claude Code (VS Code) ou Cursor | Escreve o código a partir da issue, seguindo o `AGENTS.md` do repositório |

## Board

Um único board para todos os repositórios: **[Ticket Pra Já — Desenvolvimento](https://github.com/orgs/Ticket-Pra-Ja/projects/4)**. Cada card mostra o repositório de origem.

| Status | Significa | Quem move |
|---|---|---|
| Backlog | Ideia registrada, ainda não refinada | Automático ao criar a issue |
| Pronto | Refinada, com critérios de aceite; pode ser puxada | Rafael |
| Em andamento | Alguém assumiu e está desenvolvendo | Automático ao atribuir a issue |
| Em revisão | PR aberto, aguardando a validação e o merge | Automático ao abrir o PR |
| Homologação | Mesclado em `development`, em teste no ambiente de homologação | Automático no merge |
| Aprovado | Testado em homologação e liberado para a próxima release | Rafael, depois de testar |
| Concluído | Em produção | Automático no merge da release |
| Bloqueado | Parada aguardando o PO (`needs-owner`) ou um impedimento (`blocked`) | Automático pelo label |

Fora **Pronto** e **Aprovado**, que são decisões do Rafael, ninguém precisa arrastar card: o status acompanha o que acontece no GitHub.

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
2. No Claude Code ou no Cursor, peça ao agente: *"Implemente a issue #123"*.
3. O agente lê a issue, se atribui a ela, cria a branch e implementa.
4. O agente mostra o resumo do que mudou. **Revise o diff.** Peça ajustes até ficar bom.
5. Autorize o commit. O agente faz commit e abre o PR para `development`.
6. A validação automática confere branch, título e vínculo com a issue, e o build compila, roda o lint e os testes. Se algo falhar, peça ao agente para corrigir.
7. Com a validação verde, o próprio desenvolvedor faz o merge em `development`. Não há revisão de outra pessoa nesta etapa: a revisão é a do desenvolvedor sobre o código gerado (passo 4), e a homologação é o teste. O card vai para **Homologação**.
8. Teste os critérios de aceite no ambiente de homologação. Com tudo certo, o Rafael move o card para **Aprovado**.
9. Na release, um desenvolvedor (ou o Rafael) abre o PR `development → main/master` listando o que vai para produção. O check **Portão de release** fica vermelho enquanto houver card do repositório em **Homologação** (testado e ainda não aprovado); depois de aprovar, rode o check de novo. **Só o Rafael faz o merge.** Use merge comum, não squash, para a `development` e a branch padrão continuarem com o mesmo histórico. No merge, os cards em **Aprovado** vão para **Concluído** e as issues são fechadas. Os que ainda estavam em **Homologação** também vão (o código deles já estava na `development`), com um comentário avisando que foram publicados sem aprovação.

Depois de um `hotfix/`, leve a correção de volta para a `development`: crie uma issue, uma branch `chore/N-sincroniza-development` a partir da branch padrão e abra o PR para a `development`.

## Quem pode mesclar

| Destino | Quem aprova | Quem mescla | Como o GitHub garante |
|---|---|---|---|
| `development` (homologação) | Não exige aprovação | O próprio desenvolvedor, com a validação verde | Ruleset `protege-development`: PR obrigatório e checks **Validar padrão do PR** e **Build e testes**; sem push direto |
| `main`/`master` (produção), inclusive `hotfix/` | Não exige aprovação | **Somente o Rafael** | Ruleset `producao-somente-po`: PR obrigatório e só o owner da organização atualiza a branch, e apenas por PR |

Nos repositórios ainda não adotados continua valendo a regra antiga `protege-branch-principal` (PR + 1 aprovação na branch padrão).

O agente de IA nunca mescla nem aprova nada: quem mescla em `development` é o desenvolvedor, depois de revisar o que o agente gerou.

## O que é automático e o que bloqueia

| Item | Onde | Bloqueia o merge? |
|---|---|---|
| Padrão de branch, título e `Closes #N` | `padrao-pr.yml` | Sim, nos repositórios em piloto |
| Build, lint e testes (`build / Build e testes`) | `build-dotnet.yml` ou `build-node.yml` | Sim, nos repositórios em piloto |
| Movimento dos cards | `sincroniza-board.yml` | Nunca |
| Card ainda em Homologação no PR de release (`board / Portão de release`) | `sincroniza-board.yml` + `scripts/portao-release.js` | Avisa em vermelho; o Rafael pode mesclar mesmo assim |
| 1 aprovação + sem push direto na branch padrão | Ruleset `protege-branch-principal` | Sim, nos repositórios ainda não adotados |
| PR obrigatório e validação verde em `development` | Ruleset `protege-development` | Sim, nos repositórios em piloto |
| Merge em produção só pelo Rafael | Ruleset `producao-somente-po` | Sim, nos repositórios em piloto |
| Regras para o agente | `AGENTS.md` (o Claude Code lê pelo `CLAUDE.md`) | Orienta os dois agentes |
| Merge, aprovação e push em branch protegida pelo agente | `.claude/settings.json` | Bloqueia no Claude Code; no Cursor vale só a instrução |

## Adoção

A adoção é por repositório, sem afetar os demais:

1. Criar a branch `development` a partir da branch padrão, se não existir.
2. Copiar para o repositório:
   - `modelos/ISSUE_TEMPLATE/*` → `.github/ISSUE_TEMPLATE/`
   - `modelos/PULL_REQUEST_TEMPLATE.md` → `.github/PULL_REQUEST_TEMPLATE.md`
   - `modelos/AGENTS.md` → `AGENTS.md` (raiz)
   - `modelos/CLAUDE.md` → `CLAUDE.md` (raiz)
   - `modelos/claude/settings.json` → `.claude/settings.json`
   - `workflow-templates/padrao-ticketpraja.yml` → `.github/workflows/`
   - `modelos/workflows/build-dotnet.yml` ou `modelos/workflows/build-node.yml` → `.github/workflows/build.yml` (ajustando o caminho do projeto no .NET)
3. Criar os labels `needs-owner` ("Aguardando decisão do PO", vermelho) e `blocked` ("Parada por impedimento técnico ou externo", laranja).
4. Nas regras da organização (Settings → Rulesets), incluir o repositório em:
   - `protege-development` (branch `development`: PR sem aprovação mínima, checks **Validar padrão do PR** e **Build e testes**, sem exclusão nem force push, sem exceções);
   - `producao-somente-po` (branch padrão: PR sem aprovação mínima e **Restrict updates**, com exceção apenas para **Organization admin** no modo **For pull requests only**);
   - a lista de exclusão de `protege-branch-principal`.
5. Levar os arquivos do passo 2 para a `development` com uma issue e um PR `chore/N-sincroniza-development`, que já serve de teste do fluxo.
6. Atualizar a tabela abaixo.

| Repositório | Situação |
|---|---|
| `.github` | Exceção: só o Rafael mescla na `main` (`producao-somente-po`); não usa `development` |
| `marketplace.ticketpraja` | Piloto adotado em 11/11/2026; fluxo testado de ponta a ponta (issue #2: Em andamento → Em revisão → Homologação → Concluído) |
| `api.v2.ticketpraja` | Adotado em 11/11/2026 (issue #1) |

## Limites do que o GitHub garante

- "Só o Rafael mescla em produção" é garantido pelo papel **owner da organização**, e não pelo usuário dele. Quando houver um segundo owner, ele também poderá mesclar.
- Em `development` não há segunda pessoa olhando o código antes do merge. O que segura a qualidade é a revisão do próprio desenvolvedor, a validação automática e o teste em homologação. Na produção, o merge do Rafael é o portão.
- Os agentes usam a credencial do desenvolvedor, e o GitHub não distingue o agente do desenvolvedor. No Claude Code, o `.claude/settings.json` bloqueia merge, aprovação e push em branch protegida; no Cursor, a proibição vem só da instrução no `AGENTS.md`. Os bloqueios do Claude Code são uma proteção a mais, não uma garantia: um comando escrito de outra forma pode escapar deles. Em produção, o que impede um merge sem autorização é a regra `producao-somente-po`.
- Agentes que usam a conta do Rafael (Claude, ChatGPT) conseguem mesclar em produção como ele. Por isso assinam tudo o que escrevem (regra 10 do `AGENTS.md`).
- As regras ficam na organização, e só owners da organização podem alterá-las. Os desenvolvedores têm acesso de escrita, não de administrador.

## Pré-requisito único

Um GitHub App da organização para mover os cards, com os secrets `TPJ_BOARD_APP_ID` e `TPJ_BOARD_APP_KEY`. Sem eles, a validação de PR funciona normalmente e o board apenas não é atualizado.
