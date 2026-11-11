// Move os cards do board "Ticket Pra Já — Desenvolvimento" (projeto 4) conforme o trabalho anda.
// Chamado pelo workflow reutilizável .github/workflows/sincroniza-board.yml.
module.exports = async ({ github, context, core }) => {
  const ORG = 'Ticket-Pra-Ja';
  const NUM = 4;
  const { owner, repo } = context.repo;
  const repoCompleto = `${owner}/${repo}`;
  const padrao = context.payload.repository.default_branch;

  // ---------- projeto e campo Status ----------
  const { organization } = await github.graphql(`
    query($org: String!, $num: Int!) {
      organization(login: $org) {
        projectV2(number: $num) {
          id
          field(name: "Status") {
            ... on ProjectV2SingleSelectField { id options { id name } }
          }
        }
      }
    }`, { org: ORG, num: NUM });
  const projeto = organization.projectV2;
  const campo = projeto.field;
  const opcao = (nome) => {
    const o = campo.options.find(x => x.name === nome);
    if (!o) throw new Error(`Status "${nome}" não existe no projeto.`);
    return o.id;
  };

  const garantirItem = async (contentId) => {
    const r = await github.graphql(`
      mutation($p: ID!, $c: ID!) {
        addProjectV2ItemById(input: {projectId: $p, contentId: $c}) { item { id } }
      }`, { p: projeto.id, c: contentId });
    return r.addProjectV2ItemById.item.id;
  };

  const definirStatus = async (itemId, nome) => {
    await github.graphql(`
      mutation($p: ID!, $i: ID!, $f: ID!, $o: String!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $p, itemId: $i, fieldId: $f, value: { singleSelectOptionId: $o }
        }) { projectV2Item { id } }
      }`, { p: projeto.id, i: itemId, f: campo.id, o: opcao(nome) });
  };

  const moverIssue = async (numero, nome) => {
    const { data: issue } = await github.rest.issues.get({ owner, repo, issue_number: numero });
    if (issue.pull_request) return;
    const item = await garantirItem(issue.node_id);
    await definirStatus(item, nome);
    core.info(`#${numero} -> ${nome}`);
  };

  const issuesDoPR = (pr) => {
    const re = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi;
    return [...new Set([...(pr.body || '').matchAll(re)].map(m => parseInt(m[1], 10)))];
  };

  // ---------- eventos ----------
  const ev = context.eventName;
  const acao = context.payload.action;

  if (ev === 'issues' && acao === 'assigned') {
    await moverIssue(context.payload.issue.number, 'Em andamento');
    return;
  }

  if (ev === 'pull_request' || ev === 'pull_request_target') {
    const pr = context.payload.pull_request;
    const base = pr.base.ref;
    const head = pr.head.ref;

    if (['opened', 'reopened', 'ready_for_review', 'edited'].includes(acao) && !pr.draft) {
      for (const n of issuesDoPR(pr)) await moverIssue(n, 'Em revisão');
      return;
    }

    if (acao === 'closed' && pr.merged) {
      if (base === 'development') {
        for (const n of issuesDoPR(pr)) await moverIssue(n, 'Homologação');
        return;
      }

      if (base === padrao && head === 'development') {
        // Release: tudo que estava em Homologação neste repositório foi para produção.
        let cursor = null;
        do {
          const r = await github.graphql(`
            query($id: ID!, $after: String) {
              node(id: $id) {
                ... on ProjectV2 {
                  items(first: 100, after: $after) {
                    pageInfo { hasNextPage endCursor }
                    nodes {
                      id
                      status: fieldValueByName(name: "Status") {
                        ... on ProjectV2ItemFieldSingleSelectValue { name }
                      }
                      content {
                        ... on Issue { number state repository { nameWithOwner } }
                      }
                    }
                  }
                }
              }
            }`, { id: projeto.id, after: cursor });
          const pagina = r.node.items;
          for (const it of pagina.nodes) {
            const c = it.content;
            if (!c || !c.repository || c.repository.nameWithOwner !== repoCompleto) continue;
            if (!it.status || it.status.name !== 'Homologação') continue;
            await definirStatus(it.id, 'Concluído');
            if (c.state === 'OPEN') {
              await github.rest.issues.createComment({ owner, repo, issue_number: c.number,
                body: `Publicado em produção pelo PR #${pr.number}.` });
              await github.rest.issues.update({ owner, repo, issue_number: c.number,
                state: 'closed', state_reason: 'completed' });
            }
            core.info(`#${c.number} -> Concluído`);
          }
          cursor = pagina.pageInfo.hasNextPage ? pagina.pageInfo.endCursor : null;
        } while (cursor);
        return;
      }

      if (base === padrao) {
        for (const n of issuesDoPR(pr)) await moverIssue(n, 'Concluído');
        return;
      }
    }
  }

  core.info(`Evento ${ev}/${acao} sem ação no board.`);
};
