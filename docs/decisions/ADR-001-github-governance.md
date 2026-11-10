# ADR-001 — Governança do GitHub

- **Status:** Aceita
- **Data:** 2026-11-10

## Contexto

A Ticket pra Já opera pagamentos, reservas e emissão fiscal. A organização no GitHub permitia que qualquer membro alterasse qualquer repositório, não exigia 2FA e não protegia as branches principais. Havia credenciais gravadas em repositórios.

## Decisão

Adotar o mesmo padrão de governança da Ideavelo:

1. Plano GitHub Team, necessário para aplicar regras de proteção em repositórios privados.
2. Permissão base **nenhuma** e acesso por times, conforme a [política de acesso](../governance/access-policy.md).
3. 2FA obrigatório para todos os membros.
4. Proteção da branch padrão por ruleset.
5. Instruções para agentes de IA em `AGENTS.md`.

## Consequências

- Pessoas fora dos times perdem acesso aos repositórios privados; por isso os times são criados **antes** de reduzir a permissão base.
- Mudanças diretas na branch padrão deixam de ser possíveis.
- Quem acompanha só projetos pode participar como colaborador externo de um repositório público, sem ocupar licença paga.
