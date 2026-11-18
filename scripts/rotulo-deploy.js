// Labels de deploy (deploy-dia, deploy-padrao) liberam o card para a janela de produção e só o PO pode
// colocá-los. Se outra pessoa (ou agente com outra conta) colocar, a automação tira e avisa.
// Chamado pelo job "Label de deploy só pelo PO" de .github/workflows/sincroniza-board.yml (issues: labeled).
module.exports = async ({ github, context, core }) => {
  const PO = 'rafaelmoraishmb';
  const label = context.payload.label?.name;
  if (!['deploy-dia', 'deploy-padrao'].includes(label)) return;
  const quem = context.payload.sender?.login;
  if (quem === PO) { core.info(`Label ${label} colocado pelo PO.`); return; }
  const { owner, repo } = context.repo;
  const numero = context.payload.issue.number;
  await github.rest.issues.removeLabel({ owner, repo, issue_number: numero, name: label }).catch(() => {});
  await github.rest.issues.createComment({ owner, repo, issue_number: numero,
    body: `@${quem}, só o PO (@${PO}) libera cards para produção com o label \`${label}\`. O label foi removido.` });
  core.notice(`Label ${label} colocado por @${quem} removido.`);
};
