# Build stage
FROM node:20-alpine

WORKDIR /app

COPY . .

# Install http-server
RUN npm install -g http-server

# Expose port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Default command - injetar variáveis e iniciar
CMD ["sh", "-c", "sed -i \"s/__ADMIN_PASSWORD__/${ADMIN_PASSWORD}/g\" /app/index.html && sed -i \"s/__ADMIN_PASSWORD__/${ADMIN_PASSWORD}/g\" /app/adm.html && sed -i \"s/__FIREBASE_API_KEY__/${FIREBASE_API_KEY}/g\" /app/index.html && sed -i \"s/__FIREBASE_API_KEY__/${FIREBASE_API_KEY}/g\" /app/adm.html && sed -i \"s/__FIREBASE_AUTH_DOMAIN__/${FIREBASE_AUTH_DOMAIN}/g\" /app/index.html && sed -i \"s/__FIREBASE_AUTH_DOMAIN__/${FIREBASE_AUTH_DOMAIN}/g\" /app/adm.html && sed -i \"s/__FIREBASE_PROJECT_ID__/${FIREBASE_PROJECT_ID}/g\" /app/index.html && sed -i \"s/__FIREBASE_PROJECT_ID__/${FIREBASE_PROJECT_ID}/g\" /app/adm.html && sed -i \"s/__FIREBASE_STORAGE_BUCKET__/${FIREBASE_STORAGE_BUCKET}/g\" /app/index.html && sed -i \"s/__FIREBASE_STORAGE_BUCKET__/${FIREBASE_STORAGE_BUCKET}/g\" /app/adm.html && sed -i \"s/__FIREBASE_MESSAGING_SENDER_ID__/${FIREBASE_MESSAGING_SENDER_ID}/g\" /app/index.html && sed -i \"s/__FIREBASE_MESSAGING_SENDER_ID__/${FIREBASE_MESSAGING_SENDER_ID}/g\" /app/adm.html && sed -i \"s/__FIREBASE_APP_ID__/${FIREBASE_APP_ID}/g\" /app/index.html && sed -i \"s/__FIREBASE_APP_ID__/${FIREBASE_APP_ID}/g\" /app/adm.html && sed -i \"s/__FIREBASE_MEASUREMENT_ID__/${FIREBASE_MEASUREMENT_ID}/g\" /app/index.html && sed -i \"s/__FIREBASE_MEASUREMENT_ID__/${FIREBASE_MEASUREMENT_ID}/g\" /app/adm.html && http-server -p 8080 -c-1"]
