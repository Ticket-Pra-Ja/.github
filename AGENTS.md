# Instruções para agentes de IA — Ticket pra Já

Estas regras valem para qualquer agente (Claude, ChatGPT, Cursor, Copilot ou outro) que leia ou altere repositórios da organização.

Antes de agir, consulte `docs/governance/` e as decisões vigentes em `docs/decisions/` deste repositório.

## Regras obrigatórias

1. **Escreva em português do Brasil**: documentação, commits, títulos e descrições de PRs e issues, e comentários de revisão. Exceções em [ADR-003](docs/decisions/ADR-003-idioma-padrao.md).
2. **Nunca grave segredos** (tokens, senhas, chaves, certificados, strings de conexão, CSC da NFC-e) em código, commits, PRs, issues ou logs. Use variáveis de ambiente ou o cofre do ambiente de execução.
3. **Produção exige autorização humana explícita**: deploy, migração de banco, alteração de configuração, rotação de credencial ou qualquer ação com efeito em pagamentos, reservas ou emissão fiscal.
4. **Trabalhe por pull request**, em mudanças pequenas e revisáveis, seguindo o [fluxo de desenvolvimento](docs/governance/fluxo-de-desenvolvimento.md). Não faça merge sem autorização.
5. **Áreas sensíveis** (autenticação, pagamentos, fiscal, reservas, dados pessoais e banco de dados) exigem revisão humana e descrição de riscos e rollback no PR.
6. **Não renomeie, arquive ou apague repositórios e branches** sem autorização: integrações de deploy podem depender deles.
7. **Dados pessoais de clientes** (LGPD) não devem aparecer em fixtures, exemplos, prompts ou saídas de agentes.
8. **Registre o estado real**: diferencie `planejado`, `implementado`, `testado` e `em produção`. Não afirme que algo foi validado sem evidência.
9. Em caso de conflito entre regras, **não improvise**: pergunte ao responsável e registre a decisão em um ADR.
10. **Assine o que escrever.** Agentes usam a conta de uma pessoa, e o GitHub registra tudo em nome dela. Todo comentário em issue ou PR termina com a assinatura do agente, para o histórico mostrar quem fez o quê:
    - `— Claude`
    - `— ChatGPT`
    - `— Cursor (agente de <usuário do desenvolvedor>)`

    Em commits, use o trailer `Co-Authored-By` do agente quando a ferramenta permitir. Comentários sem assinatura são tratados como escritos pela própria pessoa dona da conta.

Este arquivo é orientação. Os controles efetivos são os aplicados nas configurações do GitHub e nos pipelines.
