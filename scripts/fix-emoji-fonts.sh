#!/bin/bash

# ===========================================
# MDTopic Emoji字体修复脚本
# 适用于已部署的服务器环境
# ===========================================

set -e

echo "🎨 MDTopic Emoji字体修复脚本"
echo "=========================================="

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 root 权限运行此脚本"
    echo "   sudo bash scripts/fix-emoji-fonts.sh"
    exit 1
fi

# 检测系统类型
if command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    EMOJI_PACKAGE="google-noto-emoji-fonts"
elif command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
    EMOJI_PACKAGE="fonts-noto-color-emoji"
else
    echo "❌ 不支持的系统类型，仅支持 RHEL/CentOS 或 Debian/Ubuntu"
    exit 1
fi

echo "🔍 检测到系统: $PKG_MANAGER"

# 步骤1: 检查当前emoji字体状态
echo ""
echo "📋 第1步: 检查当前emoji字体状态..."

echo "当前已安装的emoji字体:"
if fc-list | grep -i emoji; then
    echo "✅ 发现已安装的emoji字体"
else
    echo "⚠️  未发现emoji字体，需要安装"
fi

# 步骤2: 安装/更新emoji字体
echo ""
echo "📦 第2步: 安装/更新emoji字体..."

if [ "$PKG_MANAGER" = "dnf" ]; then
    dnf install -y \
        google-noto-emoji-fonts \
        fontawesome-fonts \
        fontconfig
elif [ "$PKG_MANAGER" = "apt-get" ]; then
    apt-get update
    apt-get install -y \
        fonts-noto-color-emoji \
        fonts-font-awesome \
        fontconfig
fi

echo "✅ emoji字体包安装完成"

# 步骤3: 更新字体缓存
echo ""
echo "🔄 第3步: 更新字体缓存..."
fc-cache -fv

# 步骤4: 验证安装
echo ""
echo "🔍 第4步: 验证emoji字体安装..."

echo "验证emoji字体:"
if fc-list | grep -i "noto.*emoji" > /dev/null; then
    echo "✅ Noto Emoji字体验证成功"
else
    echo "❌ Noto Emoji字体验证失败"
fi

# 显示所有可用emoji字体
echo ""
echo "📝 所有可用emoji字体:"
fc-list | grep -i emoji

# 步骤5: 测试emoji渲染
echo ""
echo "🧪 第5步: 测试emoji渲染..."

# 创建测试文件
cat > /tmp/emoji-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Roboto', 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
            font-size: 24px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>Emoji测试 🎨</h1>
    <p>基础表情: 😀 😭 🤔 💯</p>
    <p>工具图标: ⭐ ✅ ❌ 🚀</p>
    <p>其他符号: 📝 🎯 🛠️ 🔍</p>
</body>
</html>
EOF

echo "✅ 创建了emoji测试文件: /tmp/emoji-test.html"

# 如果服务正在运行，建议重启
echo ""
echo "🔄 第6步: 服务重启建议..."

if pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️  检测到MDTopic服务正在运行"
    echo "   建议重启服务以应用字体更改:"
    echo "   bash scripts/manage-service.sh restart"
else
    echo "ℹ️  未检测到运行中的MDTopic服务"
fi

echo ""
echo "🎉 Emoji字体修复完成!"
echo "=========================================="
echo "下一步操作:"
echo "1. 重启MDTopic服务 (如果正在运行)"
echo "2. 访问Web界面测试emoji显示"
echo "3. 转换包含emoji的Markdown内容"
echo ""
echo "如果仍有问题，请检查:"
echo "- 浏览器是否支持对应的emoji字体"
echo "- CSS字体栈配置是否正确"
echo "- 字体缓存是否已更新"
