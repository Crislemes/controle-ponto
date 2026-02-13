# Regras de Negocio e Criterios de Aceite

Este documento descreve as regras de negocio atualmente implementadas no codigo da aplicacao, com base principal em `script.js`, `firebase-config.js` e `firebase-integration.js`.

## Regras de negocio implementadas

1. Cadastro de registro
- Cada registro possui `data`, `entrada`, `saida`, `totalMinutos`, `extrasMinutos` e `observacao`.
- Campos obrigatorios para salvar: `data`, `entrada` e `saida`.

2. Jornada padrao para extras
- Jornada de referencia fixa: `588` minutos (9h48min).
- Extras diarios: `totalMinutos - 588`.

3. Calculo de tempo
- Conversao de horario no formato `HH:MM` para minutos.
- Se `saida < entrada`, considera virada de dia (acrescenta 24h).

4. Desconto de almoco
- Desconto fixo de `60` minutos por registro para exibicao de "Total Trabalhado".
- O desconto de almoco nao altera `extrasMinutos`, que continua baseado no total bruto.

5. Filtro por mes
- A lista e os totais consideram apenas registros do `mesRelatorio` selecionado (`YYYY-MM`).
- Quando nao ha registros no mes, exibe mensagem: "Esse mes nao possui registros".

6. Persistencia local
- Registros e nome do usuario sao persistidos em `localStorage`.
- Dados antigos sem `extrasMinutos` sao migrados automaticamente na inicializacao.

7. Edicao e exclusao
- Um registro pode ser editado por indice original.
- Exclusao individual remove o item selecionado e atualiza totais.
- "Limpar registros" apaga somente os registros do mes selecionado, mediante confirmacao.

8. PDF mensal
- Gera PDF para o mes selecionado.
- Inclui dados por registro e totais do mes (bruto, com desconto de almoco e extras).
- Se `jsPDF` nao estiver disponivel, interrompe com alerta.

9. Integracao Firebase (opcional)
- Se SDK/Firebase estiver disponivel, ativa sincronizacao com Firestore.
- Se indisponivel, aplicacao permanece funcional com `localStorage`.

## Criterios de aceite implementados

1. Salvamento com validacao obrigatoria
- Dado que algum campo obrigatorio (`data`, `entrada`, `saida`) esteja vazio
- Quando o usuario clicar em salvar
- Entao o registro nao deve ser salvo e deve exibir alerta de preenchimento.

2. Calculo de virada de dia
- Dado um registro com entrada maior que saida (ex.: 22:00 -> 06:00)
- Quando salvar
- Entao o sistema deve calcular `totalMinutos` considerando +24h.

3. Extras baseados na jornada fixa
- Dado um registro valido
- Quando salvar
- Entao `extrasMinutos` deve ser `totalMinutos - 588`.

4. Desconto de almoco apenas na exibicao
- Dado um registro salvo
- Quando visualizar lista, resumo e PDF
- Entao o total trabalhado exibido deve considerar desconto de 60 minutos.
- E os extras devem permanecer calculados pelo total bruto.

5. Filtro mensal aplicado em tela e totais
- Dado que existam registros em meses diferentes
- Quando alterar `mesRelatorio`
- Entao a lista e os totais devem refletir somente o mes selecionado.

6. Mensagem de lista vazia
- Dado um mes sem registros
- Quando atualizar a tela
- Entao deve aparecer "Esse mes nao possui registros".

7. Limpeza por mes
- Dado um mes selecionado com registros
- Quando confirmar "Limpar registros"
- Entao apenas registros daquele mes devem ser removidos.

8. Fluxo de edicao
- Dado um registro existente
- Quando clicar em editar e salvar
- Entao o registro original deve ser atualizado (nao duplicado).

9. Fluxo de exclusao individual
- Dado um registro existente
- Quando clicar em excluir
- Entao o registro deve ser removido e os totais recalculados.

10. Persistencia local
- Dado que haja registros/nome salvos
- Quando recarregar a pagina
- Entao os dados devem ser restaurados de `localStorage`.

11. Geracao de PDF
- Dado um mes selecionado
- Quando clicar em "Gerar PDF"
- Entao o arquivo deve ser baixado com os registros e totais do mes.

12. Fallback operacional sem Firebase
- Dado falha de SDK/conexao Firebase
- Quando a aplicacao iniciar e salvar registros
- Entao deve continuar operando com `localStorage` sem interromper o fluxo.
