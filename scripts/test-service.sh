#!/bin/bash
# MDTopic 服务功能测试脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧪 MDTopic 服务功能测试"
echo "=========================================="

# 测试环境配置
echo "1️⃣  测试环境配置..."
if source "$SCRIPT_DIR/env-setup.sh"; then
    echo "✅ 环境配置加载成功"
    echo "   PUPPETEER_CACHE_DIR: $PUPPETEER_CACHE_DIR"
    echo "   PUPPETEER_EXECUTABLE_PATH: ${PUPPETEER_EXECUTABLE_PATH:-'未设置（将使用内置浏览器）'}"
else
    echo "❌ 环境配置加载失败"
    exit 1
fi

echo ""

# 测试服务管理脚本
echo "2️⃣  测试服务管理脚本..."
if [ -x "$SCRIPT_DIR/manage-service.sh" ]; then
    echo "✅ 服务管理脚本存在且可执行"
    
    # 显示帮助信息
    echo ""
    echo "📋 服务管理命令:"
    "$SCRIPT_DIR/manage-service.sh" help
else
    echo "❌ 服务管理脚本不存在或不可执行"
    exit 1
fi

echo ""

# 测试项目依赖
echo "3️⃣  检查项目依赖..."
cd "$(dirname "$SCRIPT_DIR")"

if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 不存在"
    exit 1
fi

if [ -d "node_modules" ]; then
    echo "✅ node_modules 目录存在"
else
    echo "⚠️  node_modules 目录不存在，需要运行 npm install"
fi

if [ -d "dist" ]; then
    echo "✅ dist 目录存在（前端已构建）"
else
    echo "⚠️  dist 目录不存在，需要运行 npm run build"
fi

echo ""
echo "🎉 基础测试完成！"
echo ""
echo "💡 使用建议："
echo "   启动服务: sh scripts/manage-service.sh start"
echo "   查看状态: sh scripts/manage-service.sh status"
echo "   查看日志: sh scripts/manage-service.sh logs"
echo "   停止服务: sh scripts/manage-service.sh stop"
