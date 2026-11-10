# Política de acesso ao GitHub — v1.0

## Princípios

- **Menor privilégio:** cada pessoa recebe só o acesso que o papel exige.
- **Acesso por time, nunca individual:** permissões são dadas a times; pessoas entram e saem dos times.
- **Permissão base da organização: nenhuma.** Sem time, sem acesso a repositórios privados.
- **2FA obrigatório**, apenas com métodos seguros (app autenticador, passkey ou chave de segurança).

## Papéis e times

| Papel | Time | Acesso |
| --- | --- | --- |
| Product Owner | `produto` | Owner da organização e Admin nos repositórios |
| Desenvolvimento | `desenvolvimento` | Write nos repositórios de produto |
| Projetos | — | Acompanha os GitHub Projects; sem acesso a código |
| Agentes de IA | — | Via GitHub App, limitado aos repositórios autorizados |

- A organização deve ter **pelo menos dois owners**, sendo o segundo uma pessoa de confiança ou conta de contingência guardada em cofre.
- Acesso de Admin a repositórios é exceção, registrada em ADR.

## Ciclo de vida

- **Entrada:** o PO adiciona a pessoa ao time do papel. Ninguém recebe acesso direto a repositório.
- **Saída:** no mesmo dia, remover da organização, revogar tokens e chaves associados e revisar apps e integrações instalados por ela.
- **Revisão trimestral:** o PO confere membros, times, apps instalados e acessos de terceiros.

## Branch padrão

Em todos os repositórios ativos: pull request obrigatório, ao menos uma aprovação de outra pessoa, verificações automáticas aprovadas quando existirem, e bloqueio de force push e de exclusão.
