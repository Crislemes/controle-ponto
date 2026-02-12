// ===== INTEGRAÇÃO FIREBASE COM O SCRIPT.JS =====
// Este arquivo adapta o script.js para usar Firebase
// Carregado APÓS firebase-config.js e ANTES de script.js

let useFirebase = false;

// Verificar se Firebase está disponível
function verificarFirebase() {
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    useFirebase = true;
    console.log("✅ Firebase conectado com sucesso!");
    return true;
  }
  return false;
}

// Verificar quando página carrega
window.addEventListener('load', () => {
  setTimeout(() => {
    verificarFirebase();
  }, 1000);
});

// Sobrescrever localStorage.getItem para ler do Firebase
const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
  if (useFirebase && key === 'registros') {
    console.log("🔄 Carregando registros do Firebase...");
    // Retorna do localStorage como fallback (sincronização em tempo real faz o resto)
    return originalGetItem.call(this, key);
  }
  return originalGetItem.call(this, key);
};

// Sobrescrever localStorage.setItem para salvar no Firebase
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  // Sempre salva em localStorage
  originalSetItem.call(this, key, value);
  
  // Se Firebase está ativo e é registros, salva também lá
  if (useFirebase && key === 'registros') {
    try {
      const registros = JSON.parse(value);
      salvarRegistrosFirebase(registros).catch(err => {
        console.error("❌ Erro ao sincronizar com Firebase:", err.message);
      });
    } catch (e) {
      console.error("Erro ao parsear registros:", e);
    }
  }
};

// Carregadores iniciais do Firebase
async function carregarDadosFirebase() {
  if (!useFirebase) return;
  
  try {
    const registros = await carregarRegistrosFirebase();
    if (registros && registros.length > 0) {
      localStorage.setItem('registros', JSON.stringify(registros));
      console.log("✅ Dados carregados do Firebase para LocalStorage");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar do Firebase:", error);
  }
}

// Executar carregamento quando DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(carregarDadosFirebase, 500);
});

// Sincronização em tempo real (opcional)
async function iniciarSincronizacaoTempoReal() {
  if (!useFirebase) return;
  
  try {
    sincronizarRegistrosEmTempoReal((registrosNuvem) => {
      const registrosLocal = JSON.parse(localStorage.getItem('registros')) || [];
      
      // Sincronizar apenas se houver mudanças
      if (JSON.stringify(registrosLocal) !== JSON.stringify(registrosNuvem)) {
        localStorage.setItem('registros', JSON.stringify(registrosNuvem));
        // Atualizar UI
        if (typeof atualizarTabela === 'function') {
          atualizarTabela();
          atualizarTotal();
        }
        console.log("🔄 UI atualizada com dados do Firebase");
      }
    });
  } catch (error) {
    console.error("❌ Erro na sincronização em tempo real:", error);
  }
}

// Iniciar sincronização após 2 segundos (script.js já iniciado)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(iniciarSincronizacaoTempoReal, 2000);
});
