#!/bin/bash

# MDTopic 服务管理脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/mdtopic.pid"
LOG_FILE="/var/log/mdtopic.log"

show_help() {
    echo "🔧 MDTopic 服务管理脚本"
    echo "========================================"
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  start      启动服务"
    echo "  stop       停止服务"
    echo "  restart    重启服务"
    echo "  status     查看服务状态"
    echo "  logs       查看实时日志"
    echo "  pid        显示进程ID"
    echo "  kill       强制终止服务"
    echo ""
    echo "示例:"
    echo "  $0 start     # 启动服务"
    echo "  $0 status    # 查看状态"
    echo "  $0 logs      # 查看日志"
    echo "========================================"
}

get_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE"
    else
        echo ""
    fi
}

is_running() {
    local pid=$(get_pid)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

start_service() {
    if is_running; then
        echo "⚠️  服务已在运行中 (PID: $(get_pid))"
        return 0
    fi
    
    echo "🚀 启动 MDTopic 服务..."
    cd "$SCRIPT_DIR"
    
    # 检查端口占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  端口 3000 被占用，尝试释放..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # 启动服务
    nohup npm start > "$LOG_FILE" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # 等待启动
    echo "⏳ 等待服务启动..."
    sleep 5
    
    # 验证启动
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ 服务启动成功！"
        echo "📍 访问地址: http://localhost:3000"
        echo "📍 进程ID: $pid"
        echo "📍 日志文件: $LOG_FILE"
    else
        echo "❌ 服务启动失败，请检查日志: tail -f $LOG_FILE"
        return 1
    fi
}

stop_service() {
    local pid=$(get_pid)
    
    if ! is_running; then
        echo "⚠️  服务未运行"
        # 清理PID文件
        [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
        return 0
    fi
    
    echo "🛑 停止 MDTopic 服务 (PID: $pid)..."
    
    # 优雅停止
    kill "$pid" 2>/dev/null
    
    # 等待停止
    local count=0
    while is_running && [ $count -lt 10 ]; do
        sleep 1
        count=$((count + 1))
    done
    
    if is_running; then
        echo "⚠️  优雅停止失败，强制终止..."
        kill -9 "$pid" 2>/dev/null
        sleep 2
    fi
    
    if ! is_running; then
        echo "✅ 服务已停止"
        rm -f "$PID_FILE"
    else
        echo "❌ 服务停止失败"
        return 1
    fi
}

show_status() {
    echo "📊 MDTopic 服务状态"
    echo "========================================"
    
    if is_running; then
        local pid=$(get_pid)
        echo "🟢 状态: 运行中"
        echo "📍 进程ID: $pid"
        echo "📍 访问地址: http://localhost:3000"
        echo "📍 日志文件: $LOG_FILE"
        
        # 显示进程信息
        echo ""
        echo "📋 进程信息:"
        ps aux | grep $pid | grep -v grep || echo "  无法获取进程信息"
        
        # 检查API健康状态
        echo ""
        echo "🏥 API健康检查:"
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            echo "  ✅ API响应正常"
            # 显示API响应
            echo "  📄 API响应:"
            curl -s http://localhost:3000/api/health | head -3
        else
            echo "  ❌ API无响应"
        fi
    else
        echo "🔴 状态: 未运行"
        if [ -f "$PID_FILE" ]; then
            echo "⚠️  发现残留PID文件，已清理"
            rm -f "$PID_FILE"
        fi
    fi
    echo "========================================"
}

show_logs() {
    if [ ! -f "$LOG_FILE" ]; then
        echo "❌ 日志文件不存在: $LOG_FILE"
        return 1
    fi
    
    echo "📄 MDTopic 服务日志 (Ctrl+C 退出)"
    echo "========================================"
    tail -f "$LOG_FILE"
}

force_kill() {
    echo "💀 强制终止所有 MDTopic 相关进程..."
    
    # 终止所有相关进程
    pkill -f "npm.*start" 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # 清理PID文件
    rm -f "$PID_FILE"
    
    echo "✅ 强制终止完成"
}

# 主逻辑
case "${1:-help}" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        stop_service
        sleep 2
        start_service
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    pid)
        local pid=$(get_pid)
        if [ -n "$pid" ]; then
            echo "进程ID: $pid"
        else
            echo "服务未运行"
        fi
        ;;
    kill)
        force_kill
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ 未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
