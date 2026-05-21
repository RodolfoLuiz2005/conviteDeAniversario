# Build stage
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g http-server
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["/app/entrypoint.sh"]
