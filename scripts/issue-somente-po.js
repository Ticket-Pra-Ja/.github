// Só o PO cria issues (fluxo de desenvolvimento, AGENTS.md). O GitHub não impede quem tem acesso
// de abrir issue, então esta automação fecha a issue aberta por outra pessoa, explica a regra e
// tira a issue do board. Issues do PO (inclusive do agente na conta dele) e de bots passam.
// Chamado pelo job "Issue só pelo PO" de .github/workflows/sincroniza-board.yml (issues: opened).
module.exports = async ({ github, context, core }) => {
  const PO = 'rafaelmoraishmb';
  const issue = context.payload.issue;
  if (!issue) { core.info('Evento sem issue; nada a fazer.'); return; }

  const autor = issue.user?.login || 'desconhecido';
  if (autor === PO || issue.user?.type === 'Bot') {
    core.info(`Issue #${issue.number} aberta por @${autor}: permitida.`);
    return;
  }

  const { owner, repo } = context.repo;
  await github.rest.issues.createComment({
    owner, repo, issue_number: issue.number,
    body: [
      `@${autor}, neste fluxo só o PO (@${PO}) cria issues. Devs e agentes executam as issues que estão em **Pronto**, então esta issue foi fechada.`,
      '',
      `Se você encontrou algo fora do escopo (bug, melhoria, dependência de outro sistema), comente na issue em que está trabalhando começando com \`**Sugestão para o PO:**\`, ou fale com o @${PO}. O texto desta issue continua aqui para ele aproveitar.`,
    ].join('\n'),
  });
  await github.rest.issues.update({ owner, repo, issue_number: issue.number, state: 'closed', state_reason: 'not_planned' });

  // A inclusão automática no board pode chegar alguns segundos depois da abertura.
  await new Promise(r => setTimeout(r, 15000));
  try {
    const r = await github.graphql(
      `query($id: ID!) { node(id: $id) { ... on Issue { projectItems(first: 20) { nodes { id project { id } } } } } }`,
      { id: issue.node_id }
    );
    for (const item of r.node?.projectItems?.nodes || []) {
      await github.graphql(
        `mutation($p: ID!, $i: ID!) { deleteProjectV2Item(input: { projectId: $p, itemId: $i }) { deletedItemId } }`,
        { p: item.project.id, i: item.id }
      );
    }
  } catch (e) {
    core.warning(`Não foi possível tirar a issue #${issue.number} do board: ${e.message}`);
  }

  core.notice(`Issue #${issue.number} aberta por @${autor} foi fechada: só o PO cria issues.`);
};
