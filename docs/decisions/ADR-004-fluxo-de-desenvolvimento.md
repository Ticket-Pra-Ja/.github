# ADR-004 — Fluxo de desenvolvimento orientado por issue e executado por agente de IA

- **Status:** Aceita (em piloto)
- **Data:** 2026-11-10
- **Decisor:** Rafael (PO)

## Contexto

O desenvolvimento hoje não tem padrão: branches pessoais (`juan_dev`, `wagner_dev`), tarefas espalhadas em projetos antigos, status atualizado manualmente e sem vínculo garantido entre tarefa, código e entrega. A empresa quer que agentes de IA (Cursor) escrevam a maior parte do código, com o desenvolvedor no papel de revisor. A mudança não pode afetar as entregas em andamento.

## Decisão

1. **Um board único** (projeto 4) para todos os repositórios, com os status Backlog → Pronto → Em andamento → Em revisão → Homologação → Concluído, mais Bloqueado.
2. **Toda mudança nasce de uma issue** criada por formulário com critérios de aceite obrigatórios.
3. **Branches**: `development` = homologação; branch padrão = produção; trabalho em `tipo/NUMERO-descricao`.
4. **Conventional Commits** em títulos de PR e commits, com descrição em português (ADR-003).
5. **Status do board é automático** a partir de eventos do GitHub, via workflow reutilizável e GitHub App.
6. **Padrão verificado por máquina**: workflow `padrao-pr.yml` como check obrigatório nos repositórios adotantes.
7. **Agente orientado por regra versionada** (`.cursor/rules/fluxo-ticketpraja.mdc`): só trabalha a partir de issue e só commita após aprovação do desenvolvedor.
8. **Pendências com o PO por label**: `needs-owner` move o card para Bloqueado e avisa o Rafael; só ele remove o label, e a remoção devolve a tarefa ao responsável. Impedimentos técnicos usam `blocked`. Mesmo padrão adotado na Ideavelo.
9. **Merges em dois níveis**: em `development`, o próprio desenvolvedor mescla o seu PR com a validação verde, sem revisão de outra pessoa, adequado ao tamanho da equipe; em produção (`main`/`master`, inclusive hotfix), o PR é aberto por um desenvolvedor e o PO aprova e mescla. Garantido por regras de branch; os limites estão no documento do fluxo.
10. **Adoção gradual por repositório**, começando por um piloto. Nada é ativado de forma global até o piloto ser validado.

## Consequências

- Rastreabilidade completa: issue → branch → PR → homologação → produção.
- O desenvolvedor não arrasta cards nem escreve boilerplate; foca em descrever e revisar.
- Branches pessoais deixam de existir nos repositórios adotantes.
- Exige um GitHub App com acesso a Projects e o ambiente de homologação ligado à `development` em cada repositório.
- Projetos antigos (1 a 3) continuam funcionando até a migração das tarefas.

## Alternativas consideradas

- **Jira/Linear**: mais um sistema e custo por usuário; o GitHub Projects já está incluído no plano Team e integra nativamente com PRs.
- **Ativar tudo na organização de uma vez**: rejeitado por risco de travar entregas em andamento.
- **Workflows nativos do Projects apenas**: não diferenciam merge em `development` de merge em produção.
