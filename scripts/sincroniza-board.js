// Move os cards do board "Ticket Pra Já — Desenvolvimento" (projeto 4) conforme o trabalho anda.
// Chamado pelo workflow reutilizável .github/workflows/sincroniza-board.yml.
//
//   issue atribuída                        -> Em andamento (se não estiver bloqueada)
//   label needs-owner / blocked            -> Bloqueado (needs-owner marca o PO)
//   PO remove needs-owner / remove blocked -> Em andamento (ou Pronto sem responsável) e avisa o responsável
//   outra pessoa remove needs-owner        -> label devolvido
//   PR aberto/reaberto/pronto p/ revisão   -> Em revisão (issues citadas com "Closes #N")
//   PR mesclado em development             -> Homologação
//   card movido para Aprovado              -> manual, pelo PO, depois de testar no sandbox
//   PR de release development -> padrão    -> Concluído + fecha as issues em Aprovado/Homologação do repositório
//   PR hotfix/ mesclado na branch padrão   -> Concluído
module.exports = async ({ github, context, core }) => {
  const ORG = 'Ticket-Pra-Ja';
  const NUM = 4;
  const PO = 'rafaelmoraishmb';           // único que pode liberar needs-owner
  const LABEL_PO = 'needs-owner';         // tarefa parada aguardando decisão do PO
  const LABEL_BLOQUEIO = 'blocked';       // parada por dependência técnica ou externa
  const LABELS_BLOQUEIO = [LABEL_PO, LABEL_BLOQUEIO];
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
  const nomesLabels = (issue) => (issue.labels || []).map(l => (l.name || '').toLowerCase());
  const bloqueada = (issue) => nomesLabels(issue).some(n => LABELS_BLOQUEIO.includes(n));

  if (ev === 'issues' && acao === 'assigned') {
    if (bloqueada(context.payload.issue)) return; // continua em Bloqueado até liberar
    await moverIssue(context.payload.issue.number, 'Em andamento');
    return;
  }

  if (ev === 'issues' && (acao === 'labeled' || acao === 'unlabeled')) {
    const issue = context.payload.issue;
    const label = (context.payload.label?.name || '').toLowerCase();
    const quem = context.payload.sender?.login || '';
    const ehBot = context.payload.sender?.type === 'Bot';
    if (issue.state !== 'open' || !LABELS_BLOQUEIO.includes(label)) return;

    if (acao === 'labeled') {
      await moverIssue(issue.number, 'Bloqueado');
      if (label === LABEL_PO && !ehBot) {
        await github.rest.issues.createComment({ owner, repo, issue_number: issue.number,
          body: `@${PO} esta tarefa está parada aguardando você. Responda aqui e remova o label \`${LABEL_PO}\` para liberar.` });
      }
      return;
    }

    // unlabeled
    if (label === LABEL_PO && quem !== PO && !ehBot) {
      await github.rest.issues.addLabels({ owner, repo, issue_number: issue.number, labels: [LABEL_PO] });
      await github.rest.issues.createComment({ owner, repo, issue_number: issue.number,
        body: `@${quem} só o PO (@${PO}) pode remover o label \`${LABEL_PO}\`. O label foi restaurado.` });
      return;
    }
    if (bloqueada(issue)) return; // ainda tem outro label de bloqueio

    const responsaveis = (issue.assignees || []).map(a => a.login);
    await moverIssue(issue.number, responsaveis.length ? 'Em andamento' : 'Pronto');
    if (responsaveis.length) {
      const motivo = label === LABEL_PO ? 'O PO respondeu' : 'O bloqueio foi removido';
      await github.rest.issues.createComment({ owner, repo, issue_number: issue.number,
        body: `${responsaveis.map(l => '@' + l).join(' ')} ${motivo}; pode retomar. Leia os últimos comentários antes de continuar.` });
    }
    return;
  }

  if (ev === 'pull_request' || ev === 'pull_request_target') {
    const pr = context.payload.pull_request;
    const base = pr.base.ref;
    const head = pr.head.ref;

    // Só PRs abertos: editar a descrição de um PR já mesclado não pode devolver as issues para Em revisão.
    if (['opened', 'reopened', 'ready_for_review', 'edited'].includes(acao) && pr.state === 'open' && !pr.draft) {
      for (const n of issuesDoPR(pr)) await moverIssue(n, 'Em revisão');
      return;
    }

    if (acao === 'closed' && pr.merged) {
      if (base === 'development') {
        for (const n of issuesDoPR(pr)) await moverIssue(n, 'Homologação');
        return;
      }

      if (base === padrao && head === 'development') {
        // Release: tudo que estava em Aprovado ou Homologação neste repositório foi para produção.
        // Homologação sem aprovação também vai (o código já estava na development), com aviso na issue.
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
            if (!it.status || !['Aprovado', 'Homologação'].includes(it.status.name)) continue;
            const semAprovacao = it.status.name === 'Homologação';
            await definirStatus(it.id, 'Concluído');
            if (c.state === 'OPEN') {
              await github.rest.issues.createComment({ owner, repo, issue_number: c.number,
                body: semAprovacao
                  ? `Publicado em produção pelo PR #${pr.number} **sem aprovação em homologação** (o card ainda estava em Homologação).`
                  : `Publicado em produção pelo PR #${pr.number}.` });
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
