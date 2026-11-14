# Como escrever uma issue (com ajuda da IA)

Toda demanda da Ticket Pra Já nasce como issue, e o PO (Rafael) escreve as issues com ajuda de uma IA (Claude, Cursor ou outra). Este guia é a instrução para essa IA: siga-o sempre que for criar ou revisar uma issue.

A issue é o único insumo do agente que vai implementar. Se faltar algo nela, o agente inventa ou para. Por isso a IA que escreve a issue faz a análise antes, e não o desenvolvedor depois.

## Passo a passo para a IA

1. **Entenda o pedido.** Identifique o problema real, quem é afetado e o que deve ser possível depois da entrega. Se faltar informação que só o PO tem, pergunte antes de escrever (no máximo 3 perguntas, objetivas).
2. **Analise o código do repositório certo.** Localize as telas, rotas, endpoints e arquivos envolvidos. Confira o que já existe, inclusive commits recentes na `development` e branches abertas: muitas vezes parte da solução já foi começada. Cite caminhos de arquivo reais, não suposições.
3. **Descubra as dependências.** A mudança exige algo em outro sistema (API.TICKETPRAJA, api.v2, admin, banco)? Se sim, a parte do outro sistema vira **outra issue, no repositório dele**, e esta fica marcada como **bloqueada por** ela (Relationships → Blocked by). Em produção, o back-end sobe antes do front.
4. **Proponha o caminho.** Quando houver mais de uma forma de fazer, apresente as opções com prós, contras e a sua recomendação. A escolha é do PO.
5. **Escreva a issue no formato abaixo** e mostre ao PO antes de criar.
6. **Crie só depois do "ok" do PO**, no repositório onde o código vai mudar, com `gh issue create`. Atribua ao desenvolvedor que o PO indicar. O card vai para **Pronto** quando o PO decidir que pode ser puxada.

## Critérios de aceite viram testes

Cada critério de aceite vira um teste automatizado escrito pelo agente que implementa (regra do `AGENTS.md`). Por isso:

- Escreva cada critério no formato **Dado / quando / então**, com valores concretos: "Dado um domínio com fim de vigência ontem, quando consulto `CodigoExigido`, então a resposta é `true`".
- Um comportamento por critério. Inclua os casos de erro, cada um com a resposta esperada.
- Evite critérios que só um humano avalia ("ficar bonito", "ficar rápido"). Se for inevitável, diga como medir.
- Marque com **(manual)** o critério que depende de equipamento ou serviço externo sem modo de teste (maquininha, impressora, e-mail real). Esse fica na homologação do PO.

## Formato

```markdown
## Contexto
Problema de hoje, quem é afetado e o impacto (com o incidente, se houver: data, o que aconteceu).

## Objetivo
O que deve ser possível depois da entrega, em uma ou duas frases.

## Solução proposta
Caminho escolhido pelo PO, com os pontos do código envolvidos (arquivos, rotas, endpoints).
O que já existe e deve ser reaproveitado.

## Fora do escopo
O que não deve ser feito nesta tarefa.

## Critérios de aceite
- [ ] Dado ..., quando ..., então ...   (um por linha, com valores concretos; vira teste automatizado)
- [ ] Casos de erro e o comportamento esperado em cada um
- [ ] (manual) Critério que depende de equipamento ou serviço externo

## Como testar no sandbox
O que o PO confere à mão em sandbox.ticketpraja.com.br (ou no ambiente do sistema): os critérios marcados como (manual) e o que for visual.

## Dependências
Nenhuma | Bloqueada por OUTRO-REPO#N (a API sobe em produção antes deste front).

## Configuração
Variáveis de ambiente, chaves ou cadastros novos: só os NOMES, onde ficam e quem cadastra. Nunca valores.

## Riscos e área sensível
Pagamento, autenticação, emissão fiscal, LGPD ou banco de produção? O que pode dar errado e como desfazer.

## Tamanho
P (até meio dia) | M (até 2 dias) | G (mais que isso: quebre em issues menores).
```

## Checklist antes de criar

- [ ] Uma issue = uma entrega testável. Se tiver "e também", provavelmente são duas.
- [ ] Critérios de aceite no formato Dado / quando / então, com valores concretos, verificáveis por quem não leu o código.
- [ ] Critérios que não dá para automatizar marcados como (manual).
- [ ] Dependência de outro sistema registrada como issue própria + "Blocked by".
- [ ] Área sensível sinalizada (o PR vai exigir revisão atenta).
- [ ] Nenhum segredo, senha, token ou dado pessoal no texto.
- [ ] Título no infinitivo, dizendo o resultado: "Permitir desligar o código de acesso sem novo deploy".
