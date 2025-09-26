#!/bin/bash

# MDTopic Docker 启动脚本

echo "🐳 启动 MDTopic Docker 容器..."

# 进入脚本所在目录
cd "$(dirname "$0")"

# 检测可用的 compose 命令 (优先使用 Podman)
if command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
    echo "✅ 使用 podman-compose (推荐)"
elif /usr/local/bin/podman-compose --version &> /dev/null; then
    COMPOSE_CMD="/usr/local/bin/podman-compose"
    echo "✅ 使用 podman-compose (完整路径)"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    echo "✅ 使用 docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
    echo "✅ 使用 docker compose"
else
    echo "❌ 错误: 未找到容器编排工具"
    echo ""
    echo "检测到您使用的是 Podman，请安装 podman-compose:"
    echo "  方法1: sudo dnf install podman-compose"
    echo "  方法2: sudo pip3 install podman-compose"
    echo ""
    echo "如果使用 Docker，请安装 docker-compose:"
    echo "  方法1: sudo apt install docker-compose"
    echo "  方法2: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

# 停止并移除旧容器
echo "🧹 清理旧容器..."
$COMPOSE_CMD down

# 构建并启动容器
echo "🏗️  构建镜像..."
$COMPOSE_CMD build

echo "🚀 启动容器..."
$COMPOSE_CMD up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ MDTopic 已成功启动!"
    echo "📍 访问地址: http://localhost:3000"
else
    echo "❌ 服务启动失败，请检查日志:"
    $COMPOSE_CMD logs
fi
