FROM node:18-alpine

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 安裝依賴
RUN npm install --production

# 複製應用代碼
COPY server.js ./
COPY src ./src

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["node", "server.js"]
