// Quando o Codex comenta num PR (o recibo "Reviewed commit" sai num comentário, não numa review),
// reexecuta o check "Revisão de código" do último commit do PR, para que ele reconheça a revisão.
// Chamado por .github/workflows/revisao-codigo.yml no evento issue_comment.
module.exports = async ({ github, context, core }) => {
  const REVISORES = ['chatgpt-codex-connector[bot]'];
  const { owner, repo } = context.repo;
  const issue = context.payload.issue;
  if (!issue?.pull_request) { core.info('Comentário fora de PR.'); return; }
  if (!REVISORES.includes(context.payload.comment?.user?.login)) { core.info('Comentário não é do Codex.'); return; }

  const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number: issue.number });
  const head = pr.head.sha;

  const { data } = await github.rest.actions.listWorkflowRuns({
    owner, repo, workflow_id: 'revisao.yml', head_sha: head, event: 'pull_request', per_page: 20,
  });
  const run = (data.workflow_runs || []).find(r => r.status === 'completed');
  if (!run) { core.info(`Nenhuma execução concluída do check para ${head.slice(0, 7)}.`); return; }
  if (run.conclusion === 'success') { core.info('O check já está verde.'); return; }

  await github.rest.actions.reRunWorkflow({ owner, repo, run_id: run.id });
  core.info(`Check reexecutado (run ${run.id}) para ${head.slice(0, 7)}.`);
};
