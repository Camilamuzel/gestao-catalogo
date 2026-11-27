FROM node:20-alpine

WORKDIR /app

RUN npm install -g json-server

COPY db.json .

EXPOSE 3000

CMD ["sh", "-c", "json-server --watch db.json --host 0.0.0.0 --port ${PORT:-3000}"]