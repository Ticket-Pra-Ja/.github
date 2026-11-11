@AGENTS.md

## Específico do Claude Code

- As regras acima valem integralmente. Este arquivo só existe porque o Claude Code lê o `CLAUDE.md`, e não o `AGENTS.md`, por conta própria.
- `.claude/settings.json` bloqueia merge e aprovação de PR, push nas branches protegidas e leitura de arquivos com segredos. Não tente contornar esses bloqueios; se um deles impedir o trabalho, pare e avise o desenvolvedor.
- Não rode com `--dangerously-skip-permissions` nem em modo que dispense aprovação de comandos.
- Use o `gh` (GitHub CLI) para issues e PRs. Se ele não estiver autenticado, peça ao desenvolvedor para rodar `gh auth login`.
- Assinatura dos comentários: `— Claude Code (agente de @usuario)`.
