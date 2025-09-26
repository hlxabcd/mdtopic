# 使用Node.js官方精简镜像作为基础镜像
FROM node:18-slim

# 安装Puppeteer所需的依赖
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    fonts-roboto fonts-noto-core fonts-noto-ui-core fonts-noto-color-emoji \
    fonts-liberation fonts-dejavu-core fonts-hack fonts-firacode \
    wget unzip \
    ca-certificates \
    curl \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 简化字体安装 - 使用系统字体和简单下载
RUN mkdir -p /usr/share/fonts/custom && \
    # 尝试下载并安装JetBrains Mono（等宽字体，适合代码显示）
    (wget -O /tmp/JetBrainsMono.zip https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip && \
     cd /tmp && unzip -q JetBrainsMono.zip && \
     find . -name "*.ttf" -exec cp {} /usr/share/fonts/custom/ \; && \
     rm -rf /tmp/JetBrainsMono.zip /tmp/fonts) || echo "JetBrains Mono download failed, using system fonts" && \
    # 更新字体缓存
    fc-cache -fv && \
    # 清理临时文件
    rm -rf /tmp/*.zip /tmp/fonts* /tmp/TrueType* /tmp/Inter*

# 设置Puppeteer环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 设置工作目录
WORKDIR /app

# 设置npm镜像源和配置
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set fetch-retries 3 \
    && npm config set fetch-retry-mintimeout 5000 \
    && npm config set fetch-retry-maxtimeout 60000

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖，使用更多的优化参数
RUN npm install --no-audit --no-fund --prefer-offline --network-timeout=100000

# 复制所有源代码
COPY . .

# 构建前端应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]