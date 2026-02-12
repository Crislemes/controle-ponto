# Changelog - Controle de Horas

## v9 - Desconto de Almoço (Lunch Break Deduction)

### ✅ Implementações

1. **Desconto Automático de 1 Hora de Almoço**
   - Novo constant: `ALMOCO_MINUTOS = 60`
   - Nova função: `calcularTotalSemAlmoco(totalMinutos)` 
   - Retorna: Math.max(0, totalMinutos - 60)

2. **Exibição em Cards (Registros)**
   - Cada card agora mostra: Total com desconto de 1h
   - Exemplo: 8:00-18:00 = 10h bruto → exibe 9h após desconto
   - Não afeta cálculo de extras (continua baseado em totalMinutos original)

3. **Atualização de Totais Mensais (Resumo)**
   - Campo "Total Trabalhado" agora usa valores com desconto de almoço
   - "Total de Extras" continua baseado em horas brutas menos jornada padrão
   - Fórmula extras: (totalMinutos bruto - 588 min jornada padrão) por dia

4. **PDF - Detalhamento de Almoço**
   - Cada registro no PDF mostra: "Total bruto (menos almoço: total com desconto, extras: X)"
   - Rodapé adiciona novas linhas:
     - "Total bruto no mês: XXh XXmin"
     - "Total com desconto de almoço: YYh YYmin"  
     - "Total de extras no mês: +ZZh ZZmin"

### 📊 Exemplos

**Exemplo 1: Jornada Normal (7:52-17:40 = 588 min)**
- Entrada: 07:52, Saída: 17:40
- Total bruto: 9h 48min (588 min)
- Total com desconto: 8h 48min (528 min)
- Extras: 0 (pois 588 - 588 = 0)

**Exemplo 2: Hora Extra (8:00-18:00)**
- Entrada: 08:00, Saída: 18:00
- Total bruto: 10h (600 min)
- Total com desconto: 9h (540 min)
- Extras: +12min (600 - 588 = 12 min)

### 🔧 Arquivos Modificados
- `script.js`: +3 funções (constants, helpers, atualizarTotal, gerarPDF)
- `service-worker.js`: v8 → v9 (força atualização de cache)

### ✨ Características
- Desconto aplicado apenas na exibição (cards, resumo, PDF)
- Cálculo de extras não é afetado
- Previne valores negativos com `Math.max(0, ...)`
- Compatível com LocalStorage existente (sem migração necessária)
- Sem mudanças de design CSS

### 🧪 Teste Recomendado
1. Adicione registro: 8:00 - 18:00 (10 horas bruto)
2. Card deve exibir: 9h início do dia
3. Resumo deve mostrar: 9h no total trabalhado
4. Extras deve mostrar: +12min
5. PDF deve detalhar ambos os valores (bruto e com desconto)

---

## v8 - Mobile-First CSS Refinement
- Redução de padding/gaps (20px→12px)
- Border-radius otimizado (16px→12px/10px/8px)
- Alturas de botões: 52px→48px
- Alturas de inputs: 48px→44px
- Sombras mais sutis
- Google Fonts Inter integrada

## v7 - Card-Based Layout
- Conversão: table → div-based cards  
- Resumo: layout horizontal (side-by-side)
- Botões: stack vertical mobile
- SVG icons inline (edit/delete)

## v6+ - PWA Foundation
- Service Worker offline
- jsPDF integration
- LocalStorage persistence  
- Record CRUD (Create, Read, Update, Delete)
- Time calculation with extras
- Mobile responsive (360px-480px)
