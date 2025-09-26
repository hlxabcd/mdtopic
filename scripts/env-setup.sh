#!/bin/bash
# MDTopic 环境变量配置脚本
# 用于确保 Puppeteer 和浏览器配置在所有脚本中保持一致

# 设置 Puppeteer 缓存目录
export PUPPETEER_CACHE_DIR=/tmp/puppeteer

# 查找可用的浏览器路径
find_chrome() {
    local CHROME_PATHS=(
        "/usr/bin/chromium-browser"
        "/usr/bin/chromium"
        "/usr/bin/google-chrome"
        "/usr/bin/google-chrome-stable"
        "/opt/google/chrome/chrome"
        "/usr/lib64/chromium-browser/chromium-browser"
        "/usr/lib/chromium-browser/chromium-browser"
    )
    
    # 首先检查 RPM 包安装的 Chromium
    if command -v rpm &>/dev/null && rpm -q chromium &>/dev/null; then
        # 查找 RPM 包中的可执行文件
        local chromium_files=$(rpm -ql chromium 2>/dev/null | grep -E "bin/")
        for file in $chromium_files; do
            if [ -x "$file" ]; then
                echo "$file"
                return 0
            fi
        done
    fi
    
    # 检查常见路径
    for path in "${CHROME_PATHS[@]}"; do
        if [ -f "$path" ] && [ -x "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    return 1
}

# 配置 Puppeteer 环境变量
setup_puppeteer_env() {
    local found_chrome=$(find_chrome)
    
    if [ -n "$found_chrome" ]; then
        # 使用系统浏览器
        export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
        export PUPPETEER_EXECUTABLE_PATH="$found_chrome"
        echo "✅ 配置系统浏览器: $found_chrome"
        return 0
    else
        # 使用 Puppeteer 内置浏览器
        unset PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
        unset PUPPETEER_EXECUTABLE_PATH
        echo "⚠️  未找到系统浏览器，使用 Puppeteer 内置浏览器"
        return 1
    fi
}

# 如果脚本被直接执行，则设置环境变量
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    echo "🔧 配置 Puppeteer 环境变量..."
    setup_puppeteer_env
    echo "📋 当前环境变量:"
    echo "  PUPPETEER_CACHE_DIR=$PUPPETEER_CACHE_DIR"
    echo "  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD"
    echo "  PUPPETEER_EXECUTABLE_PATH=$PUPPETEER_EXECUTABLE_PATH"
fi
