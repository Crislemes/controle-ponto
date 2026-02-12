let registros = JSON.parse(localStorage.getItem("registros")) || [];
let indiceEdicao = null;  // Rastrear se está editando um registro

// === Configuração de Jornada Padrão ===
const JORNADA_PADRAO = {
  entrada: "07:52",  // Entrada padrão
  saida: "17:40",    // Saída padrão
  minutos: 588       // Total: 9h 48min = 588 minutos
};

// === Função auxiliar: converter HH:MM para minutos ===
function converterParaMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// === Função auxiliar: converter minutos para horas decimais (mantida para compatibilidade) ===
function minutosPraHoras(minutos) {
  return (minutos / 60).toFixed(2);
}

// === Função auxiliar: formatar minutos em formato legível (XX min ou Xh YYmin) ===
function formatarMinutosComNome(minutos) {
  if (!Number.isFinite(minutos)) minutos = 0;
  const absoluto = Math.abs(Math.round(minutos));
  const sinal = minutos < 0 ? '-' : '';
  
  if (absoluto < 60) {
    return `${sinal}${absoluto} min`;
  }
  
  const horas = Math.floor(absoluto / 60);
  const mins = absoluto % 60;
  return `${sinal}${horas}h${mins.toString().padStart(2, '0')}min`;
}

// === Migrar registros antigos (sem campo extrasMinutos) ===
function migrarRegistrosAntigos() {
  let precisaSalvar = false;
  registros = registros.map(r => {
    if (!r.hasOwnProperty('extrasMinutos')) {
      const totalMin = converterParaMinutos(r.entrada);
      const saidaMin = converterParaMinutos(r.saida);
      let trabalhado = saidaMin - totalMin;
      if (trabalhado < 0) trabalhado += 24 * 60; // travessia de meia-noite
      const extras = trabalhado - JORNADA_PADRAO.minutos;
      r.totalMinutos = trabalhado;
      r.extrasMinutos = extras;
      precisaSalvar = true;
    }
    return r;
  });
  if (precisaSalvar) {
    localStorage.setItem('registros', JSON.stringify(registros));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  migrarRegistrosAntigos();
  const hoje = new Date();
  const dataInput = document.getElementById("data");
  dataInput.valueAsDate = hoje;

  const mesInput = document.getElementById("mesRelatorio");
  mesInput.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

  const nome = localStorage.getItem('nomeUsuario') || '';
  document.getElementById('nomeUsuario').value = nome;

  atualizarTabela();
  atualizarTotal();

  document.getElementById('btnSalvar').addEventListener('click', salvarRegistro);
  document.getElementById('btnCancelar').addEventListener('click', cancelarEdicao);
  document.getElementById('btnPDF').addEventListener('click', gerarPDF);
  document.getElementById('btnLimpar').addEventListener('click', limparRegistros);
  document.getElementById('nomeUsuario').addEventListener('change', salvarNomeUsuario);
});

function salvarNomeUsuario(e) {
  const nome = e.target.value.trim();
  localStorage.setItem('nomeUsuario', nome);
}

function salvarRegistro() {
  const data = document.getElementById("data").value;
  const entrada = document.getElementById("entrada").value;
  const saida = document.getElementById("saida").value;
  const observacao = document.getElementById("observacao").value.trim();

  if (!data || !entrada || !saida) {
    alert("Preencha Data, Entrada e Saída.");
    return;
  }

  // Calcular total em minutos
  let entradaMin = converterParaMinutos(entrada);
  let saidaMin = converterParaMinutos(saida);
  let totalMinutos = saidaMin - entradaMin;
  
  // Se saída < entrada, considera travessia de meia-noite
  if (totalMinutos < 0) totalMinutos += 24 * 60;
  
  // Calcular extras (minutos trabalhados - 588 minutos padrão)
  const extrasMinutos = totalMinutos - JORNADA_PADRAO.minutos;

  const registro = {
    data,
    entrada,
    saida,
    totalMinutos,
    extrasMinutos,
    observacao
  };

  // Se está em modo edição, atualizar registro existente
  if (indiceEdicao !== null) {
    registros[indiceEdicao] = registro;
    indiceEdicao = null;
  } else {
    // Novo registro
    registros.push(registro);
  }

  localStorage.setItem("registros", JSON.stringify(registros));

  atualizarTabela();
  atualizarTotal();
  limparFormulario();
}

function limparFormulario() {
  document.getElementById("data").valueAsDate = new Date();
  document.getElementById("entrada").value = "";
  document.getElementById("saida").value = "";
  document.getElementById("observacao").value = "";
  document.getElementById("btnSalvar").textContent = "Salvar";
  document.getElementById("btnCancelar").style.display = "none";
}

function cancelarEdicao() {
  indiceEdicao = null;
  limparFormulario();
}

function editarRegistro(idx) {
  if (idx < 0 || idx >= registros.length) return;
  
  const registro = registros[idx];
  document.getElementById("data").value = registro.data;
  document.getElementById("entrada").value = registro.entrada;
  document.getElementById("saida").value = registro.saida;
  document.getElementById("observacao").value = registro.observacao;
  
  indiceEdicao = idx;
  document.getElementById("btnSalvar").textContent = "Atualizar";
  document.getElementById("btnCancelar").style.display = "block";
  
  // Scroll para o topo do formulário
  document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

// Função auxiliar para compatibilidade (minutos em horas decimais)
function calcularHorasDecimal(totalMinutos) {
  return minutosPraHoras(totalMinutos);
}

function formatarDataISOparaBr(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

function atualizarTabela() {
  // Suporta duas estruturas: tabela antiga (`tabelaRegistros`) ou novo container (`listaRegistros`)
  const tabelaAntiga = document.getElementById("tabelaRegistros");
  const listaContainer = document.getElementById("listaRegistros");
  if (tabelaAntiga) tabelaAntiga.innerHTML = "";
  if (listaContainer) listaContainer.querySelectorAll('.registro-item').forEach(n=>n.remove());

  // Ordena por data desc
  const cop = [...registros].sort((a, b) => (a.data < b.data ? 1 : -1));

  cop.forEach((r, idx) => {
    // Encontrar índice original no array registros
    const origIndex = registros.findIndex(reg => 
      reg.data === r.data && reg.entrada === r.entrada && reg.saida === r.saida && reg.totalMinutos === r.totalMinutos
    );

    const totalFormatado = formatarMinutosComNome(r.totalMinutos);
    const extrasFormatado = formatarMinutosComNome(r.extrasMinutos);
    const extrasComSinal = r.extrasMinutos > 0 ? '+' + extrasFormatado : extrasFormatado;

    // Render em container novo (divs) se existir
    if (listaContainer) {
      const item = document.createElement('div');
      item.className = 'registro-item';
      item.innerHTML = `
        <div class="reg-header">
          <span class="reg-val">${formatarDataISOparaBr(r.data)}</span>
          <div class="reg-actions">
            <button class="action-edit" data-index="${origIndex}" title="Editar" aria-label="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"></path>
                <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"></path>
              </svg>
            </button>
            <button class="action-delete" data-index="${origIndex}" title="Excluir" aria-label="Excluir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" fill="currentColor"></path>
                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="reg-grid">
          <div><span class="reg-label">Entrada</span></div>
          <div><span class="reg-label">Saída</span></div>
          <div><span class="reg-val">${r.entrada}</span></div>
          <div><span class="reg-val">${r.saida}</span></div>
          <div><span class="reg-label">Total</span></div>
          <div><span class="reg-label">Extras</span></div>
          <div><span class="reg-val">${totalFormatado}</span></div>
          <div><span class="reg-val ${r.extrasMinutos>0?"value-positive":"value-negative"}">${extrasComSinal}</span></div>
        </div>
      `;
      listaContainer.appendChild(item);
    }

    // Render na tabela antiga se existir (compatibilidade)
    if (tabelaAntiga) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatarDataISOparaBr(r.data)}</td>
        <td>${r.entrada}</td>
        <td>${r.saida}</td>
        <td>${totalFormatado}</td>
        <td>${extrasComSinal}</td>
        <td>
          <button class="action-edit" data-index="${origIndex}" title="Editar">✏️</button>
          <button class="action-delete" data-index="${origIndex}" title="Excluir">🗑️</button>
        </td>
      `;
      tabelaAntiga.appendChild(tr);
    }
  });
}

function atualizarTotal() {
  const totalMinutos = registros.reduce((soma, r) => soma + (r.totalMinutos || 0), 0);
  const totalExtrasMinutos = registros.reduce((soma, r) => soma + (r.extrasMinutos || 0), 0);
  
  const totalFormatado = formatarMinutosComNome(totalMinutos);
  const totalExtrasFormatado = formatarMinutosComNome(totalExtrasMinutos);
  const totalExtrasComSinal = totalExtrasMinutos > 0 ? '+' + totalExtrasFormatado : totalExtrasFormatado;
  
  // Atualiza em elementos existentes (novo layout) ou no elemento legado 'totalMes'
  const elTotalHoras = document.getElementById('totalHoras');
  const elTotalExtras = document.getElementById('totalExtras');
  const elTotalMes = document.getElementById('totalMes');
  if (elTotalHoras && elTotalExtras) {
    elTotalHoras.textContent = totalFormatado;
    elTotalExtras.textContent = totalExtrasComSinal;
  } else if (elTotalMes) {
    elTotalMes.innerHTML = `
      <div class="totals-row">
        <div class="total-item">
          <span class="label">Total Trabalhado</span>
          <span class="value">${totalFormatado}</span>
        </div>
        <div class="total-item">
          <span class="label">Total de Extras</span>
          <span class="value">${totalExtrasComSinal}</span>
        </div>
      </div>
    `;
  }
}

function limparRegistros() {
  if (!confirm('Deseja apagar TODOS os registros?')) return;
  registros = [];
  localStorage.removeItem('registros');
  atualizarTabela();
  atualizarTotal();
}

function deleteRegistroAt(indexDisplayed) {
  // A tabela exibe registros ordenados; mapear para índice original
  const ordenados = [...registros].sort((a, b) => (a.data < b.data ? 1 : -1));
  const item = ordenados[indexDisplayed];
  if (!item) return;
  // encontrar posição original (primeira ocorrência)
  const origIndex = registros.findIndex(r => 
    r.data === item.data && r.entrada === item.entrada && r.saida === item.saida
  );
  if (origIndex === -1) return;
  registros.splice(origIndex, 1);
  localStorage.setItem('registros', JSON.stringify(registros));
  atualizarTabela();
  atualizarTotal();
}

function deleteRegistroPorIndiceOriginal(origIndex) {
  if (typeof origIndex !== 'number' || origIndex < 0 || origIndex >= registros.length) return;
  registros.splice(origIndex, 1);
  localStorage.setItem('registros', JSON.stringify(registros));
  atualizarTabela();
  atualizarTotal();
}

// Painel de assinatura removido — código relacionado eliminado

// Ajustar listeners de eventos delegados (delete, edit) após a lista ser atualizada
const tabelaObserver = new MutationObserver(() => {
  document.querySelectorAll('.action-delete').forEach(btn => {
    if (btn.dataset.bound) return; btn.dataset.bound = '1';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = Number(e.currentTarget.dataset.index);
      // se o índice recebido corresponde ao índice original no array, deletar por índice original
      deleteRegistroPorIndiceOriginal(idx);
    });
  });
  
  document.querySelectorAll('.action-edit').forEach(btn => {
    if (btn.dataset.bound) return; btn.dataset.bound = '1';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = Number(e.currentTarget.dataset.index);
      editarRegistro(idx);
    });
  });
});
// observar container existente (novo ou legado)
const observeTarget = document.getElementById('listaRegistros') || document.getElementById('tabelaRegistros');
if (observeTarget) tabelaObserver.observe(observeTarget, { childList: true, subtree: true });

// Nota: inicialização de assinatura já é feita no listener principal de DOMContentLoaded

function gerarPDF() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert('Biblioteca jsPDF não encontrada. Verifique a importação.');
    return;
  }

  const nome = localStorage.getItem('nomeUsuario') || document.getElementById('nomeUsuario').value || '';
  const mesRef = document.getElementById('mesRelatorio').value; // formato YYYY-MM
  if (!mesRef) {
    alert('Selecione o mês do relatório.');
    return;
  }

  const [ano, mes] = mesRef.split('-').map(Number);
  const registrosMes = registros.filter(r => {
    const d = new Date(r.data + 'T00:00:00');
    return d.getFullYear() === ano && (d.getMonth() + 1) === mes;
  });

  const totalMinutos = registrosMes.reduce((s, r) => s + (r.totalMinutos || 0), 0);
  const totalExtrasMinutos = registrosMes.reduce((s, r) => s + (r.extrasMinutos || 0), 0);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  doc.setFontSize(16);
  doc.text('Controle de Horas', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
  y += 30;

  doc.setFontSize(11);
  doc.text(`Nome: ${nome}`, margin, y);
  y += 18;
  const mesNome = new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  doc.text(`Mês de referência: ${mesNome}`, margin, y);
  y += 20;

  doc.text('Registros:', margin, y);
  y += 14;

  if (registrosMes.length === 0) {
    doc.text('Nenhum registro para este mês.', margin, y);
  } else {
    doc.setFontSize(10);
    registrosMes.forEach(r => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      const totalFormatado = formatarMinutosComNome(r.totalMinutos);
      const extrasFormatado = formatarMinutosComNome(r.extrasMinutos);
      const extrasComSinal = r.extrasMinutos > 0 ? '+' + extrasFormatado : extrasFormatado;
      const linha = `${formatarDataISOparaBr(r.data)} - ${r.entrada} às ${r.saida} — ${totalFormatado} (extras: ${extrasComSinal})${r.observacao ? ' — ' + r.observacao : ''}`;
      doc.text(linha, margin, y);
      y += 14;
    });
  }

  y += 10;
  doc.setFontSize(12);
  const totalFormatado = formatarMinutosComNome(totalMinutos);
  const totalExtrasFormatado = formatarMinutosComNome(totalExtrasMinutos);
  const totalExtrasComSinal = totalExtrasMinutos > 0 ? '+' + totalExtrasFormatado : totalExtrasFormatado;
  doc.text(`Total trabalhado no mês: ${totalFormatado}`, margin, y);
  y += 15;
  doc.text(`Total de extras no mês: ${totalExtrasComSinal}`, margin, y);

  doc.save(`Controle-de-Horas-${ano}-${String(mes).padStart(2,'0')}.pdf`);
}
