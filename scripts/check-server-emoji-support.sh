#!/bin/bash

# ===========================================
# 服务器Emoji支持能力检测脚本
# 快速判断服务器是否支持彩色emoji
# ===========================================

echo "🔍 服务器Emoji支持能力检测"
echo "=========================================="

# 基本信息收集
echo "📋 系统信息:"
echo "操作系统: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "内核版本: $(uname -r)"
echo "架构: $(uname -m)"

# 检查Chromium版本
echo ""
echo "🌐 浏览器信息:"
if command -v chromium-browser &> /dev/null; then
    CHROMIUM_VERSION=$(chromium-browser --version 2>/dev/null)
    echo "Chromium: $CHROMIUM_VERSION"
elif command -v chromium &> /dev/null; then
    CHROMIUM_VERSION=$(chromium --version 2>/dev/null)
    echo "Chromium: $CHROMIUM_VERSION"
else
    echo "❌ 未找到Chromium浏览器"
    exit 1
fi

# 检查字体支持
echo ""
echo "🔤 字体支持检查:"

# 检查emoji字体是否存在
echo "Emoji字体文件:"
find /usr/share/fonts -name "*emoji*" -type f 2>/dev/null | head -3 || echo "❌ 未找到emoji字体文件"

echo ""
echo "fontconfig识别的emoji字体:"
fc-list | grep -i emoji | head -3 || echo "❌ fontconfig未识别emoji字体"

# 检查关键技术支持
echo ""
echo "🔧 技术支持检查:"

# 检查是否支持OpenType-SVG (彩色emoji的关键技术)
echo "检查OpenType-SVG支持..."
if fc-list | grep -i "noto.*color" > /dev/null; then
    echo "✅ 发现Noto Color Emoji字体"
else
    echo "❌ 未发现Noto Color Emoji字体"
fi

# 检查fontconfig版本 (影响emoji支持)
echo "fontconfig版本:"
fc-cache --version 2>/dev/null || echo "❌ 无法获取fontconfig版本"

# 快速emoji渲染测试
echo ""
echo "🧪 快速渲染测试:"

# 创建最小测试页面
cat > /tmp/minimal-emoji-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-size:48px;font-family:'Noto Color Emoji','Apple Color Emoji',sans-serif;">
😀🎨⭐✅❌🚀
</body>
</html>
EOF

# 查找浏览器
BROWSER=""
for path in "/usr/bin/chromium-browser" "/usr/bin/chromium" "/usr/bin/google-chrome"; do
    if [ -x "$path" ]; then
        BROWSER="$path"
        break
    fi
done

if [ -n "$BROWSER" ]; then
    echo "使用浏览器: $BROWSER"
    
    # 生成测试截图
    "$BROWSER" \
        --headless \
        --no-sandbox \
        --disable-setuid-sandbox \
        --disable-dev-shm-usage \
        --disable-gpu \
        --window-size=400,200 \
        --screenshot=/tmp/emoji-support-test.png \
        "file:///tmp/minimal-emoji-test.html" 2>/dev/null
    
    if [ -f "/tmp/emoji-support-test.png" ]; then
        echo "✅ 测试截图已生成: /tmp/emoji-support-test.png"
        
        # 检查截图文件大小（彩色emoji通常会产生更大的文件）
        FILE_SIZE=$(stat -f%z "/tmp/emoji-support-test.png" 2>/dev/null || stat -c%s "/tmp/emoji-support-test.png" 2>/dev/null)
        echo "截图文件大小: ${FILE_SIZE} bytes"
        
        if [ "$FILE_SIZE" -gt 3000 ]; then
            echo "📊 文件大小正常，可能支持彩色emoji"
        else
            echo "⚠️  文件大小偏小，可能只是黑白emoji"
        fi
    else
        echo "❌ 测试截图生成失败"
    fi
else
    echo "❌ 未找到可用浏览器"
fi

# 系统能力判断
echo ""
echo "📈 综合判断:"

# 计算支持程度得分
SCORE=0

# 字体文件存在 +20分
if find /usr/share/fonts -name "*emoji*" -type f 2>/dev/null | grep -q .; then
    SCORE=$((SCORE + 20))
fi

# fontconfig识别 +20分  
if fc-list | grep -i emoji > /dev/null; then
    SCORE=$((SCORE + 20))
fi

# Noto Color Emoji +30分
if fc-list | grep -i "noto.*color" > /dev/null; then
    SCORE=$((SCORE + 30))
fi

# 截图生成成功 +20分
if [ -f "/tmp/emoji-support-test.png" ]; then
    SCORE=$((SCORE + 20))
fi

# 文件大小合理 +10分
if [ -f "/tmp/emoji-support-test.png" ] && [ "$FILE_SIZE" -gt 3000 ]; then
    SCORE=$((SCORE + 10))
fi

echo "支持程度得分: $SCORE/100"

if [ "$SCORE" -ge 80 ]; then
    echo "🎉 服务器应该支持彩色emoji"
    echo "建议: 使用 scripts/fix-emoji-fonts.sh 修复配置问题"
elif [ "$SCORE" -ge 50 ]; then
    echo "⚠️  服务器部分支持emoji，可能需要额外配置"
    echo "建议: 运行 scripts/ultimate-emoji-fix.sh 进行全面修复"
elif [ "$SCORE" -ge 20 ]; then
    echo "❌ 服务器emoji支持有限"
    echo "建议: 检查系统版本，考虑升级或使用Docker部署"
else
    echo "💀 服务器不支持彩色emoji"
    echo "建议: 使用Docker部署确保环境一致，或接受黑白emoji显示"
fi

echo ""
echo "🔧 替代解决方案:"
echo "1. 使用Docker部署 (推荐)"
echo "2. 使用emoji图片替换 (修改代码)"
echo "3. 接受黑白emoji显示"
echo "4. 升级服务器系统版本"

echo ""
echo "📁 相关文件:"
echo "- 测试截图: /tmp/emoji-support-test.png"
echo "- 测试页面: /tmp/minimal-emoji-test.html"
echo ""
echo "请下载测试截图查看实际emoji渲染效果"
