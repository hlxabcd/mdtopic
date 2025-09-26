# 📜 Scripts 目录

本目录包含 MDTopic 的部署和管理脚本。

## 📁 脚本说明

### `install-all.sh` - 一键安装脚本

**功能**：
- 卸载旧版本 Node.js
- 安装 Node.js 18+
- 安装系统依赖（Chromium、字体等）
- 安装项目依赖
- 构建前端应用
- 后台启动服务

**使用方法**：
```bash
# 需要 root 权限
sudo sh scripts/install-all.sh
```

**适用系统**：
- RHEL/CentOS/Fedora 系列
- 自动检测系统类型并安装相应依赖

### `manage-service.sh` - 服务管理脚本

**功能**：
- 启动/停止/重启服务
- 查看服务状态
- 查看实时日志
- 进程管理

**使用方法**：
```bash
# 查看帮助
sh scripts/manage-service.sh help

# 常用命令
sh scripts/manage-service.sh status    # 查看状态
sh scripts/manage-service.sh start     # 启动服务
sh scripts/manage-service.sh stop      # 停止服务
sh scripts/manage-service.sh restart   # 重启服务
sh scripts/manage-service.sh logs      # 查看日志
```

**特性**：
- 自动检测服务运行状态
- 优雅停止和强制终止
- PID 文件管理
- 实时日志查看
- API 健康检查

## 🔧 配置文件位置

| 类型 | 位置 | 说明 |
|------|------|------|
| PID 文件 | `/tmp/mdtopic.pid` | 服务进程ID |
| 日志文件 | `/var/log/mdtopic.log` | 服务运行日志 |
| 环境变量 | `/etc/environment` | Puppeteer 配置 |

## 📋 使用场景

### 开发环境
```bash
# 快速部署开发环境
sh scripts/install-all.sh
```

### 生产环境
```bash
# 安装
sh scripts/install-all.sh

# 管理服务
sh scripts/manage-service.sh status
sh scripts/manage-service.sh logs
```

### 故障排除
```bash
# 查看详细状态
sh scripts/manage-service.sh status

# 强制重启
sh scripts/manage-service.sh kill
sh scripts/manage-service.sh start

# 查看日志
sh scripts/manage-service.sh logs
```

## ⚠️ 注意事项

1. **权限要求**：
   - `install-all.sh` 需要 root 权限
   - `manage-service.sh` 可以普通用户运行

2. **系统兼容性**：
   - 主要适用于 RHEL/CentOS/Fedora
   - Ubuntu/Debian 需要手动安装

3. **网络要求**：
   - 需要访问 npm 镜像源
   - 需要下载 Node.js 和系统依赖

4. **资源要求**：
   - 至少 1GB 内存
   - 至少 2GB 磁盘空间

## 🔗 相关文档

- [安装指南](../docs/INSTALLATION.md) - 详细安装说明
- [部署指南](../docs/DEPLOYMENT.md) - 生产环境部署
- [故障排除](../docs/INSTALLATION.md#故障排除) - 常见问题解决
