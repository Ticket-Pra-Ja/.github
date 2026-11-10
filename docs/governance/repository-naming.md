# Padrão de nomenclatura de repositórios — v1.0

**Status:** aprovado para novos repositórios. A migração dos existentes segue a tabela do [catálogo](repository-catalog.md) e só acontece com janela combinada (ver [ADR-002](../decisions/ADR-002-repository-naming.md)).

## Regra

`{tipo}-{nome}`, em minúsculas e kebab-case. A organização já identifica o produto, então o nome não repete `ticketpraja`.

| Tipo | Uso | Exemplo |
| --- | --- | --- |
| `api` | APIs e serviços de backend | `api-v2` |
| `web` | Aplicações web e painéis | `web-admin` |
| `desktop` | Aplicações Windows, PDV e utilitários locais | `desktop-printer` |
| `integration` | Integrações com sistemas de terceiros | `integration-contaazul` |
| `infra` | Infraestrutura e automação operacional | `infra-backup` |
| `lib` | Bibliotecas compartilhadas | `lib-fiscal` |

Exceção: `.github` (repositório institucional).

## Metadados obrigatórios

Todo repositório deve ter:

- **Descrição** de uma linha.
- **Topics**: o tipo (`api`, `web`...), a tecnologia principal (`dotnet`, `nextjs`...) e o estado (`producao`, `legado` ou `em-desenvolvimento`).
- **README** com propósito, como executar localmente e onde é implantado (sem endereços internos ou segredos).
- **Time responsável** com acesso definido conforme a [política de acesso](access-policy.md).
