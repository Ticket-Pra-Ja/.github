# Novo PDV (frente de caixa) — cenário fechado

Decisões do PO em 24/11/2026. Este documento é a referência das issues do novo PDV e do novo módulo local.

## Princípios

- **Nada do mecanismo atual muda.** O frente de caixa atual do admin (`/frenteDeCaixa`) e os agentes locais atuais (impressora na porta 9100, TEF na porta 8000) seguem como estão. O novo PDV e o novo módulo local são construídos à parte; quando ficarem prontos, assumem por empresa (chave no cadastro) e os atuais são desativados.
- **Novo PDV:** rota nova no admin (`/pdv`), com o mesmo login, menu e permissões.
- **Novo módulo local:** programa instalado em cada caixa (serviço Windows com ícone na bandeja), responsável por **emitir a NFC-e** (componente da TecnoSpeed, por terminal, como o fornecedor prevê), **integrar o TEF da GetCard** e **imprimir**. Começa do zero, usando o módulo antigo como referência.
- **Comunicação:** o navegador fala com o módulo em `localhost` (funciona sem internet). O módulo fala com a API para buscar dados, o certificado e devolver resultados. O módulo só aceita chamadas das origens do admin e precisa estar pareado com a empresa.
- **NFS-e:** não é emitida no caixa. O caixa imprime o **RPS** (número reservado pela API) com a orientação para baixar a nota. A NFS-e é emitida no servidor pelo módulo em **modo servidor** (máquina dedicada), com o mesmo número do RPS, e enviada ao e-mail do cliente. Nesta fase, só para empresas **aderentes ao portal nacional**.

## Venda e pagamento

- Várias formas de pagamento na mesma venda (dinheiro, PIX, crédito, débito); cartão pelo TEF GetCard no módulo.
- Cada pagamento aprovado é gravado na hora. Falha depois do pagamento nunca pede pagamento de novo.
- TEF com confirmação e desfazimento conforme o fornecedor; transação pendente fica guardada no módulo e é resolvida ao reabrir.
- Venda interrompida (navegador fechado, módulo caiu) aparece como pendente e continua de onde parou.
- E-mail do cliente obrigatório (já é hoje). CPF/CNPJ na nota informado antes de emitir.

## NFC-e (no caixa)

- Situações: pendente, autorizada, rejeitada, contingência (aguardando transmissão), cancelada, inutilizada.
- Rejeição: motivo em português e o que corrigir, com "tentar de novo". Resultado incerto: consultar antes de reenviar, para não duplicar.
- Contingência offline: sem internet, emite em contingência, imprime com o aviso e transmite sozinho quando a conexão volta.
- Cancelamento com justificativa, dentro do prazo da UF. **Fora do prazo: o caixa não cancela e orienta "procure o financeiro".**
- Reemissão: depois de cancelar e ajustar, nota nova (número novo) para a mesma venda.
- Reimpressão e envio por e-mail. Inutilização de números pulados.

## NFS-e (no servidor)

- RPS impresso na venda com: prestador, número e série do RPS, serviços, valor e a orientação "a NFS-e chegará no seu e-mail; também pode baixar em <página da TPJ>" com QR code.
- Página do portal "Baixar minha NFS-e": código da reserva + CPF, com proteção contra robô.
- A venda mostra a situação da NFS-e (pendente, emitida, erro de cadastro); reenviar e-mail e emitir de novo depois de corrigir o cadastro.

## Cancelamento da venda inteira

- Etapas: estorno no TEF → cancelamento da NFC-e → NFS-e/RPS → ingressos liberados.
- Se uma etapa falhar, a venda fica "cancelamento pendente" com a etapa que falta e continua de onde parou.
- Imprime o comprovante do estorno.

## Operação do caixa

- Painel "Vendas do caixa": vendas do turno com a situação de pagamento, NFC-e, NFS-e e impressão, e as ações por venda.
- Status do módulo no topo: conectado, impressora, TEF, certificado, contingência ativa. Sem módulo, não finaliza venda.
- Reimpressões: comprovante, ingressos, comprovante TEF (via cliente e estabelecimento), cupom NFC-e e RPS.
- **Cancelar nota, estornar e cancelar venda exigem autorização de supervisor** (login do supervisor no próprio caixa, válido só para aquela ação).
- **Fechamento de caixa: TEF pendente bloqueia; nota em contingência ou cancelamento pendente só alerta** e sai no relatório.
- Auditoria de cada ação: quem pediu, quem autorizou, quando, o quê e o resultado.

## Issues

| Parte | Issue |
|---|---|
| API: terminais e rotas do módulo | Ticket-Pra-Ja/API.TICKETPRAJA#145 |
| API: situação da venda, cancelamento em etapas, supervisor, auditoria | Ticket-Pra-Ja/API.TICKETPRAJA#146 |
| API: RPS na venda | Ticket-Pra-Ja/API.TICKETPRAJA#142 |
| API: emissão de NFS-e (componente, validação, fila) | Ticket-Pra-Ja/API.TICKETPRAJA#138, #139, #140, #141 |
| Admin: rota `/pdv` e chave por empresa | Ticket-Pra-Ja/admin.ticketpraja#97 |
| Admin: pareamento e status do módulo | Ticket-Pra-Ja/admin.ticketpraja#98 |
| Admin: finalização com retomada | Ticket-Pra-Ja/admin.ticketpraja#99 |
| Admin: painel de vendas do caixa | Ticket-Pra-Ja/admin.ticketpraja#100 |
| Admin: cancelar/reemitir NFC-e e cancelar venda | Ticket-Pra-Ja/admin.ticketpraja#101 |
| Admin: fechamento com pendências | Ticket-Pra-Ja/admin.ticketpraja#102 |
| Portal: baixar NFS-e | Ticket-Pra-Ja/portal.ticketpraja#82 |
| Módulo local (base, impressão, TEF GetCard, NFC-e, modo servidor) | a criar no repositório do módulo |
