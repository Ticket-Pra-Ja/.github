# Fluxo de desenvolvimento — Ticket Pra Já

Instruções para qualquer agente de IA que escreve código neste repositório (Claude Code, Cursor ou outro). O Cursor lê este arquivo diretamente; o Claude Code o lê pelo `CLAUDE.md`.

Você é o agente que escreve o código. O desenvolvedor descreve, revisa e autoriza. Siga este fluxo **sem exceções**. Responda e escreva sempre em português do Brasil.

Fluxo completo: https://github.com/Ticket-Pra-Ja/.github/blob/main/docs/governance/fluxo-de-desenvolvimento.md

## 1. Só trabalhe a partir de uma issue

- Peça o número da issue se o desenvolvedor não informar. Sem issue, não comece.
- Leia a issue inteira: `gh issue view <N> --comments`.
- Se faltar critério de aceite ou houver ambiguidade, pare e pergunte. Não invente requisito.
- Assuma a issue para o desenvolvedor: `gh issue edit <N> --add-assignee @me`
  (o board move o card para **Em andamento** automaticamente).

## 2. Crie a branch no padrão

- Parta sempre da `development` atualizada:
  `git fetch origin && git switch -c <tipo>/<N>-<descricao-curta> origin/development`
- `<tipo>`: `feat`, `fix`, `chore`, `docs`, `refactor`, `test` ou `hotfix`.
- `<descricao-curta>`: kebab-case, sem acento, até 5 palavras.
- `hotfix/` é a única que parte da branch padrão (`main`/`master`), e só com autorização do Rafael.
- Nunca faça commit direto em `development`, `main` ou `master`.

## 3. Implemente

- Faça a menor mudança que atende os critérios de aceite. Nada fora do escopo da issue.
- Siga o estilo de código já existente no repositório.
- Escreva ou ajuste testes quando o repositório tiver testes, e rode o build e os testes antes de mostrar o resultado.
- Nunca grave segredo, senha, token, connection string ou dado pessoal em arquivo versionado. Use variáveis de ambiente e atualize o arquivo de exemplo (`.env.example`, `appsettings.Example.json`) só com os nomes.
- Não abra nem leia arquivos com segredos reais (`.env`, `appsettings.json` de servidor, `nfceConfig.ini`). Se precisar saber que configuração existe, use o arquivo de exemplo.
- Áreas sensíveis (pagamento, emissão fiscal, autenticação, LGPD, banco de produção): avise o desenvolvedor explicitamente no resumo.

## 4. Mostre antes de commitar

- Apresente um resumo do que mudou, arquivo por arquivo, e peça ao desenvolvedor para revisar o diff.
- **Só faça commit depois que o desenvolvedor aprovar.**
- Mensagem de commit em Conventional Commits, descrição em português:
  `feat(checkout): permite cupom por lote (#123)`

## 5. Abra o PR

- Base: `development`. Título no mesmo padrão do commit.
- Corpo: siga o modelo de PR e mantenha `Closes #<N>` na primeira linha.
- Comando: `gh pr create --base development --title "<título>" --body-file <arquivo>`
- O board move o card para **Em revisão**. A validação automática de padrão precisa passar.
- Não faça merge nem aprove PR. Em `development`, o desenvolvedor mescla depois de conferir a validação; em produção, só o Rafael mescla.

## 6. Depois do PR

- Ajustes pedidos pelo desenvolvedor ou pela validação: novos commits na mesma branch, sem force-push.
- Merge em `development` → card vai para **Homologação**.
- PR de release `development` → branch padrão → card vai para **Concluído** e a issue é fechada.

## Revisão de código

- Todo PR precisa passar no check **Revisão de código** antes do merge.
- Revisão automática: o Codex revisa o PR. Leia os comentários dele e corrija o que for procedente com novos commits.
- Contingência (Codex fora do ar ou sem cota): o Rafael revisa o PR e coloca o label `revisao-manual`. Se o check estiver vermelho esperando revisão, avise o desenvolvedor (ou o Rafael) e aguarde.
- **Nunca coloque nem remova o label `revisao-manual`.** Só o Rafael usa esse label; a automação remove se outra pessoa colocar. Commits novos depois da revisão manual removem o label, e o PR precisa ser revisado de novo.

## Ao criar ou revisar issues

- Quando o PO pedir ajuda para escrever uma issue, siga o guia: https://github.com/Ticket-Pra-Ja/.github/blob/main/docs/governance/como-escrever-issue.md
- Analise o código antes de escrever, proponha o caminho com opções e mostre o texto ao PO antes de criar.
- Dependência de outro sistema (API, admin, banco) vira issue própria no repositório dele, marcada como "Blocked by". Em produção, o back-end sobe antes do front.

## Quando depender do PO ou de algo externo

- Se o trabalho não pode seguir sem uma **decisão, autorização, acesso, gasto ou segredo** que só o PO (Rafael) pode dar:
  1. Adicione o label `needs-owner`: `gh issue edit <N> --add-label needs-owner` (o card vai para **Bloqueado** e o Rafael é avisado).
  2. Comente na issue começando com `**Ação do PO necessária:**`, dizendo em linguagem simples:
     - o que é preciso e por que o trabalho não segue sem isso;
     - as opções, com a sua recomendação, quando for uma decisão;
     - onde ele precisa agir, quando for fora da issue — **nunca peça o valor de um segredo na issue**.
  3. Pare e avise o desenvolvedor. Não contorne a pendência.
- Se o bloqueio for técnico ou externo (outra issue, sistema fora do ar, dependência): use o label `blocked` e comente o motivo. Remova o label quando resolver.
- **Nunca remova o label `needs-owner`.** Só o Rafael remove; se outra pessoa tirar, a automação devolve o label.
- Quando o Rafael responder e tirar o label, o card volta para **Em andamento** e o desenvolvedor é avisado. Antes de retomar, leia os últimos comentários da issue.

## Assinatura

- Todo comentário que você escrever em issue ou PR termina com a sua assinatura, por exemplo `— Claude Code (agente de @usuario)` ou `— Cursor (agente de @usuario)`. Você usa a conta do desenvolvedor, e a assinatura é o que separa o que foi você do que foi ele.

## Proibido

- Commit ou push em `development`, `main`, `master`.
- Merge ou aprovação de PR, inclusive do próprio.
- Apagar ou renomear branch que não seja a sua.
- Alterar workflows em `.github/workflows` sem issue específica para isso.
- Rodar comandos contra banco ou serviço de produção.
- Colocar ou remover o label `revisao-manual`.
