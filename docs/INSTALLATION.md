# 📦 MDTopic 安装指南

本文档提供了 MDTopic 的详细安装方法和故障排除指南。

## 🚀 快速安装

### 方法1: 一键安装（推荐）

适用于 RHEL/CentOS/Fedora 系统：

```bash
# 克隆项目
git clone https://github.com/hlxabcd/mdtopic.git
cd mdtopic

# 一键安装并启动
sh scripts/install-all.sh
```

**脚本功能**：
- 自动卸载旧版本 Node.js
- 安装 Node.js 18+
- 安装系统依赖（Chromium、字体等）
- 安装项目依赖
- 构建前端应用
- 后台启动服务

### 方法2: Docker 安装

```bash
cd docker
./start.sh
```

### 方法3: 手动安装

#### 步骤1: 安装 Node.js 18+

**Ubuntu/Debian**：
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**RHEL/CentOS/Fedora**：
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs
```

#### 步骤2: 安装系统依赖

**Ubuntu/Debian**：
```bash
sudo apt update
sudo apt install -y chromium-browser fonts-liberation fonts-dejavu-core fonts-noto-core fonts-noto-cjk fonts-noto-color-emoji
```

**RHEL/CentOS/Fedora**：
```bash
sudo dnf install -y chromium liberation-fonts dejavu-fonts-common dejavu-sans-fonts google-noto-fonts google-noto-cjk-fonts google-noto-emoji-fonts
```

#### 步骤3: 安装项目依赖

```bash
# 配置 npm 镜像源（国内用户推荐）
npm config set registry https://registry.npmmirror.com

# 安装依赖
npm install

# 构建前端
npm run build

# 启动服务
npm start
```

## 🔧 服务管理

### 使用管理脚本

```bash
# 查看服务状态
sh scripts/manage-service.sh status

# 启动服务
sh scripts/manage-service.sh start

# 停止服务
sh scripts/manage-service.sh stop

# 重启服务
sh scripts/manage-service.sh restart

# 查看实时日志
sh scripts/manage-service.sh logs

# 强制终止服务
sh scripts/manage-service.sh kill
```

### 手动管理

```bash
# 查看进程
ps aux | grep node

# 停止服务
kill $(cat /tmp/mdtopic.pid)

# 查看日志
tail -f /var/log/mdtopic.log
```

## 🐛 故障排除

### 常见问题

#### 1. Node.js 版本过低

**问题**：
```
npm WARN EBADENGINE Unsupported engine
```

**解决方案**：
```bash
# 升级到 Node.js 18+
sh scripts/install-all.sh  # 自动处理版本问题
```

#### 2. 权限问题

**问题**：
```
Error: EACCES: permission denied
```

**解决方案**：
```bash
# 修复权限
sudo chown -R $USER:$USER ~/.npm
sudo mkdir -p /root/.config/puppeteer
sudo chmod 755 /root/.config/puppeteer
```

#### 3. 端口被占用

**问题**：
```
Error: listen EADDRINUSE :::3000
```

**解决方案**：
```bash
# 查找占用进程
lsof -ti:3000

# 终止进程
kill $(lsof -ti:3000)

# 或者使用管理脚本
sh scripts/manage-service.sh kill
```

#### 4. Chromium 未找到

**问题**：
```
Error: Could not find browser
```

**解决方案**：
```bash
# Ubuntu/Debian
sudo apt install chromium-browser

# RHEL/CentOS/Fedora
sudo dnf install chromium

# 设置环境变量
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

#### 5. 字体问题（中文显示异常）

**解决方案**：
```bash
# Ubuntu/Debian
sudo apt install fonts-noto-cjk fonts-noto-color-emoji

# RHEL/CentOS/Fedora
sudo dnf install google-noto-cjk-fonts google-noto-emoji-fonts

# 刷新字体缓存
fc-cache -fv
```

### Docker 相关问题

#### 1. 镜像拉取失败

**问题**：
```
failed to resolve source metadata for docker.io/library/node:18-slim
```

**解决方案**：
```bash
# 配置 Docker 镜像加速器
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
sudo systemctl restart docker
```

#### 2. Podman 环境

如果使用 Podman 而不是 Docker：

```bash
# 安装 podman-compose
sudo pip3 install podman-compose

# 或者
sudo dnf install podman-compose

# 使用 Docker 启动脚本（会自动检测 Podman）
cd docker
./start.sh
```

## 📋 系统要求

### 最低要求

- **操作系统**: Linux (Ubuntu 18+, CentOS 7+, RHEL 7+)
- **Node.js**: 18.0.0+
- **内存**: 1GB+
- **磁盘空间**: 2GB+
- **网络**: 用于下载依赖

### 推荐配置

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **Node.js**: 18.19.0+
- **内存**: 2GB+
- **磁盘空间**: 5GB+
- **CPU**: 2核+

## 🔐 安全注意事项

1. **root 权限**: 一键安装脚本需要 root 权限来安装系统依赖
2. **网络安全**: 确保 3000 端口的访问控制
3. **文件权限**: 注意 npm 缓存和 Puppeteer 配置目录的权限
4. **更新维护**: 定期更新 Node.js 和系统依赖

## 📞 获取帮助

如果遇到问题：

1. 查看日志：`tail -f /var/log/mdtopic.log`
2. 检查服务状态：`sh scripts/manage-service.sh status`
3. 查看进程：`ps aux | grep node`
4. 检查端口：`lsof -i:3000`
5. 查看系统资源：`top` 或 `htop`

更多帮助请查看其他文档：
- [部署指南](DEPLOYMENT.md)
- [开发指南](DEVELOPMENT.md)
- [API 参考](API_REFERENCE.md)
