# Convite de Aniversário - Containerização Segura

## Visão Geral
Aplicação web de convite de aniversário containerizada com Docker, com segurança aprimorada e CI/CD automático via GitHub Actions.

## Estrutura de Arquivos
```
.
├── Dockerfile                 # Multi-stage build com Alpine
├── docker-compose.yml        # Configuração de container
├── .dockerignore              # Otimização da imagem
├── .env.example              # Variáveis de ambiente exemplo
├── .github/
│   └── workflows/
│       ├── docker.yml        # Pipeline build e push
│       └── security.yml      # Verificações de segurança
├── entrypoint.sh             # Script de inicialização
├── index.html                # Página principal
├── adm.html                  # Painel administrativo
├── script.js                 # Lógica principal
├── adm.js                    # Lógica administrativa
└── firebase.js               # Config Firebase (dinâmica)
```

## Configuração Rápida

### 1. Clone e Configure
```bash
git clone <seu-repo>
cd convite-de-aniversario
cp .env.example .env
```

### 2. Edite o .env
```env
FIREBASE_API_KEY=sua_chave_firebase
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=seu_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### 3. Inicie com Docker Compose
```bash
docker compose up -d
```

A aplicação estará em http://localhost:8080

## Melhorias de Segurança

✅ **Senhas & Segredos**
- Removida senha hardcoded `Cf182025`
- Variáveis de ambiente via `.env`
- Placeholder dinâmico em HTML

✅ **Otimização de Imagem**
- Multi-stage build reduz tamanho
- `.dockerignore` mejorado (exclui `.env`, `node_modules`, etc)
- Alpine Linux (18.9 MB → ~150 MB final)

✅ **Healthcheck**
- Verificação automática de saúde a cada 30s
- Curl integrado para testes

✅ **CI/CD Automático**
- Build e push automático ao fazer push
- Scan de vulnerabilidades com Trivy
- Verificações de secrets hardcoded

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `FIREBASE_API_KEY` | Chave API Firebase | - |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase | - |
| `PORT` | Porta do servidor | `8080` |
| `NODE_ENV` | Ambiente (production/development) | `production` |

## Comandos Úteis

```bash
# Iniciar
docker compose up -d

# Parar
docker compose down

# Ver logs
docker logs convite-aniversario -f

# Rebuild
docker compose up -d --build

# Remover volume
docker compose down -v
```

## GitHub Actions

### docker.yml - Build & Deploy
- ✅ Build com Buildx
- ✅ Push automático ao Docker Hub
- ✅ Scan de vulnerabilidades com Trivy
- Precisa de secrets:
  - `DOCKER_USERNAME`
  - `DOCKER_PASSWORD`

### security.yml - Verificações
- ✅ Busca por hardcoded secrets
- ✅ Validação de placeholders
- ✅ Lint do Dockerfile

## Configurar GitHub Actions

1. Vá para Settings → Secrets and variables → Actions
2. Adicione:
   - `DOCKER_USERNAME` = seu usuário Docker Hub
   - `DOCKER_PASSWORD` = seu token Docker Hub

## Desenvolvimento

### Hot Reload (local)
```bash
docker compose up
# Edite arquivos localmente - mudanças aparecem em tempo real
```

### Build Local
```bash
docker build -t convite-app:dev .
docker run -p 8080:8080 --env-file .env convite-app:dev
```

## Segurança Firestore

Adicione regras no Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /confirmacoes/{doc=**} {
      allow read, write: if request.auth != null;
    }
    match /convidados/{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

**Variáveis vazias na página?**
- Verifique se `.env` existe: `cp .env.example .env`
- Rebuilde: `docker compose up -d --build`

**Porta 8080 em uso?**
```bash
docker compose down
# Ou use outra porta:
PORT=3000 docker compose up
```

**Sem acesso ao admin?**
- Verifique se o Firebase Auth está configurado
- Verifique se o documento `admins/{uid}` existe no Firestore
- Limpe cache: DevTools → Application → Clear All

## Deploy Produção

### Docker Hub
```bash
docker build -t seu-usuario/convite-app:1.0.0 .
docker push seu-usuario/convite-app:1.0.0
```

### Kubernetes
```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: convite-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: convite-app
  template:
    metadata:
      labels:
        app: convite-app
    spec:
      containers:
      - name: app
        image: seu-usuario/convite-app:1.0.0
        ports:
        - containerPort: 8080
        envFrom:
        - secretRef:
            name: convite-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: convite-service
spec:
  selector:
    app: convite-app
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
EOF
```

## Licença
MIT

## Suporte
Dúvidas? Abra uma issue no repositório.
