// Card "de software": issue com PR mesclado na development do próprio repositório que a cite com
// palavra de fechamento ("Closes #N", "Fixes #N"...). Cards sem PR (documentos, avisos, cobranças,
// tarefas administrativas) não travam nem entram na release.
// Usado por portao-release.js, sincroniza-board.js (release) e janela-deploy.js.
const RE_FECHAMENTO = (numero) => new RegExp(`\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#${numero}\\b`, 'i');

module.exports = async function cardComCodigo(github, owner, repo, numero) {
  let cursor = null;
  do {
    const r = await github.graphql(`
      query($owner: String!, $repo: String!, $numero: Int!, $after: String) {
        repository(owner: $owner, name: $repo) {
          issue(number: $numero) {
            timelineItems(first: 100, after: $after, itemTypes: [CROSS_REFERENCED_EVENT]) {
              pageInfo { hasNextPage endCursor }
              nodes {
                ... on CrossReferencedEvent {
                  source {
                    ... on PullRequest { merged baseRefName body repository { nameWithOwner } }
                  }
                }
              }
            }
          }
        }
      }`, { owner, repo, numero, after: cursor });
    const linha = r.repository?.issue?.timelineItems;
    if (!linha) return false;
    for (const n of linha.nodes) {
      const pr = n?.source;
      if (pr && pr.merged && pr.baseRefName === 'development'
          && pr.repository?.nameWithOwner?.toLowerCase() === `${owner}/${repo}`.toLowerCase()
          && RE_FECHAMENTO(numero).test(pr.body || '')) {
        return true;
      }
    }
    cursor = linha.pageInfo.hasNextPage ? linha.pageInfo.endCursor : null;
  } while (cursor);
  return false;
};
