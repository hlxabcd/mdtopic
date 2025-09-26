#!/bin/bash

# MDTopic 一键安装脚本 - 完整版
# 适用于 RHEL/CentOS/Fedora 系统

echo "🚀 MDTopic 一键安装脚本"
echo "========================================"
echo "⚠️  此脚本将："
echo "   - 卸载旧版本 Node.js"
echo "   - 安装 Node.js 18+"
echo "   - 安装系统依赖"
echo "   - 安装项目依赖"
echo "   - 构建并启动项目"
echo ""

read -p "是否继续? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ 取消安装"
    exit 1
fi

echo ""
echo "🔧 开始安装过程..."

# 检查是否为 root 用户
if [[ $EUID -ne 0 ]]; then
   echo "❌ 请使用 root 用户运行此脚本"
   exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

# ========================================
# 第1步: 卸载旧版本 Node.js
# ========================================
echo ""
echo "🗑️  第1步: 卸载旧版本 Node.js..."

# 停止可能运行的 Node.js 进程
pkill -f node 2>/dev/null || true
pkill -f npm 2>/dev/null || true

# 卸载系统安装的 Node.js
dnf remove -y nodejs npm nodejs-devel
yum remove -y nodejs npm nodejs-devel 2>/dev/null || true

# 清理 nvm 安装的 Node.js
if [ -d "$HOME/.nvm" ]; then
    echo "🧹 清理 nvm 安装..."
    rm -rf "$HOME/.nvm"
fi

# 清理手动安装的 Node.js
rm -rf /opt/nodejs
rm -f /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx

# 清理项目依赖
echo "🧹 清理项目文件..."
rm -rf node_modules package-lock.json dist
rm -rf /tmp/puppeteer /root/.config/puppeteer /root/.npm

echo "✅ 旧版本清理完成"

# ========================================
# 第2步: 安装 Node.js 18
# ========================================
echo ""
echo "📦 第2步: 安装 Node.js 18..."

# 更新系统
dnf update -y

# 安装必要工具
dnf install -y curl wget tar xz

# 使用 NodeSource 仓库安装 Node.js 18
echo "🔧 添加 NodeSource 仓库..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -

echo "📦 安装 Node.js 18..."
dnf install -y nodejs

# 验证安装
node_version=$(node --version 2>/dev/null || echo "失败")
npm_version=$(npm --version 2>/dev/null || echo "失败")

echo "✅ Node.js 安装完成:"
echo "   - Node.js: $node_version"
echo "   - npm: $npm_version"

if [[ ! $node_version == v18.* ]] && [[ ! $node_version == v19.* ]] && [[ ! $node_version == v20.* ]]; then
    echo "❌ Node.js 版本不正确，尝试手动安装..."
    
    # 手动下载安装 Node.js 18
    cd /tmp
    wget https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz
    tar -xf node-v18.19.0-linux-x64.tar.xz
    
    # 移动到系统目录
    rm -rf /opt/nodejs
    mv node-v18.19.0-linux-x64 /opt/nodejs
    
    # 创建符号链接
    ln -sf /opt/nodejs/bin/node /usr/local/bin/node
    ln -sf /opt/nodejs/bin/npm /usr/local/bin/npm
    ln -sf /opt/nodejs/bin/npx /usr/local/bin/npx
    
    # 更新 PATH
    export PATH=/opt/nodejs/bin:$PATH
    echo 'export PATH=/opt/nodejs/bin:$PATH' >> /etc/profile
    
    # 重新验证
    node_version=$(node --version 2>/dev/null || echo "失败")
    npm_version=$(npm --version 2>/dev/null || echo "失败")
    echo "✅ 手动安装完成: Node.js $node_version, npm $npm_version"
fi

# ========================================
# 第3步: 安装系统依赖
# ========================================
echo ""
echo "📦 第3步: 安装系统依赖..."

# 安装 Chromium 和字体
dnf install -y \
    chromium \
    curl \
    wget \
    fontconfig \
    liberation-fonts \
    dejavu-fonts-common \
    dejavu-sans-fonts \
    google-noto-fonts \
    google-noto-cjk-fonts \
    google-noto-emoji-fonts

echo "✅ 系统依赖安装完成"

# ========================================
# 第4步: 配置 npm 和环境变量
# ========================================
echo ""
echo "🔧 第4步: 配置 npm 和环境变量..."

# 配置 npm 镜像源
npm config set registry https://registry.npmmirror.com
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 120000
npm config set network-timeout 300000
npm config set legacy-peer-deps true
npm config set audit false
npm config set fund false

# 设置 Puppeteer 环境变量
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_CACHE_DIR=/tmp/puppeteer

# 找到 Chromium 路径
if command -v chromium-browser &> /dev/null; then
    export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser)
elif command -v chromium &> /dev/null; then
    export PUPPETEER_EXECUTABLE_PATH=$(which chromium)
else
    echo "⚠️  未找到 Chromium，图片生成功能可能受限"
fi

# 创建必要目录并设置权限
mkdir -p /tmp/puppeteer /root/.config/puppeteer /root/.npm
chmod -R 755 /tmp/puppeteer /root/.config/puppeteer /root/.npm

echo "✅ 环境配置完成"

# ========================================
# 第5步: 安装项目依赖
# ========================================
echo ""
echo "📦 第5步: 安装项目依赖..."

cd "$(dirname "$0")"

# 清理 npm 缓存
npm cache clean --force

# 安装依赖
echo "📦 安装项目依赖 (可能需要几分钟)..."
npm install --legacy-peer-deps --no-audit --no-fund

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，尝试强制清理后重试..."
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install --legacy-peer-deps --no-audit --no-fund --force
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

echo "✅ 项目依赖安装完成"

# ========================================
# 第6步: 构建前端
# ========================================
echo ""
echo "🏗️  第6步: 构建前端应用..."

npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端构建完成"

# ========================================
# 第7步: 启动服务
# ========================================
echo ""
echo "🚀 第7步: 启动服务..."

# 检查端口占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 3000 被占用，尝试释放..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo ""
echo "🎉 安装完成！"
echo "========================================"
echo "📋 安装信息:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - Chromium: $(chromium --version 2>/dev/null | head -1 || echo '已安装')"
echo ""
echo "🚀 启动服务器 (后台运行)..."

# 启动服务器到后台
nohup npm start > /var/log/mdtopic.log 2>&1 &
APP_PID=$!

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务是否启动成功
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ MDTopic 服务启动成功！"
    echo ""
    echo "📍 访问地址: http://localhost:3000"
    echo "📍 API健康检查: http://localhost:3000/api/health"
    echo "📍 API选项: http://localhost:3000/api/options"
    echo ""
    echo "📋 服务管理:"
    echo "  - 进程ID: $APP_PID"
    echo "  - 日志文件: /var/log/mdtopic.log"
    echo "  - 查看日志: tail -f /var/log/mdtopic.log"
    echo "  - 停止服务: kill $APP_PID"
    echo "  - 查看进程: ps aux | grep node"
    echo ""
    
    # 保存进程ID到文件
    echo $APP_PID > /tmp/mdtopic.pid
    echo "💾 进程ID已保存到 /tmp/mdtopic.pid"
    
else
    echo "❌ 服务启动失败，请检查日志:"
    echo "   tail -f /var/log/mdtopic.log"
    exit 1
fi

echo ""
echo "🎉 MDTopic 安装和启动完成！"
echo "========================================"
