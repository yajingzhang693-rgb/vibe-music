FROM node:lts-slim
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# standalone模式必须复制静态资源，解决CSS/图片404
RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
