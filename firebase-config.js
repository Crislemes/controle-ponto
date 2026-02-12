// ===== CONFIGURAÇÃO FIREBASE =====
// Instruções:
// 1. Substitua os valores abaixo pelos dados do seu projeto Firebase
// 2. Encontre em: Firebase Console → Configurações → Seu App → Config (SDK)

// SUBSTITUA ESTES VALORES PELAS SUAS CREDENCIAIS:
const firebaseConfig = {
  apiKey: "AIzaSyAZIGOotmkNimXpXFIvjyB4-Q467VXj_MI",
  authDomain: "controle-horas-web.firebaseapp.com",
  projectId: "controle-horas-web",
  storageBucket: "controle-horas-web.firebasestorage.app",
  messagingSenderId: "785674658627",
  appId: "1:785674658627:web:dd7ca66c60ee89b0a905f6",
  measurementId: "G-JP153B465X"
};

// Função para inicializar Firebase (chamada quando CDN estiver pronto)
function inicializarFirebase() {
  if (typeof firebase === 'undefined') {
    console.error("❌ Firebase SDK não foi carregado. Verifique os scripts.");
    return false;
  }

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase inicializado com sucesso!");
  }
  
  window.db = firebase.firestore();
  return true;
}

// Tentar inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!inicializarFirebase()) {
      console.warn("⚠️ Firebase não disponível. Usando LocalStorage apenas.");
    }
  }, 500);
});

// Fallback: tentar inicializar após 2 segundos se ainda não fez
setTimeout(() => {
  if (typeof window.db === 'undefined') {
    inicializarFirebase();
  }
}, 2000);

// ===== FUNÇÕES AUXILIARES FIREBASE =====

// Função helper para obter referência ao Firestore
function getDB() {
  return window.db || null;
}

// Salvar registros no Firestore
async function salvarRegistrosFirebase(registros) {
  const db = getDB();
  if (!db) {
    console.warn("⚠️ Firestore não disponível");
    return;
  }

  try {
    const User = "Alessandro da Silva Ferreira"; // ID do usuário (pode ser dinâmico)
    await db.collection("usuarios").doc(User).set(
      {
        registros: registros,
        ultimaAtualizacao: new Date(),
        nomeUsuario: User
      },
      { merge: true }
    );
    console.log("✅ Registros salvos no Firebase");
  } catch (error) {
    console.error("❌ Erro ao salvar no Firebase:", error);
  }
}

// Carregar registros do Firestore
async function carregarRegistrosFirebase() {
  const db = getDB();
  if (!db) {
    console.warn("⚠️ Firestore não disponível");
    return [];
  }

  try {
    const User = "Alessandro da Silva Ferreira";
    const docSnap = await db.collection("usuarios").doc(User).get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      console.log("✅ Registros carregados do Firebase");
      return data.registros || [];
    } else {
      console.log("ℹ️ Nenhum documento encontrado, retornando vazio");
      return [];
    }
  } catch (error) {
    console.error("❌ Erro ao carregar do Firebase:", error);
    return [];
  }
}

// Deletar um registro no Firestore
async function deletarRegistroFirebase(indice) {
  const db = getDB();
  if (!db) {
    console.warn("⚠️ Firestore não disponível");
    return;
  }

  try {
    const User = "Alessandro da Silva Ferreira";
    const docSnap = await db.collection("usuarios").doc(User).get();
    
    if (docSnap.exists) {
      let registros = docSnap.data().registros || [];
      registros.splice(indice, 1);
      
      await db.collection("usuarios").doc(User).set(
        { registros: registros, ultimaAtualizacao: new Date() },
        { merge: true }
      );
      console.log("✅ Registro deletado do Firebase");
    }
  } catch (error) {
    console.error("❌ Erro ao deletar do Firebase:", error);
  }
}

// Sincronizar em tempo real (listener)
function sincronizarRegistrosEmTempoReal(callback) {
  const db = getDB();
  if (!db) {
    console.warn("⚠️ Firestore não disponível para sincronização");
    return;
  }

  try {
    const User = "Alessandro da Silva Ferreira";
    db.collection("usuarios").doc(User).onSnapshot((docSnap) => {
      if (docSnap.exists) {
        const registros = docSnap.data().registros || [];
        callback(registros);
        console.log("🔄 Dados sincronizados em tempo real");
      }
    });
  } catch (error) {
    console.error("❌ Erro na sincronização em tempo real:", error);
  }
}
