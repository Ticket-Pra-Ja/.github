# Guia de contribuição

Obrigado pelo interesse no ecossistema Ticket pra Já.

## Escopo e acesso

A maioria das contribuições aos produtos depende de autorização e acesso aos repositórios privados. Não compartilhe código, dados ou documentos internos em issues ou pull requests públicos.

## Idioma

Escreva documentação, commits, pull requests, issues e revisões em **português do Brasil**. Prefixos de commit (`feat:`, `fix:`...) e nomes de código seguem as exceções da [ADR-003](docs/decisions/ADR-003-idioma-padrao.md).

## Fluxo recomendado

1. Identifique a issue, solicitação ou objetivo da mudança.
2. Consulte o README e as regras específicas do repositório.
3. Crie uma branch dedicada a partir da base indicada pelo projeto.
4. Implemente uma mudança focada, com testes e documentação quando aplicável.
5. Abra um pull request usando o template e descreva riscos, validação e rollback.
6. Aguarde revisão e os checks exigidos pelo projeto antes do merge.

## Critérios de revisão

- Correção funcional e impacto em regressões.
- Segurança, privacidade e tratamento de erros.
- Compatibilidade de contratos, banco e integrações.
- Desempenho e concorrência em caminhos críticos.
- Clareza, manutenção, testes e observabilidade.

Consulte [Padrões de engenharia](docs/ENGINEERING.md).

## Conduta

Mantenha comunicação profissional, respeitosa e baseada em evidências. Discordâncias técnicas devem registrar critérios e trade-offs.

## Vulnerabilidades

Não publique detalhes de falhas exploráveis. Siga [SECURITY.md](SECURITY.md).

## Licenciamento

Não presuma licença open source. Cada repositório tem suas próprias condições de acesso e uso.
