# 📋 CHECKLIST DO QUE ESTÁ FALTANDO

## 🔴 CRÍTICO - Funcionalidades Core

### 1. Validação de Whatsapp
- ❌ Sem máscara de entrada (81 99999-9999)
- ❌ Sem validação se número é válido
- ❌ Sem detecção de país

**Solução:** Adicionar biblioteca `libphonenumber-js`

```javascript
import { parsePhoneNumber } from 'libphonenumber-js';
const numero = parsePhoneNumber(whatsapp, 'BR');
if (!numero?.isValid()) alert("Whatsapp inválido!");
```

---

### 2. Envio de Confirmação por Email
- ❌ Sem confirmação de email da confirmação
- ❌ Sem link de confirmação
- ❌ Sem notificação ao organizador

**Solução:** Usar Firebase Cloud Functions ou Sendgrid

```javascript
// Cloud Function
exports.enviarEmailConfirmacao = functions.firestore
  .document('confirmacoes/{docId}')
  .onCreate(async (snap) => {
    const { nome, email } = snap.data();
    await admin.firestore().collection('emails').add({
      to: email,
      template: 'confirmacao-presenca',
      data: { nome }
    });
  });
```

---

### 3. Campo Email Faltando
- ❌ Só tem WhatsApp e Nome
- ❌ Sem forma de enviar confirmação por email
- ❌ Sem backup de contato

**Solução:** Adicionar input de email obrigatório

---

### 4. Exportar Lista de Confirmados (CSV/PDF)
- ❌ Sem botão para exportar dados
- ❌ Sem relatório para impressão
- ❌ Sem lista de presença

**Solução:** Biblioteca `papaparse` (CSV) ou `jspdf` (PDF)

---

## 🟠 IMPORTANTE - UX/Interface

### 5. Responsividade Mobile
- ⚠️ Layout pode não ser ideal em celulares
- ❌ Sem meta viewport completa
- ❌ Sem testes em diferentes tamanhos

**Solução:** Testar em emulador e adicionar media queries

---

### 6. Mensagens de Feedback Melhoradas
- ❌ Alertas usando `alert()` (feio, bloqueia UI)
- ❌ Sem toast/notificação elegante
- ❌ Sem animação de sucesso

**Solução:** Usar biblioteca `toastify-js` ou criar componente customizado

---

### 7. Tela de Carregamento
- ❌ Sem loader enquanto carrega Firestore
- ❌ UI congela esperando dados
- ❌ Sem skeleton screens

**Solução:** CSS spinner + estado "loading"

---

### 8. Dark Mode
- ❌ Sem suporte a preferência de sistema
- ❌ Sem toggle dark/light
- ❌ Sem CSS variables

**Solução:** Media query `@media (prefers-color-scheme: dark)`

---

## 🟡 SEGURANÇA/DADOS

### 9. Firestore Security Rules Não Configuradas
- ❌ Banco provavelmente com access aberto
- ❌ Risco de read/write não autorizado
- ❌ Sem autenticação no admin

**Solução:** 
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /confirmacoes/{doc=**} {
      allow read: if true;
      allow create: if request.resource.data.nome != null;
      allow write: if false;
    }
    match /convidados/{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### 10. Autenticação Admin Fraca
- ❌ Senha em plaintext no `.env`
- ❌ Sem hash de senha
- ❌ Sem two-factor authentication
- ❌ Session pode ser forever

**Solução:** Firebase Authentication + JWT com expiração

---

### 11. CORS/HTTPS Não Configurado
- ❌ Sem headers de segurança
- ❌ Sem CORS headers
- ❌ Em desenvolvimento, sem HTTPS

**Solução:** Adicionar headers no Dockerfile/nginx

---

### 12. Rate Limiting Faltando
- ❌ Sem proteção contra spam
- ❌ Usuário pode enviar 1000 confirmações
- ❌ Admin pode ser bruteforçado

**Solução:** Middleware rate-limit (express-rate-limit)

---

## 📊 FUNCIONALIDADES ADMINISTRATIVAS

### 13. Dashboard de Analytics
- ❌ Sem gráficos de confirmações
- ❌ Sem estatísticas por hora/dia
- ❌ Sem previsão de confirmações

**Solução:** Biblioteca Chart.js ou Recharts

---

### 14. Notificações em Tempo Real
- ❌ Admin não recebe alerta de nova confirmação
- ❌ Sem som/badge no navegador
- ❌ Sem email de notificação

**Solução:** Service Worker + Web Push Notifications

---

### 15. Backup/Restore de Dados
- ❌ Sem backup automático
- ❌ Sem forma de restaurar dados deletados
- ❌ Sem versionamento

**Solução:** Cloud Functions + Cloud Storage, ou Firestore backups

---

## 📝 DOCUMENTAÇÃO/DEPLOY

### 16. README.md Incompleto
- ⚠️ Tem, mas não é detalhado
- ❌ Sem instruções claras de setup local
- ❌ Sem deploy guide

---

### 17. Teste Automatizado (Jest/Vitest)
- ❌ Sem testes unitários
- ❌ Sem testes de integração
- ❌ Sem coverage

---

### 18. Lint/Formatter
- ❌ Sem ESLint configurado
- ❌ Sem Prettier
- ❌ Código pode ter inconsistências

---

---

## ✅ RECOMENDAÇÕES POR PRIORIDADE

### 🔴 FAZER AGORA (Bloqueadores)
1. **Validação de Whatsapp** - sem isso, dados inválidos no banco
2. **Firestore Security Rules** - CRÍTICO para segurança
3. **Email/Campo Email** - essencial para produção
4. **Export CSV** - admin precisa de dados

### 🟠 FAZER ANTES DO DEPLOY
5. **Responsividade Mobile**
6. **Autenticação Admin Melhorada**
7. **Rate Limiting**
8. **CORS/Headers de Segurança**

### 🟡 DEPOIS DO DEPLOY
9. **Dark Mode**
10. **Toast Notifications**
11. **Analytics Dashboard**
12. **Notificações em Tempo Real**

---

## 📦 BIBLIOTECAS SUGERIDAS

```json
{
  "dependencies": {
    "firebase": "^12.13.0",
    "libphonenumber-js": "^1.10.59",
    "papaparse": "^5.4.1",
    "jspdf": "^2.5.1",
    "toastify-js": "^1.12.0",
    "chart.js": "^4.4.1",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "jest": "^29.7.0"
  }
}
```

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Hoje:** Adicionar validação de Whatsapp + campo Email
2. **Amanhã:** Configurar Firestore Security Rules + envio de email
3. **Esta semana:** Export CSV + responsividade mobile
4. **Próxima semana:** Autenticação melhorada + tests

---

## ⏱️ TEMPO ESTIMADO

| Tarefa | Tempo | Dificuldade |
|--------|-------|-------------|
| Validação Whatsapp | 1h | Fácil |
| Campo Email + Envio | 2h | Média |
| Export CSV/PDF | 1h | Fácil |
| Firestore Rules | 1h | Média |
| Rate Limiting | 1h | Média |
| Mobile Responsivo | 2h | Média |
| Auth Melhorada | 3h | Difícil |
| Analytics | 4h | Difícil |
| Tests | 3h | Difícil |
| **TOTAL** | **~18h** | - |

---

## 💡 O QUE VOCÊ TEM JÁ

✅ Containerização com Docker
✅ Firestore integrado
✅ CI/CD com GitHub Actions
✅ Painel administrativo
✅ Contador regressivo
✅ Modal de presentes
✅ Integração WhatsApp
✅ Validação de formulário básica
✅ Bugs corrigidos (20+)

---

## ⚡ O QUE VOCÊ PRECISA AINDA

❌ Validação robusta de dados
❌ Segurança no Firestore
❌ Notificações/Emails
❌ Export de dados
❌ Testes
❌ Responsividade garantida
❌ Rate limiting
❌ Backup automático

