FROM node:20-alpine

WORKDIR /app

# Instala o json-server globalmente no container
RUN npm install -g json-server

EXPOSE 3000

# Inicia o servidor aceitando conexões externas na porta 3000
CMD ["json-server", "--watch", "db.json", "--host", "0.0.0.0", "--port", "3000"]