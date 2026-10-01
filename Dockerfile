FROM node:lts-slim
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p .next/standalone/.next
RUN cp -r .next/static .next/standalone/.next/
RUN cp -r public .next/standalone/

EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
