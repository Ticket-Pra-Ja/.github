// Portão de release: no PR development -> branch padrão, lista o que vai para produção
// e falha se algum card deste repositório ainda estiver em "Homologação" (não aprovado).
// Chamado pelo job "Portão de release" de .github/workflows/sincroniza-board.yml.
// Depois de mover os cards para "Aprovado", rode o job de novo (Re-run) ou edite o PR.
module.exports = async ({ github, context, core }) => {
  const ORG = 'Ticket-Pra-Ja';
  const NUM = 4;
  const pr = context.payload.pull_request;
  const padrao = context.payload.repository.default_branch;
  const repoCompleto = `${context.repo.owner}/${context.repo.repo}`;

  if (!pr || pr.head.ref !== 'development' || pr.base.ref !== padrao) {
    core.info('Não é PR de release; nada a verificar.');
    return;
  }

  const porStatus = {};
  let cursor = null;
  do {
    const r = await github.graphql(`
      query($org: String!, $num: Int!, $after: String) {
        organization(login: $org) {
          projectV2(number: $num) {
            items(first: 100, after: $after) {
              pageInfo { hasNextPage endCursor }
              nodes {
                status: fieldValueByName(name: "Status") {
                  ... on ProjectV2ItemFieldSingleSelectValue { name }
                }
                content {
                  ... on Issue { number title state url repository { nameWithOwner } }
                }
              }
            }
          }
        }
      }`, { org: ORG, num: NUM, after: cursor });
    const pagina = r.organization.projectV2.items;
    for (const it of pagina.nodes) {
      const c = it.content;
      if (!c || !c.repository || c.repository.nameWithOwner !== repoCompleto || c.state !== 'OPEN') continue;
      const s = it.status ? it.status.name : 'Sem status';
      (porStatus[s] = porStatus[s] || []).push(c);
    }
    cursor = pagina.pageInfo.hasNextPage ? pagina.pageInfo.endCursor : null;
  } while (cursor);

  const aprovados = porStatus['Aprovado'] || [];
  const pendentes = porStatus['Homologação'] || [];
  const linha = (c) => `#${c.number} ${c.title}`;

  core.summary.addHeading('Portão de release', 2);
  core.summary.addHeading(`Aprovados (${aprovados.length})`, 3).addList(aprovados.length ? aprovados.map(linha) : ['nenhum']);
  core.summary.addHeading(`Ainda em Homologação (${pendentes.length})`, 3).addList(pendentes.length ? pendentes.map(linha) : ['nenhum']);
  await core.summary.write();

  if (pendentes.length) {
    core.setFailed(
      `Há ${pendentes.length} card(s) em Homologação que ainda não foram aprovados: ` +
      pendentes.map(c => `#${c.number}`).join(', ') +
      '. Teste no sandbox, mova para "Aprovado" e rode este job de novo. O código deles já está na development e irá junto nesta release.'
    );
  } else {
    core.info(`Tudo aprovado: ${aprovados.map(c => '#' + c.number).join(', ') || 'nenhum card pendente'}.`);
  }
};
