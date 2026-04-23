FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 2>/dev/null || true
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]