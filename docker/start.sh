#!/bin/bash

# MDTopic Docker 启动脚本

echo "🐳 启动 MDTopic Docker 容器..."

# 进入脚本所在目录
cd "$(dirname "$0")"

# 停止并移除旧容器
echo "🧹 清理旧容器..."
docker-compose down

# 构建并启动容器
echo "🏗️  构建镜像..."
docker-compose build

echo "🚀 启动容器..."
docker-compose up -d

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
    docker-compose logs
fi
