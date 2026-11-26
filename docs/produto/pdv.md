# Novo PDV (frente de caixa) — cenário fechado

Decisões do PO em 24/11/2026. Este documento é a referência das issues do novo PDV e do novo módulo local.

## Princípios

- **Nada do mecanismo atual muda.** O frente de caixa atual do admin (`/frenteDeCaixa`) e os agentes locais atuais (impressora na porta 9100, TEF na porta 8000) seguem como estão. O novo PDV e o novo módulo local são construídos à parte; quando ficarem prontos, assumem por empresa (chave no cadastro) e os atuais são desativados.
- **Novo PDV:** rota nova no admin (`/pdv`), com o mesmo login, menu e permissões.
- **Novo módulo local** (`agent.ticketpraja`): programa instalado em cada caixa (serviço Windows com ícone na bandeja), responsável por **emitir a NFC-e e a NFS-e Nacional** (componentes da TecnoSpeed, por terminal, como o fornecedor prevê), **integrar o TEF da GetCard** e **imprimir**. Começa do zero, usando o módulo antigo como referência.
- **Comunicação:** o navegador fala com o módulo em `localhost` (funciona sem internet). O módulo fala com a API para buscar dados, o certificado e devolver resultados. O módulo só aceita chamadas das origens do admin e precisa estar pareado com a empresa.
- **NFS-e:** a emissão no Sistema Nacional é **síncrona** (a resposta já traz a nota), então o módulo do caixa **emite a NFS-e na hora da venda**, como a NFC-e. O número da DPS é reservado pela API. Se o portal nacional falhar ou não responder no tempo-limite (o manual não prevê contingência), o caixa imprime o **RPS** com a orientação para baixar a nota e o módulo em **modo servidor** (máquina dedicada) emite depois com o mesmo número. Venda online e assinatura também saem pelo modo servidor. Nesta fase, só para empresas **aderentes ao portal nacional**.

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

## NFS-e (no caixa, com plano B no servidor)

- Venda com serviço: o módulo emite a NFS-e na hora e imprime o resumo com número, chave e QR de consulta; a nota vai por e-mail.
- Plano B: portal nacional fora ou sem resposta → RPS impresso com prestador, número e série, serviços, valor e a orientação "a NFS-e chegará no seu e-mail; também pode baixar em <página da TPJ>" com QR code. A fila emite depois com o mesmo número.
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

## Responsabilidades

- **Wagner:** rotinas de emissão da NFS-e pelo portal nacional nas empresas aderentes e os testes que garantem que está tudo certo.
- **PO, executado pelo Claude:** toda a infraestrutura (credenciais, módulo local, base de gravação das notas, filas, rotas, novo PDV e compatibilidade com o atual).

## Issues

| Parte | Issue |
|---|---|
| API: terminais e rotas do módulo | Ticket-Pra-Ja/API.TICKETPRAJA#145 |
| API: situação da venda, cancelamento em etapas, supervisor, auditoria | Ticket-Pra-Ja/API.TICKETPRAJA#146 |
| API: base única de gravação das notas | Ticket-Pra-Ja/API.TICKETPRAJA#147 |
| API: reserva da DPS na venda e RPS de plano B | Ticket-Pra-Ja/API.TICKETPRAJA#142 |
| API: infraestrutura da NFS-e (credenciais, componente, fila) | Ticket-Pra-Ja/API.TICKETPRAJA#138, #139, #141 |
| API: emissão e testes da NFS-e nas aderentes (Wagner) | Ticket-Pra-Ja/API.TICKETPRAJA#140, #148 |
| Admin: rota `/pdv` e chave por empresa | Ticket-Pra-Ja/admin.ticketpraja#97 |
| Admin: pareamento e status do módulo | Ticket-Pra-Ja/admin.ticketpraja#98 |
| Admin: finalização com retomada | Ticket-Pra-Ja/admin.ticketpraja#99 |
| Admin: painel de vendas do caixa | Ticket-Pra-Ja/admin.ticketpraja#100 |
| Admin: cancelar/reemitir NFC-e e cancelar venda | Ticket-Pra-Ja/admin.ticketpraja#101 |
| Admin: fechamento com pendências | Ticket-Pra-Ja/admin.ticketpraja#102 |
| Portal: baixar NFS-e | Ticket-Pra-Ja/portal.ticketpraja#82 |
| Módulo local: padrão do repositório, base, impressão, TEF GetCard, NFC-e, NFS-e, modo servidor | Ticket-Pra-Ja/agent.ticketpraja#1 a #7 |
