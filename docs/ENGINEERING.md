# Padrões de engenharia — Ticket pra Já

Este documento define **diretrizes recomendadas** para desenvolvimento e manutenção. Regras mandatórias, tecnologias específicas e exceções devem ser confirmadas por repositório e por seus responsáveis. A existência deste documento não comprova enforcement automático em GitHub ou CI.

## 1. Tecnologias e arquitetura

Tecnologias presentes em partes do ecossistema:

| Área | Tecnologias conhecidas |
| --- | --- |
| Backend e APIs | C#, .NET / ASP.NET Core, Entity Framework Core |
| Frontend web | React, Next.js, JavaScript/TypeScript |
| Persistência | Microsoft SQL Server, SQL e stored procedures |
| Aplicações desktop/PDV | Windows Forms e .NET |
| Integrações | APIs HTTP, webhooks, serviços fiscais e pagamentos |

Não presuma que todas as aplicações utilizam a mesma versão, framework, arquitetura ou pipeline. A versão efetiva deve ser obtida dos manifests, arquivos de projeto e documentação do repositório. Novos serviços devem usar versões suportadas, avaliadas quanto a compatibilidade, segurança e ciclo de vida.

## 2. Organização de código

- Preferir módulos coesos, responsabilidades explícitas e dependências controladas.
- Separar contratos, regras de negócio, persistência e integrações quando apropriado à arquitetura existente.
- Evitar duplicação desnecessária, acoplamento entre domínios e alterações extensas sem justificativa.
- Documentar decisões arquiteturais relevantes e trade-offs.
- Respeitar convenções já estabelecidas no projeto; mudanças de padrão exigem revisão.

## 3. Convenções de desenvolvimento

- Nomes de classes, funções, variáveis e contratos devem seguir as convenções da linguagem e do repositório.
- Aplicar formatadores, linters e análise estática disponíveis no projeto.
- Não introduzir dependências sem avaliar manutenção, licença, segurança e impacto.
- Usar configuração externa para diferenças de ambiente; nunca embutir segredos.
- Preservar compatibilidade de APIs e integrações ou documentar explicitamente mudanças incompatíveis.

## 4. Dados e SQL Server

- Preferir consultas parametrizadas; proibir concatenação de entrada não confiável em SQL executável.
- Avaliar índices, planos de execução, transações, bloqueios e impacto de concorrência.
- Mudanças de schema e stored procedures devem ter revisão, estratégia de implantação e reversão compatível com o risco.
- Evitar migrations destrutivas sem avaliação de dados e plano de recuperação.
- Não executar scripts de produção em ambientes não verificados.

## 5. Segurança e privacidade

- Validar entrada e autorização no servidor; não confiar apenas no frontend.
- Aplicar princípio do menor privilégio e separar permissões por ambiente.
- Proteger tokens, chaves, dados pessoais, dados de pagamento e informações fiscais.
- Não registrar credenciais, dados sensíveis ou payloads completos desnecessários.
- Avaliar autenticação, controle de acesso, rate limiting e proteção contra abuso nos endpoints expostos.
- Seguir o processo de reporte privado em [SECURITY.md](../SECURITY.md).

## 6. Testes e qualidade

Antes da integração, executar os testes e verificações disponíveis no projeto:

1. Build, lint e análise estática aplicáveis.
2. Testes unitários para regras alteradas.
3. Testes de integração para banco, APIs, webhooks ou provedores afetados, preferencialmente com ambientes isolados.
4. Verificação de regressão e compatibilidade em fluxos críticos.
5. Revisão de riscos, logs e comportamento de falha.

Cobertura e gates numéricos só são obrigatórios quando definidos no repositório específico.

## 7. Git e pull requests

- Trabalhar em branches dedicadas, evitando commits diretos em branches protegidas.
- Preferir commits pequenos e descritivos; convenção sugerida: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Vincular a mudança à issue ou requisito quando existir.
- Explicar objetivo, escopo, testes, riscos e plano de rollback.
- Exigir revisão proporcional ao impacto, especialmente em autenticação, pagamentos, fiscal, reservas e banco de dados.
- Não fazer merge com verificações obrigatórias falhando ou com riscos críticos sem resolução.

## 8. Entrega e operação

- Segregar desenvolvimento, homologação e produção.
- Validar configuração, dependências, compatibilidade e migrations antes do deploy.
- Planejar rollback ou recuperação e monitorar os indicadores afetados após implantação.
- Para rotinas financeiras, fiscais e de reservas, considerar idempotência, retentativas seguras e rastreabilidade.
- Documentar mudanças operacionais e incidentes relevantes sem expor segredos.

## 9. Hierarquia de documentação

As políticas corporativas e controles efetivamente aprovados prevalecem sobre estas recomendações. O README, os workflows, os arquivos de configuração e as instruções operacionais do repositório de produto definem seus requisitos específicos. Conflitos devem ser resolvidos pelos responsáveis técnicos antes da implementação.
