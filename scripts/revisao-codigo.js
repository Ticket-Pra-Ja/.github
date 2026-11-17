// Check "Revisão de código": o PR só passa se tiver sido revisado.
// Chamado por .github/workflows/revisao-codigo.yml.
//
//   Revisão automática: o Codex revisou o último commit do PR. Vale de dois jeitos:
//     - uma revisão (review) do Codex no último commit, quando ele tem apontamentos;
//     - o comentário-recibo do Codex ("Reviewed commit: <sha>"), quando não encontra nada.
//   Revisão manual (contingência): o PO revisa o PR e coloca o label "revisao-manual".
//     - Só o PO pode colocar o label; se outra pessoa (ou agente com outra conta) colocar, ele é removido.
//     - Novos commits depois da revisão manual removem o label: o código novo precisa de nova revisão.
module.exports = async ({ github, context, core }) => {
  const PO = 'rafaelmoraishmb';
  const LABEL = 'revisao-manual';
  const REVISORES = ['chatgpt-codex-connector[bot]'];
  const { owner, repo } = context.repo;
  const numero = context.payload.pull_request?.number;
  if (!numero) { core.info('Evento sem PR; nada a verificar.'); return; }

  const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number: numero });
  const head = pr.head.sha;
  let labels = pr.labels.map(l => l.name);

  const comentar = (body) => github.rest.issues.createComment({ owner, repo, issue_number: numero, body });
  const tirarLabel = async () => {
    await github.rest.issues.removeLabel({ owner, repo, issue_number: numero, name: LABEL }).catch(() => {});
    labels = labels.filter(l => l !== LABEL);
  };

  // 1. Commits novos invalidam a revisão manual.
  if (context.eventName === 'pull_request' && context.payload.action === 'synchronize' && labels.includes(LABEL)) {
    await tirarLabel();
    await comentar(`Entraram commits novos depois da revisão manual, então o label \`${LABEL}\` foi removido. @${PO}, revise de novo.`);
  }

  // 2. Revisão manual: vale só se o label foi colocado pelo PO.
  if (labels.includes(LABEL)) {
    const eventos = await github.paginate(github.rest.issues.listEvents, { owner, repo, issue_number: numero, per_page: 100 });
    const ultimo = eventos.filter(e => e.event === 'labeled' && e.label?.name === LABEL).pop();
    const quem = ultimo?.actor?.login || 'desconhecido';
    if (quem === PO) {
      core.info(`Revisão manual feita pelo PO (@${PO}).`);
      await core.summary.addHeading('Revisão de código', 2).addRaw(`Revisão manual pelo PO (@${PO}).`).write();
      return;
    }
    await tirarLabel();
    await comentar(`@${quem} só o PO (@${PO}) pode colocar o label \`${LABEL}\`. O label foi removido.`);
    core.setFailed(`Label ${LABEL} colocado por @${quem}, que não é o PO.`);
    return;
  }

  // 3a. Revisão automática com apontamentos: review do Codex no último commit.
  const reviews = await github.paginate(github.rest.pulls.listReviews, { owner, repo, pull_number: numero, per_page: 100 });
  const doRevisor = reviews.filter(r => REVISORES.includes(r.user?.login) && r.commit_id === head);
  if (doRevisor.length) {
    core.info(`Revisado automaticamente por ${doRevisor[doRevisor.length - 1].user.login}.`);
    await core.summary.addHeading('Revisão de código', 2).addRaw('Revisão automática do Codex no último commit.').write();
    return;
  }

  // 3b. Revisão automática sem apontamentos: recibo do Codex citando o último commit.
  const comentarios = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number: numero, per_page: 100 });
  const recibo = comentarios
    .filter(c => REVISORES.includes(c.user?.login))
    .some(c => commitRevisado(c.body || '', head));
  if (recibo) {
    core.info('Codex revisou o último commit sem apontamentos.');
    await core.summary.addHeading('Revisão de código', 2).addRaw('Revisão automática do Codex no último commit, sem apontamentos.').write();
    return;
  }

  core.setFailed(
    `Aguardando revisão do último commit (${head.slice(0, 7)}). ` +
    `Revisão automática: o Codex revisa o PR. Se ela estiver fora do ar, o PO (@${PO}) revisa e coloca o label "${LABEL}".`
  );
};

// O Codex publica um comentário-recibo: "**Reviewed commit:** `abc1234567`" (revisão concluída),
// ou um estado em JSON (<!-- codex-review-state:v1 {...} -->) com commit_sha e status.
function commitRevisado(body, head) {
  const recibo = body.match(/Reviewed commit:\**\s*`([0-9a-f]{7,40})`/i);
  if (recibo && head.startsWith(recibo[1].toLowerCase())) return true;

  const estado = body.match(/codex-review-state:v1\s*(\{[\s\S]*?\})\s*-->/);
  if (estado) {
    try {
      const cr = JSON.parse(estado[1]).code_review || {};
      return cr.commit_sha === head && ['completed', 'complete', 'done'].includes(String(cr.status).toLowerCase());
    } catch { return false; }
  }
  return false;
}
