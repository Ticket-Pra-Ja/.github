// Janela de deploy: roda a partir das 00:00 (horário de Brasília) e leva para produção, por repositório,
// o que o PO liberou. Chamado por .github/workflows/janela-deploy.yml (agendado ou manual).
//
// Regras (docs/governance/fluxo-de-desenvolvimento.md, "Janela de deploy"):
//   - Card em "Aprovado" com o label deploy-dia entra na primeira janela depois do label.
//   - Card em "Aprovado" com o label deploy-padrao entra na janela de segunda-feira.
//   - O release leva tudo o que está na development do repositório. Por isso o repositório só sobe se
//     TODOS os cards abertos dele em "Homologação" ou "Aprovado" estiverem liberados para esta janela.
//     Card em Homologação, aprovado sem label ou com deploy-padrao fora da segunda segura o repositório.
//   - Só sobe se o último build da development estiver verde e o PR de release não tiver conflito.
// Cada janela com algo a relatar vira um comentário na issue de registro, marcando o PO.
module.exports = async ({ github, context, core, cfg }) => {
  const { org, projeto, repos, po, simular } = cfg;
  const agora = new Date(Date.now() - 3 * 3600 * 1000); // horário de Brasília (UTC-3)
  const segunda = agora.getUTCDay() === 1;
  const hoje = agora.toISOString().slice(0, 10).split('-').reverse().join('/');

  // 0. Garante os labels de deploy nos repositórios da janela.
  const LABELS = [
    { name: 'deploy-dia', color: '0e8a16', description: 'Liberado pelo PO: sobe na próxima janela (00:00)' },
    { name: 'deploy-padrao', color: '1d76db', description: 'Liberado pelo PO: sobe na janela de segunda (00:00)' },
  ];
  for (const repo of repos) for (const l of LABELS) {
    await github.rest.issues.createLabel({ owner: org, repo, ...l }).catch(e => { if (e.status !== 422) core.warning(`${repo}: label ${l.name}: ${e.message}`); });
  }

  // 1. Cards do board por repositório (abertos, em Homologação ou Aprovado).
  const cards = {};
  let cursor = null;
  do {
    const r = await github.graphql(`
      query($org: String!, $num: Int!, $after: String) {
        organization(login: $org) {
          projectV2(number: $num) {
            items(first: 100, after: $after) {
              pageInfo { hasNextPage endCursor }
              nodes {
                status: fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name } }
                content { ... on Issue { number title state labels(first: 20) { nodes { name } } repository { name } } }
              }
            }
          }
        }
      }`, { org, num: projeto, after: cursor });
    const pagina = r.organization.projectV2.items;
    for (const it of pagina.nodes) {
      const c = it.content;
      const status = it.status?.name;
      if (!c?.repository || c.state !== 'OPEN' || !['Homologação', 'Aprovado'].includes(status)) continue;
      (cards[c.repository.name] = cards[c.repository.name] || []).push({
        numero: c.number, titulo: c.title, status, labels: c.labels.nodes.map(l => l.name),
      });
    }
    cursor = pagina.pageInfo.hasNextPage ? pagina.pageInfo.endCursor : null;
  } while (cursor);

  const relatorio = [];
  for (const repo of repos) {
    const lista = cards[repo] || [];
    const liberados = [], travas = [];
    for (const c of lista) {
      const ref = `${repo}#${c.numero} ${c.titulo}`;
      if (c.status !== 'Aprovado') travas.push(`${ref}: ainda em Homologação`);
      else if (c.labels.includes('deploy-dia')) liberados.push(ref);
      else if (c.labels.includes('deploy-padrao')) (segunda ? liberados : travas).push(segunda ? ref : `${ref}: deploy-padrao, aguarda a janela de segunda`);
      else travas.push(`${ref}: aprovado sem label de deploy`);
    }
    if (!liberados.length) {
      if (travas.length) core.info(`${repo}: nada liberado para hoje.`);
      continue;
    }
    if (travas.length) {
      relatorio.push(`### ${repo}: segurado\nLiberados, mas não sobem porque o release leva toda a development:\n${liberados.map(l => `- ${l}`).join('\n')}\n\nO que está travando:\n${travas.map(t => `- ${t}`).join('\n')}`);
      continue;
    }

    // 2. Há diferença entre development e main? O último build da development está verde?
    const { data: meta } = await github.rest.repos.get({ owner: org, repo });
    const padrao = meta.default_branch;
    const { data: cmp } = await github.rest.repos.compareCommits({ owner: org, repo, base: padrao, head: 'development' });
    if (cmp.ahead_by === 0) { relatorio.push(`### ${repo}: nada a subir\nA development já está na ${padrao}.`); continue; }
    const head = (await github.rest.repos.getBranch({ owner: org, repo, branch: 'development' })).data.commit.sha;
    const { data: runs } = await github.rest.checks.listForRef({ owner: org, repo, ref: head, per_page: 100 });
    const build = runs.check_runs.filter(r => /Build e testes/.test(r.name)).sort((a, b) => (a.started_at < b.started_at ? 1 : -1))[0];
    if (!build || build.conclusion !== 'success') {
      relatorio.push(`### ${repo}: segurado\nO último build da development (${head.slice(0, 7)}) está ${build ? (build.conclusion || build.status) : 'ausente'}.`);
      continue;
    }

    if (simular) { relatorio.push(`### ${repo}: subiria (simulação)\n${liberados.map(l => `- ${l}`).join('\n')}`); continue; }

    // 3. Abre (ou reaproveita) o PR de release e mescla.
    const corpo = `Release automático da janela de deploy de ${hoje}.\n\nCards:\n${liberados.map(l => `- ${l}`).join('\n')}\n\nLiberado pelo PO com os labels de deploy; cards conferidos pela janela (todos aprovados, build da development verde).`;
    let pr;
    const { data: abertos } = await github.rest.pulls.list({ owner: org, repo, state: 'open', head: `${org}:development`, base: padrao });
    if (abertos.length) {
      pr = abertos[0];
      await github.rest.issues.createComment({ owner: org, repo, issue_number: pr.number, body: corpo });
    } else {
      ({ data: pr } = await github.rest.pulls.create({ owner: org, repo, head: 'development', base: padrao, title: `release: janela de deploy de ${hoje}`, body: corpo }));
    }
    let estado = null;
    for (let i = 0; i < 12 && (estado === null || estado === 'unknown'); i++) {
      await new Promise(r => setTimeout(r, 5000));
      estado = (await github.rest.pulls.get({ owner: org, repo, pull_number: pr.number })).data.mergeable_state;
    }
    if (estado === 'dirty') {
      relatorio.push(`### ${repo}: segurado\nO PR de release #${pr.number} tem conflito com a ${padrao}.`);
      continue;
    }
    try {
      await github.rest.pulls.merge({ owner: org, repo, pull_number: pr.number, merge_method: 'merge', sha: head });
      relatorio.push(`### ${repo}: em produção\nPR #${pr.number} mesclado.\n${liberados.map(l => `- ${l}`).join('\n')}`);
    } catch (e) {
      relatorio.push(`### ${repo}: falhou ao mesclar\nPR #${pr.number}: ${e.message}`);
      core.warning(`${repo}: ${e.message}`);
    }
  }

  // 4. Registro.
  core.summary.addHeading(`Janela de deploy de ${hoje}${segunda ? ' (segunda)' : ''}`, 2);
  core.summary.addRaw(relatorio.length ? relatorio.join('\n\n') : 'Nada liberado nesta janela.');
  await core.summary.write();
  if (!relatorio.length) return;

  const titulo = 'Janela de deploy: registro';
  const { data: issues } = await github.rest.issues.listForRepo({ owner: org, repo: '.github', state: 'open', per_page: 100 });
  let registro = issues.find(i => i.title === titulo && !i.pull_request);
  if (!registro) {
    ({ data: registro } = await github.rest.issues.create({ owner: org, repo: '.github', title: titulo,
      body: 'Cada janela de deploy com algo a relatar comenta aqui: o que subiu, o que foi segurado e por quê. Regras em docs/governance/fluxo-de-desenvolvimento.md.' }));
  }
  await github.rest.issues.createComment({ owner: org, repo: '.github', issue_number: registro.number,
    body: `@${po} janela de deploy de ${hoje}${simular ? ' (simulação, nada foi mesclado)' : ''}:\n\n${relatorio.join('\n\n')}` });
};
