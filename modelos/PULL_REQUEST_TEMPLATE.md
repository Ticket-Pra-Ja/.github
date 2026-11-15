<!--
Título do PR: tipo(escopo opcional): descrição em português
Exemplos: "feat(checkout): permite cupom por lote" · "fix: corrige arredondamento do NFC-e"
Branch:   tipo/NUMERO-descricao-curta   (ex.: feat/123-cupom-por-lote)
-->

Closes #

## O que muda

<!-- 1 a 3 frases, em linguagem de negócio. -->

## Testes automatizados

<!-- Um item por critério de aceite da issue: o teste que o cobre, ou por que não dá para automatizar. -->

| Critério de aceite | Teste |
|---|---|
|  |  |

## Como testar em homologação

<!-- Só o que não está coberto pelos testes automatizados. -->

1.

## Checklist

- [ ] Todos os critérios de aceite da issue estão atendidos
- [ ] Cada critério de aceite tem teste automatizado (ou justificativa na tabela acima)
- [ ] Revisei todo o código gerado pela IA antes de commitar
- [ ] Nenhum segredo, senha, token ou dado pessoal no diff
- [ ] Migração de banco? Se sim, descrevi como reverter
- [ ] Toca em área sensível (pagamento, fiscal, autenticação, LGPD)? Se sim, sinalizei para revisão

<!-- Em development, o autor mescla com a validação verde. Em produção (release e hotfix), só o Rafael mescla. -->
