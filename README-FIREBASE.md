# 🔥 Integração Firebase - Controle de Horas

## 📋 O que foi feito?

O projeto agora suporta **Firebase Firestore** para armazenar dados na nuvem. Os dados anteriores continuam funcionando com LocalStorage como fallback.

---

## 🚀 PASSO-A-PASSO: Configurar Firebase

### 1️⃣ Criar Projeto Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique **"Adicionar projeto"**
3. Nome: `controle-ponto` (ou outro nome)
4. Desabilite "Google Analytics" (opcional)
5. Clique **"Criar projeto"** (leva 1-2 minutos)

---

### 2️⃣ Ativar Firestore Database

1. No Firebase Console, clique **"Cloud Firestore"** (parte esquerda)
2. Clique **"Criar banco de dados"**
3. Escolha modo: **Teste** (para desenvolvimento)
4. Aceite as regras padrão (você pode editar depois)
5. Localização: **South America (São Paulo)** ou mais próxima
6. Clique **"Criar"** e aguarde a ativação

---

### 3️⃣ Obter Credenciais Firebase

1. Clique **⚙️ (engrenagem)** → **Configurações do Projeto**
2. Vá para a aba **"Seus aplicativos"**
3. Clique **"Adicionar app"** → selecione **Web** (ícone `</>`))
4. Nome: `controle-horas-web`
5. Clique **"Registrar app"**
6. Na próxima tela, você verá algo como:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

7. **COPIE ESTE CÓDIGO INTEIRO**

---

### 4️⃣ Colar Credenciais no Projeto

1. Abra o arquivo `firebase-config.js` no seu editor
2. Procure por:
   ```javascript
   const firebaseConfig = {
     apiKey: "COLE_SUA_API_KEY_AQUI",
     ...
   };
   ```
3. **Substitua TODO** o bloco `firebaseConfig` pelas credenciais copiadas
4. **Salve o arquivo**

---

### 5️⃣ Testar a Integração

1. Abra seu navegador em `http://localhost:8000`
2. Adicione um novo registro de tempo
3. Abra o **Console do Navegador** (F12 → aba "Console")
4. Você deve ver mensagens como:
   ```
   ✅ Registros salvos no Firebase
   ✅ Registros carregados do Firebase
   ```
5. Acesse https://console.firebase.google.com/ → Cloud Firestore
6. Você deve ver uma coleção `usuarios` com seus dados!

---

## 🔐 Segurança - Regras Firestore

### ⚠️ Modo Teste (Desenvolvimento)
```javascript
allow read, write: if request.auth == null;
```
- ✅ Qualquer pessoa pode ler/escrever
- ⚠️ Não é seguro para produção

### ✅ Modo Produção (Recomendado)
Vá em **Firestore** → **Regras** e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🔄 Como Funciona a Sincronização

### Fluxo de Dados:
```
Usuário adiciona registro
        ↓
Script.js salva em localStorage (local)
        ↓
Firebase-config.js envia para Cloud Firestore (nuvem)
        ↓
Dados aparecem no Console Firebase
```

### Fallback (Se Firebase cair):
- App continua funcionando com **LocalStorage**
- Quando Firebase voltar, sincroniza automaticamente

---

## 📂 Estrutura de Dados no Firestore

```
Collection: "usuarios"
  Document: "Alessandro da Silva Ferreira"
    {
      registros: [
        {
          data: "2026-02-12",
          entrada: "08:00",
          saida: "17:40",
          totalMinutos: 580,
          extrasMinutos: -8,
          observacao: ""
        },
        ...
      ],
      ultimaAtualizacao: 2026-02-12T15:30:00Z,
      nomeUsuario: "Alessandro da Silva Ferreira"
    }
```

---

## ❌ Resolver Problemas

### ❌ "Firebase is not defined"
- ✅ Verifique se os scripts estão em `index.html` na ordem certa
- ✅ Certifique-se que `firebase-config.js` está no mesmo diretório

### ❌ "Erro: PERMISSION_DENIED"
- ✅ Checa as**Regras Firestore** (aba "Regras" no Console Firebase)
- ✅ Confirme que está em modo **Teste**

### ❌ "projectId undefined"
- ✅ Você não adicionou as credenciais em `firebase-config.js`
- ✅ Repita passo 4️⃣ acima

### ❌ Dados não aparecem no Console Firebase
- ✅ Abra Console do Navegador (F12) e veja mensagens de erro
- ✅ Confirme que o Firestore está ativado
- ✅ Tente adicionar um novo registro

---

## 🎯 Próximos Passos (Opcional)

1. **Autenticação**: Adicionar login com Google/Email
2. **Múltiplos Usuários**: Cada usuário tem seus próprios dados
3. **Backup**: Exportar dados do Firestore como JSON
4. **Offline**: Usar Firebase Offline Persistence

---

## 📚 Recursos Úteis

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase SDK Setup](https://firebase.google.com/docs/web/setup)

---

## ✅ Checklist de Configuração

- [ ] Criei projeto no Firebase Console
- [ ] Criei Firestore Database
- [ ] Copiei as credenciais Firebase
- [ ] Colei as credenciais em `firebase-config.js`
- [ ] Testei adicionando um registro
- [ ] Vi os dados no Console Firebase
- [ ] Configurei regras de segurança

