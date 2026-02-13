# Controle de Horas (PWA)

Aplicacao web para controle de ponto individual com operacao offline, persistencia local e sincronizacao opcional com Firebase Firestore.

## Funcionalidades
- Cadastro de registros com data, entrada, saida e observacao.
- Edicao e exclusao de registros.
- Filtro por mes de referencia.
- Calculo automatico de total e extras por dia e no acumulado mensal.
- Desconto de almoco aplicado na exibicao de total trabalhado.
- Geracao de relatorio PDF do mes selecionado.
- Funciona offline com Service Worker.
- Integracao opcional com Firebase (fallback para `localStorage` quando indisponivel).

## Stack
- Frontend: HTML, CSS, JavaScript puro.
- Persistencia local: `localStorage`.
- Nuvem (opcional): Firebase Firestore (SDK compat).
- PDF: `jsPDF`.
- PWA: `manifest.json` + `service-worker.js`.

## Como executar localmente
Use um servidor HTTP na raiz do projeto:

```bash
python -m http.server 8000
```

ou

```bash
npx http-server -p 8000
```

Abra `http://localhost:8000`.

## Firebase (opcional)
1. Crie o projeto e o Firestore no Firebase Console.
2. Confirme as credenciais em `firebase-config.js`.
3. Verifique no `index.html` a ordem dos scripts:
   - `firebase-app-compat.js`
   - `firebase-firestore-compat.js`
   - `firebase-config.js`
   - `firebase-integration.js`
   - `script.js`
4. Em caso de indisponibilidade do SDK/rede, o app continua usando `localStorage`.

## Regras de negocio e criterios de aceite
Documento detalhado: `REGRAS_NEGOCIO_E_CRITERIOS_ACEITE.md`.

## PWA e offline
- O Service Worker usa cache de assets essenciais.
- Para atualizar versao antiga em cache:
1. DevTools -> Application -> Service Workers -> Unregister.
2. DevTools -> Application -> Storage -> Clear site data.
3. Recarregue com `Ctrl+F5`.

## Estrutura de arquivos
- `index.html`: estrutura da UI e importacao de scripts.
- `style.css`: estilos da interface.
- `script.js`: logica de negocio principal (cadastro, calculos, filtro, PDF).
- `firebase-config.js`: bootstrap e funcoes de acesso ao Firestore.
- `firebase-integration.js`: ponte entre `localStorage` e Firebase.
- `manifest.json`: configuracao PWA.
- `service-worker.js`: estrategia de cache offline.
- `icons/`: icones do app.

## Troubleshooting rapido
- `Firebase is not defined`: validar URLs e ordem dos scripts Firebase em `index.html`.
- `GET 404` no Firebase SDK: conferir nomes corretos `*-compat.js`.
- `PERMISSION_DENIED` no Firestore: revisar regras no Firebase Console.
- PDF nao gera: garantir `jsPDF` carregado e mes selecionado.

## Historico de versoes
### v9 - Desconto de almoco
- Adicionado desconto automatico de `60` minutos para exibicao de total trabalhado.
- Mantido calculo de extras com base no total bruto (`totalMinutos - 588`).
- Atualizado resumo mensal para mostrar total com desconto e extras acumulados.
- PDF passou a detalhar total bruto, total com desconto e total de extras no mes.

### v8 - Refinamento mobile-first
- Reducao de espacamentos e ajustes de componentes para telas pequenas.
- Refinamento visual de botoes, inputs e sombras.
- Integracao de fonte Inter.

### v7 - Layout baseado em cards
- Conversao da visualizacao de registros para cards.
- Ajustes de resumo mensal e acoes para uso mobile.
- Uso de icones para editar/excluir.

### v6+ - Base PWA
- Service Worker com suporte offline.
- Persistencia com `localStorage`.
- CRUD de registros.
- Geracao de PDF.
- Responsividade mobile.
