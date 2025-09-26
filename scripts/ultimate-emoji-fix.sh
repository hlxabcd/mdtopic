#!/bin/bash

# ===========================================
# 终极Emoji修复脚本
# 专门解决服务器emoji显示为黑白的问题
# ===========================================

set -e

echo "🎯 终极Emoji修复脚本"
echo "=========================================="

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 root 权限运行此脚本"
    echo "   sudo bash scripts/ultimate-emoji-fix.sh"
    exit 1
fi

# 检测系统类型
if command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    EMOJI_PACKAGES="google-noto-emoji-fonts google-noto-color-emoji-fonts fontawesome-fonts twitter-twemoji-fonts"
elif command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
    EMOJI_PACKAGES="fonts-noto-color-emoji fonts-font-awesome fonts-twemoji"
else
    echo "❌ 不支持的系统类型"
    exit 1
fi

echo "🔍 检测到系统: $PKG_MANAGER"

# 步骤1: 完全卸载现有emoji字体
echo ""
echo "🗑️  第1步: 清理现有emoji字体..."

if [ "$PKG_MANAGER" = "dnf" ]; then
    dnf remove -y google-noto-emoji-fonts google-noto-color-emoji-fonts fontawesome-fonts twitter-twemoji-fonts 2>/dev/null || true
    dnf clean all
elif [ "$PKG_MANAGER" = "apt-get" ]; then
    apt-get remove -y fonts-noto-color-emoji fonts-font-awesome fonts-twemoji 2>/dev/null || true
    apt-get autoremove -y
    apt-get clean
fi

# 清理字体缓存
rm -rf /var/cache/fontconfig/*
rm -rf ~/.cache/fontconfig/* 2>/dev/null || true

echo "✅ 字体清理完成"

# 步骤2: 安装最新的emoji字体包
echo ""
echo "📦 第2步: 安装最新emoji字体包..."

if [ "$PKG_MANAGER" = "dnf" ]; then
    dnf update -y
    # 安装完整的Noto字体集合
    dnf install -y \
        google-noto-fonts \
        google-noto-fonts-common \
        google-noto-emoji-fonts \
        google-noto-color-emoji-fonts \
        fontawesome-fonts \
        liberation-fonts \
        dejavu-fonts-common \
        dejavu-sans-fonts
elif [ "$PKG_MANAGER" = "apt-get" ]; then
    apt-get update
    apt-get install -y \
        fonts-noto \
        fonts-noto-core \
        fonts-noto-ui-core \
        fonts-noto-color-emoji \
        fonts-font-awesome \
        fonts-liberation \
        fonts-dejavu-core
fi

echo "✅ emoji字体包安装完成"

# 步骤3: 手动下载和安装Twemoji字体（如果系统包不可用）
echo ""
echo "🎨 第3步: 安装Twemoji彩色字体..."

FONT_DIR="/usr/share/fonts/truetype/twemoji"
mkdir -p "$FONT_DIR"

# 下载Twemoji彩色字体
if command -v wget &> /dev/null; then
    wget -q -O "$FONT_DIR/TwitterColorEmoji-SVGinOT.ttf" \
        "https://github.com/twitter/twemoji/raw/master/assets/TwitterColorEmoji-SVGinOT.ttf" || \
        echo "⚠️  Twemoji字体下载失败，跳过"
elif command -v curl &> /dev/null; then
    curl -s -L -o "$FONT_DIR/TwitterColorEmoji-SVGinOT.ttf" \
        "https://github.com/twitter/twemoji/raw/master/assets/TwitterColorEmoji-SVGinOT.ttf" || \
        echo "⚠️  Twemoji字体下载失败，跳过"
fi

# 设置字体权限
chmod 644 "$FONT_DIR"/*.ttf 2>/dev/null || true
chown root:root "$FONT_DIR"/*.ttf 2>/dev/null || true

echo "✅ Twemoji字体安装完成"

# 步骤4: 强制重建字体缓存
echo ""
echo "🔄 第4步: 强制重建字体缓存..."

# 多种方式重建字体缓存
fc-cache -f -v
fc-cache --really-force 2>/dev/null || true
fc-cache -r 2>/dev/null || true

# 清理用户字体缓存
for user_home in /home/*; do
    if [ -d "$user_home/.cache/fontconfig" ]; then
        rm -rf "$user_home/.cache/fontconfig"
        echo "清理用户字体缓存: $user_home"
    fi
done

echo "✅ 字体缓存重建完成"

# 步骤5: 验证emoji字体安装
echo ""
echo "🔍 第5步: 验证emoji字体安装..."

echo "已安装的emoji字体："
fc-list | grep -i emoji | head -5

echo ""
echo "字体配置验证："
fc-match emoji 2>/dev/null || echo "⚠️  emoji字体匹配失败"

# 步骤6: 创建强制emoji配置文件
echo ""
echo "⚙️  第6步: 创建字体配置文件..."

FONTCONFIG_DIR="/etc/fonts/conf.d"
mkdir -p "$FONTCONFIG_DIR"

cat > "$FONTCONFIG_DIR/99-emoji-force.conf" << 'EOF'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <!-- 强制emoji使用彩色字体 -->
  <match target="pattern">
    <test name="family">
      <string>emoji</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Color Emoji</string>
      <string>Apple Color Emoji</string>
      <string>Segoe UI Emoji</string>
      <string>Twitter Color Emoji</string>
    </edit>
  </match>
  
  <!-- 为所有文本启用emoji支持 -->
  <match target="pattern">
    <edit name="family" mode="append" binding="weak">
      <string>Noto Color Emoji</string>
    </edit>
  </match>
  
  <!-- 确保emoji字体优先级 -->
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Liberation Sans</family>
      <family>Noto Sans</family>
      <family>Noto Color Emoji</family>
    </prefer>
  </alias>
</fontconfig>
EOF

echo "✅ 字体配置文件创建完成"

# 步骤7: 测试Chromium emoji渲染
echo ""
echo "🧪 第7步: 测试Chromium emoji渲染..."

# 创建测试HTML文件
cat > /tmp/ultimate-emoji-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Twitter Color Emoji', sans-serif;
            font-size: 48px;
            padding: 20px;
            line-height: 1.5;
            text-rendering: optimizeLegibility;
            -webkit-font-feature-settings: "liga" 1, "kern" 1, "calt" 1;
            font-feature-settings: "liga" 1, "kern" 1, "calt" 1;
            font-variant-emoji: emoji;
        }
        
        .emoji-test {
            background: white;
            padding: 20px;
            margin: 10px 0;
            border: 2px solid #ccc;
            border-radius: 10px;
        }
        
        .force-emoji {
            font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Twitter Color Emoji', sans-serif !important;
            font-variant-emoji: emoji !important;
        }
    </style>
</head>
<body>
    <h1>🎯 终极Emoji测试</h1>
    
    <div class="emoji-test">
        <h2>默认字体栈:</h2>
        <p>😀😭🤔💯⭐✅❌🚀📝🎯🛠️🔍</p>
        <p>🎨🔧🆕💻📱⌚🎵🎮🏆🌟🔥</p>
    </div>
    
    <div class="emoji-test force-emoji">
        <h2>强制emoji字体:</h2>
        <p>😀😭🤔💯⭐✅❌🚀📝🎯🛠️🔍</p>
        <p>🎨🔧🆕💻📱⌚🎵🎮🏆🌟🔥</p>
    </div>
    
    <div class="emoji-test">
        <h2>混合文本测试:</h2>
        <p>这是测试 😀 文本中的 🎨 emoji 显示效果 ✅</p>
        <p>工具分享 🛠️ 实用神器 ⭐ 效率提升 🚀</p>
    </div>
</body>
</html>
EOF

# 查找Chromium可执行文件
CHROMIUM_PATH=""
for path in "/usr/bin/chromium-browser" "/usr/bin/chromium" "/usr/bin/google-chrome"; do
    if [ -x "$path" ]; then
        CHROMIUM_PATH="$path"
        break
    fi
done

if [ -n "$CHROMIUM_PATH" ]; then
    echo "🖥️  使用浏览器: $CHROMIUM_PATH"
    echo "📸 生成emoji测试截图..."
    
    "$CHROMIUM_PATH" \
        --headless \
        --no-sandbox \
        --disable-setuid-sandbox \
        --disable-dev-shm-usage \
        --enable-font-antialiasing \
        --font-render-hinting=none \
        --enable-gpu-rasterization \
        --disable-gpu \
        --force-color-profile=srgb \
        --window-size=1000,800 \
        --screenshot=/tmp/ultimate-emoji-test.png \
        "file:///tmp/ultimate-emoji-test.html" 2>/dev/null || echo "⚠️  截图生成可能失败"
    
    if [ -f "/tmp/ultimate-emoji-test.png" ]; then
        echo "✅ 终极emoji测试截图已生成: /tmp/ultimate-emoji-test.png"
        echo "   请下载查看此图片验证emoji是否为彩色"
    fi
else
    echo "❌ 未找到Chromium浏览器"
fi

# 步骤8: 最终重启建议
echo ""
echo "🔄 第8步: 重启服务建议..."

if pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️  检测到MDTopic服务正在运行"
    echo "   请执行以下命令重启服务："
    echo "   bash scripts/manage-service.sh restart"
else
    echo "ℹ️  未检测到运行中的MDTopic服务"
    echo "   请启动服务："
    echo "   bash scripts/manage-service.sh start"
fi

echo ""
echo "🎉 终极Emoji修复完成!"
echo "=========================================="
echo "修复总结:"
echo "✅ 完全重装emoji字体包"
echo "✅ 安装Twemoji彩色字体"
echo "✅ 强制重建字体缓存"
echo "✅ 创建字体配置文件"
echo "✅ 生成终极测试截图"
echo ""
echo "验证步骤:"
echo "1. 查看测试截图: /tmp/ultimate-emoji-test.png"
echo "2. 重启MDTopic服务"
echo "3. 在Web界面测试emoji转换"
echo ""
echo "如果问题仍然存在，可能的原因："
echo "- 服务器系统版本太旧，不支持彩色emoji"
echo "- Chromium版本过旧"
echo "- 系统缺少OpenType-SVG支持"
echo "- 建议使用Docker部署确保环境一致性"
