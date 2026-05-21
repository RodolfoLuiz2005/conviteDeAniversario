#!/bin/bash
set -e

echo "Iniciando aplicacao..."

SITE_DIR="/srv/site"
rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR"

# Copia apenas arquivos visiveis para fora do diretorio que contem .env/.git
cp -R /app/* "$SITE_DIR"/

sed -i "s/__FIREBASE_API_KEY__/${FIREBASE_API_KEY}/g" "$SITE_DIR/index.html"
sed -i "s/__FIREBASE_AUTH_DOMAIN__/${FIREBASE_AUTH_DOMAIN}/g" "$SITE_DIR/index.html"
sed -i "s/__FIREBASE_PROJECT_ID__/${FIREBASE_PROJECT_ID}/g" "$SITE_DIR/index.html"
sed -i "s/__FIREBASE_STORAGE_BUCKET__/${FIREBASE_STORAGE_BUCKET}/g" "$SITE_DIR/index.html"
sed -i "s/__FIREBASE_MESSAGING_SENDER_ID__/${FIREBASE_MESSAGING_SENDER_ID}/g" "$SITE_DIR/index.html"
sed -i "s/__FIREBASE_APP_ID__/${FIREBASE_APP_ID}/g" "$SITE_DIR/index.html"
sed -i "s/__FIREBASE_MEASUREMENT_ID__/${FIREBASE_MEASUREMENT_ID}/g" "$SITE_DIR/index.html"

sed -i "s/__FIREBASE_API_KEY__/${FIREBASE_API_KEY}/g" "$SITE_DIR/adm.html"
sed -i "s/__FIREBASE_AUTH_DOMAIN__/${FIREBASE_AUTH_DOMAIN}/g" "$SITE_DIR/adm.html"
sed -i "s/__FIREBASE_PROJECT_ID__/${FIREBASE_PROJECT_ID}/g" "$SITE_DIR/adm.html"
sed -i "s/__FIREBASE_STORAGE_BUCKET__/${FIREBASE_STORAGE_BUCKET}/g" "$SITE_DIR/adm.html"
sed -i "s/__FIREBASE_MESSAGING_SENDER_ID__/${FIREBASE_MESSAGING_SENDER_ID}/g" "$SITE_DIR/adm.html"
sed -i "s/__FIREBASE_APP_ID__/${FIREBASE_APP_ID}/g" "$SITE_DIR/adm.html"
sed -i "s/__FIREBASE_MEASUREMENT_ID__/${FIREBASE_MEASUREMENT_ID}/g" "$SITE_DIR/adm.html"
sed -i "s/__ADMIN_PASSWORD__/${ADMIN_PASSWORD}/g" "$SITE_DIR/adm.html"

echo "Configuracao injetada!"
echo "Iniciando servidor..."

http-server "$SITE_DIR" -p 8080 -c-1
