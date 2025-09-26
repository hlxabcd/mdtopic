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
- 自动配置浏览器环境变量
- 优雅停止和强制终止
- PID 文件管理
- 实时日志查看
- API 健康检查

### `env-setup.sh` - 环境变量配置脚本

**功能**：
- 统一配置 Puppeteer 环境变量
- 自动检测系统浏览器路径
- 设置缓存目录
- 环境变量调试和验证

**使用方法**：
```bash
# 直接执行查看配置
sh scripts/env-setup.sh

# 在其他脚本中加载
source scripts/env-setup.sh
setup_puppeteer_env
```

**特性**：
- 智能浏览器检测（支持 Chromium、Chrome）
- RPM 包路径自动识别
- 环境变量导出和验证
- 跨脚本配置共享

### `fix-emoji-fonts.sh` - Emoji字体修复脚本

**功能**：
- 检查并安装emoji字体包
- 更新字体缓存
- 验证emoji字体安装
- 适用于已部署的服务器环境

**使用方法**：
```bash
# 需要 root 权限
sudo bash scripts/fix-emoji-fonts.sh
```

**适用场景**：
- 服务器emoji显示异常
- 字体缓存需要更新
- 新安装emoji字体包

**特性**：
- 自动检测系统类型（RHEL/Debian）
- 智能安装对应emoji字体包
- 字体验证和测试
- 服务重启建议

### `test-service.sh` - 服务功能测试脚本

**功能**：
- 测试环境配置完整性
- 验证脚本功能正常
- 检查项目依赖状态
- 显示使用建议和帮助

**使用方法**：
```bash
sh scripts/test-service.sh
```

**特性**：
- 全面的环境检查
- 友好的错误提示
- 使用建议和指导
- 快速诊断问题

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
