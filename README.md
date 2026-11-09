# Ticket pra Já | Engineering Hub

Repositório institucional de **padrões de engenharia e colaboração** da organização [Ticket pra Já](https://github.com/Ticket-Pra-Ja).

> Este repositório é público. Não publique credenciais, diagramas internos, endpoints privados, dados de clientes ou configurações sensíveis.

## Organização

| Documento | Finalidade |
| --- | --- |
| [Perfil institucional](profile/README.md) | Apresentação pública da organização |
| [Padrões de engenharia](docs/ENGINEERING.md) | Arquitetura, tecnologias e práticas recomendadas |
| [Contribuição](CONTRIBUTING.md) | Fluxo de mudanças, revisão e qualidade |
| [Segurança](SECURITY.md) | Comunicação responsável de vulnerabilidades |
| [Template de pull request](.github/PULL_REQUEST_TEMPLATE.md) | Checklist de revisão para mudanças |

## Plataforma e tecnologias

O ecossistema Ticket pra Já contempla aplicações web, APIs, componentes de PDV e integrações de negócios.

**Tecnologias utilizadas em partes da plataforma:** C#/.NET, ASP.NET Core, Entity Framework Core, SQL Server, React, Next.js, TypeScript/JavaScript e aplicações Windows Forms. Há integrações com meios de pagamento e serviços fiscais.

As tecnologias e versões **variam conforme o repositório**. A fonte de verdade para build, dependências, execução e deploy é sempre a documentação e a configuração de cada projeto. Este documento não determina migração de versões nem publica detalhes de infraestrutura.

## Princípios de engenharia

- **Segurança por padrão:** menor privilégio, gestão de segredos e validação de entradas.
- **Mudanças rastreáveis:** issues, pull requests e histórico de decisões.
- **Qualidade verificável:** testes e verificações proporcionais ao risco.
- **Compatibilidade:** contratos de API e mudanças de banco avaliados antes do deploy.
- **Observabilidade:** logs estruturados, correlação e métricas sem exposição de dados sensíveis.
- **Operação responsável:** deploy controlado e plano de reversão quando aplicável.

Consulte os [padrões de engenharia](docs/ENGINEERING.md) para orientações detalhadas.

## Uso e colaboração

Os repositórios de produto podem ser privados. A publicação deste repositório **não concede acesso** a código, documentação interna ou ambientes da plataforma.

Antes de contribuir, leia [CONTRIBUTING.md](CONTRIBUTING.md). Para reportar uma vulnerabilidade, siga [SECURITY.md](SECURITY.md) e não abra issues públicas com detalhes exploráveis.

## Contato

- Site: https://ticketpraja.com.br
- E-mail: contato@ticketpraja.com.br

© Ticket pra Já. Todos os direitos reservados.
