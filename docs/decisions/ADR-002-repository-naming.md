# ADR-002 — Nomenclatura de repositórios

- **Status:** Aceita
- **Data:** 2026-11-10

## Decisão

Usar `{tipo}-{nome}` em kebab-case para todos os repositórios, conforme o [padrão de nomes](../governance/repository-naming.md).

## Migração dos existentes

Renomear um repositório pode quebrar integrações de deploy (como Vercel e servidores) e scripts que usam a URL. Por isso, cada renomeação:

1. Acontece em janela combinada, um repositório por vez.
2. Confere antes quais integrações usam o repositório.
3. Atualiza as integrações e confirma o deploy logo depois.

O GitHub redireciona a URL antiga, mas esse redirecionamento não deve ser usado como solução permanente.
