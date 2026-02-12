# Controle de Horas — Instruções de teste e instalação (PWA)

Breve guia para testar, instalar e verificar funcionamento offline do PWA "Controle de Horas".

## Funcionalidades Principais

- Registra data, hora de entrada e hora de saída
- Calcula automaticamente total de horas trabalhadas e horas extras
- **Jornada padrão fixa**: 07:52 – 17:40 (588 minutos/9h48m)
- Exibe total mensal trabalhado e total mensal de extras
- Gera relatório em PDF
- Funciona totalmente offline com Service Worker
- PWA instalável no Android como aplicativo nativo
- **Design moderno e responsivo** com interface profissional

## Requisitos
- Navegador moderno (Chrome/Edge) no desktop ou Android
- Python 3 (opcional) ou Node.js (opcional) para servir localmente

## Design Visual

A aplicação utiliza um design system moderno com foco em **mobile-first**:
- **Otimizada para celular**: 100% fluida em telas 360px–480px (foco principal)
- **Paleta de cores profissional**: azul primário (#1E63B5), verde sucesso (#2E7D4F), vermelho erro (#D32F2F)
- **Tipografia Clara**: Inter sans-serif em múltiplos pesos e tamanhos
- **Grid de 8px**: espaçamentos consistentes em toda a interface
- **Cards compactos**: layout empilhado verticalmente para touch
- **Touch-friendly**: botões com ≥52px de altura, áreas de toque ≥44px
- **Layout fluido**: nenhum horizontal scroll, 100% responsivo
- **Sem paisagem**: otimizado para modo retrato exclusivamente
- **Buttons empilhadas**: todas as ações organizadas em coluna única

## Rodar localmente (recomendado para desenvolvimento)
Abra o terminal na pasta do projeto (`controle-horas/`) e execute um dos comandos:

Python 3 (porta 8000):
```bash
python -m http.server 8000
```
ou (Windows/py):
```bash
py -3 -m http.server 8000
```

Com Node (sem instalar globalmente):
```bash
npx http-server -p 8000
```

Depois abra no navegador:

http://localhost:8000

## Por que usar um servidor local?
- Service Worker só funciona em contexto seguro (HTTPS) ou `localhost` — abrir `index.html` via `file://` não registra o SW.

## Instalar no Android
1. Acesse o site pelo Chrome em seu Android (use o servidor local ou hospede em HTTPS). 
2. Se o manifest e o service worker estiverem corretos, o Chrome mostrará o botão "Instalar" ou "Adicionar à tela inicial".
3. Siga as instruções do Chrome — o app abrirá em modo standalone (sem barra do navegador).

## Testar funcionamento offline
1. Abra o app (preferencialmente após instalá-lo).
2. Preencha `Nome`, selecione o mês, adicione alguns registros e gere o PDF para confirmar a função.
3. Desconecte a internet (modo avião) e recarregue o app instalado; a UI e os dados salvos em `localStorage` devem permanecer disponíveis.

Observação: o primeiro carregamento e registro do Service Worker precisam de conexão para baixar os assets em cache.

## Gerar PDF
- Preencha `Nome` e `Mês do relatório`, adicione registros para o mês, e clique em "Gerar PDF". O arquivo será baixado pelo navegador (usa `jsPDF`).
- O PDF inclui data, entrada/saída, total trabalhado e saldo de horas extras para cada dia.

## Cálculo de Horas Extras
- **Jornada padrão**: 07:52 – 17:40 = 9h48m (588 minutos)
- O cálculo é feito **internamente no código** — os horários padrão não aparecem na interface
- Registre seus horários reais (entrada e saída)
- A aplicação calcula automaticamente:
  - Total de minutos trabalhados
  - Saldo de extras (minutos trabalhados - 588 minutos)
- Saldo positivo = você trabalhou mais (extras)
- Saldo negativo = você trabalhou menos (déficit)

### Formato de Exibição
- Tempos **menores que 1 hora** são exibidos em minutos: `45 min`, `30 min`
- Tempos **maiores ou iguais a 1 hora** são exibidos em horas e minutos: `1h20min`, `2h05min`
- Valores negativos incluem o sinal: `-30 min`, `-2h10min`, `+45 min`
- A coluna "Extras" na tabela exibe o saldo diário; o resumo mensal mostra o total de extras acumulado

<!-- Seção de assinatura removida -->

## Limpar registros
- Há um botão "Limpar registros" que apaga todos os dados locais. Também é possível limpar via DevTools → Application → Local Storage.

### Atualizar cache do Service Worker (v6)
Se após a atualização do código a aplicação mostrar a versão antiga em cache:
1. Abra DevTools (F12)
2. Vá em "Application" → "Service Workers"
3. Clique em "Unregister"
4. Vá em "Application" → "Storage" → "Clear site data"
5. Recarregue a página (Ctrl+F5 ou Cmd+Shift+R)

O novo cache (`controle-horas-v6`) será registrado automaticamente.

## Hospedar (opção gratuita)
- GitHub Pages serve via HTTPS (funciona com Service Worker). Basta publicar o repositório e acessar `https://<seu-usuario>.github.io/<repo>/`.
- Garanta que os caminhos no `manifest.json` e `service-worker.js` são relativos (`./`, `index.html`, etc.).

## Arquivos principais
- `index.html` — UI e inclusão de `jsPDF` + `script.js`.
- `style.css` — estilos responsivos para celular.
- `script.js` — lógica do app (LocalStorage, cálculo, geração de PDF).
- `manifest.json` — configurações do PWA.
- `service-worker.js` — cache-first para assets essenciais.
- `icons/` — ícones 192x192 e 512x512.

## Problemas comuns & solução rápida
- Service Worker não registrado: verifique se está em `https` ou `localhost`. Veja logs no Console.
- Recursos 404: abra Network no DevTools e observe caminhos; verifique se os arquivos existem com os mesmos nomes.
- PDF não gera: confirme se `jsPDF` foi carregado (Console) e que escolheu mês com registros.

### Forçar atualização do Service Worker / limpar cache antigo
Se você ainda estiver vendo a versão anterior é possível que o Service Worker esteja servindo uma versão em cache. Para forçar atualização:

1. Abra DevTools (F12) → Application → Service Workers. Clique em "Unregister" para remover o service worker atual.
2. Limpe o cache: Application → Clear storage → marque tudo e clique em "Clear site data".
3. Recarregue a página (`Ctrl+F5`) para garantir que os arquivos atuais sejam carregados.

Alternativamente, após publicar alterações, atualizar o `service-worker.js` (alterei a versão do cache para `controle-horas-v5`) força o navegador a baixar a nova versão.

## Observações finais
- A aplicação foi projetada para uso totalmente local e offline, sem backend.
- Se quiser, posso ajudar a publicar no GitHub Pages ou ajustar o layout para maior semelhança com apps nativos.

---
Feito: documentação de testes, instalação e observações.
