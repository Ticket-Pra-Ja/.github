// Publica no PR o resultado da revisão pelo Claude (job "Revisão pelo Claude" de
// .github/workflows/revisao-codigo.yml). Mantém um único comentário por PR, atualizado a cada commit.
// O marcador <!-- revisao-claude:v1 {"commit_sha":"..."} --> é o que o scripts/revisao-codigo.js aceita
// como revisão do último commit, desde que o comentário seja do app do board.
const fs = require('fs');

const MARCADOR = 'revisao-claude:v1';

module.exports = async ({ github, context, core, arquivo }) => {
  const { owner, repo } = context.repo;
  const pr = context.payload.pull_request;
  if (!pr) { core.info('Evento sem PR; nada a publicar.'); return; }
  const head = pr.head.sha;

  let resultado = '';
  try { resultado = fs.readFileSync(arquivo, 'utf8').trim(); } catch { /* sem arquivo */ }
  if (!resultado) {
    core.setFailed('A revisão pelo Claude não gerou resultado. Veja o log do passo "Revisar com Claude".');
    return;
  }

  // Remove marcadores que o texto revisado possa ter tentado injetar.
  resultado = resultado.replace(/<!--[\s\S]*?-->/g, '');

  const body = [
    `<!-- ${MARCADOR} ${JSON.stringify({ commit_sha: head })} -->`,
    '## Revisão pelo Claude',
    '',
    resultado,
    '',
    `**Commit revisado:** \`${head.slice(0, 10)}\``,
    '',
    '<sub>Revisão automática. Corrija o que for procedente com novos commits; cada commit novo é revisado de novo. ' +
      'Se a revisão estiver fora do ar, o PO revisa e usa o label `revisao-manual`.</sub>',
  ].join('\n');

  const comentarios = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number: pr.number, per_page: 100 });
  const existente = comentarios.find(c => c.user?.type === 'Bot' && (c.body || '').includes(MARCADOR));
  if (existente) {
    await github.rest.issues.updateComment({ owner, repo, comment_id: existente.id, body });
  } else {
    await github.rest.issues.createComment({ owner, repo, issue_number: pr.number, body });
  }
  await core.summary.addHeading('Revisão pelo Claude', 2).addRaw(resultado).write();
};
