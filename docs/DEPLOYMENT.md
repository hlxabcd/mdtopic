# MDTopic 部署指南

## 🚀 部署方式概览

MDTopic 支持多种部署方式，适应不同的使用场景：

| 方式 | 适用场景 | 优势 | 复杂度 |
|------|----------|------|--------|
| **本地运行** | 开发测试 | 简单快速 | ⭐ |
| **Docker部署** | 生产环境 | 环境隔离 | ⭐⭐ |
| **云服务器** | 远程访问 | 高可用性 | ⭐⭐⭐ |
| **CLI工具** | 命令行集成 | 脚本友好 | ⭐ |

---

## 💻 本地部署

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows, macOS, Linux
- **内存**: 建议 >= 2GB

### 快速开始

```bash
# 1. 克隆项目
git clone <repository-url>
cd mdtopic

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 启动服务
npm start
```

### 验证部署
```bash
# 检查服务状态
curl http://localhost:3000/api/health

# 测试转换功能
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Test"}' \
  --output test.png
```

### 开发模式
```bash
# 前端开发服务器 (热重载)
npm run dev

# 后端服务器 (生产模式)
npm start
```

---

## 🐳 Docker部署

### 快速部署

#### 方式1: 使用start.sh脚本
```bash
# 进入docker目录
cd docker

# 一键启动 (推荐)
./start.sh
```

#### 方式2: 手动docker-compose
```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### Docker配置详解

#### docker-compose.yml
```yaml
services:
  mdtopic:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    restart: unless-stopped
    container_name: mdtopic
    # 资源限制
    mem_limit: 2g
    cpus: 1
    # 共享内存配置
    shm_size: '1gb'
    # 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### Dockerfile特点
- 基于 `node:18-slim`
- 预装 Chromium 和字体
- 优化的 Puppeteer 配置
- 多阶段构建优化

### 资源配置建议

#### 最小配置
- **CPU**: 1核
- **内存**: 2GB
- **存储**: 5GB

#### 推荐配置
- **CPU**: 2核
- **内存**: 4GB
- **存储**: 10GB

#### 高负载配置
- **CPU**: 4核
- **内存**: 8GB
- **存储**: 20GB

---

## ☁️ 云服务器部署

### 阿里云 ECS

#### 1. 服务器配置
```bash
# 操作系统：Ubuntu 20.04 LTS
# 配置：2核4GB（最小）

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### 2. 部署应用
```bash
# 克隆项目
git clone <repository-url>
cd mdtopic

# 启动服务
cd docker && ./start.sh

# 配置反向代理 (可选)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/mdtopic
```

#### 3. Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 文件上传大小限制
        client_max_body_size 10M;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 腾讯云 CVM
部署步骤与阿里云类似，额外配置：

```bash
# 安全组规则：开放3000端口
# 防火墙配置
sudo ufw allow 3000
sudo ufw enable
```

### AWS EC2
```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install -y docker git

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# 部署应用（同上）
```

---

## 🌐 反向代理配置

### Nginx (推荐)

#### 基础配置
```nginx
upstream mdtopic {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://mdtopic;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location /assets/ {
        proxy_pass http://mdtopic;
        proxy_cache_valid 200 1d;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### HTTPS配置 (Let's Encrypt)
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 2 * * * certbot renew --quiet
```

### Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
    
    # 文件上传限制
    LimitRequestBody 10485760
</VirtualHost>
```

---

## 🔧 环境变量配置

### 支持的环境变量
```bash
# 服务端口
PORT=3000

# Puppeteer配置
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 性能调优
NODE_OPTIONS=--max-old-space-size=4096

# 日志级别
LOG_LEVEL=info

# 资源限制
MAX_CONTENT_SIZE=102400
MAX_CONCURRENT_REQUESTS=10
```

### Docker环境变量
```yaml
services:
  mdtopic:
    environment:
      - NODE_ENV=production
      - PORT=3000
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    # ...其他配置
```

---

## 📊 监控和维护

### 健康检查
```bash
# API健康检查
curl -f http://localhost:3000/api/health

# Docker容器状态
docker ps
docker stats mdtopic

# 系统资源监控
htop
df -h
```

### 日志管理
```bash
# Docker日志
docker-compose logs -f --tail=100

# 应用日志
tail -f /var/log/mdtopic/app.log

# Nginx日志
tail -f /var/log/nginx/access.log
```

### 备份策略
```bash
# 配置备份
tar -czf mdtopic-config-$(date +%Y%m%d).tar.gz \
  docker-compose.yml Dockerfile start.sh

# 数据备份（如果有持久化数据）
docker run --rm -v mdtopic_data:/data \
  -v $(pwd):/backup alpine \
  tar -czf /backup/backup-$(date +%Y%m%d).tar.gz /data
```

---

## 🚨 故障排除

### 常见问题

#### 1. 浏览器启动失败
```bash
# 检查Chromium安装
which chromium-browser || which chromium

# Docker环境检查共享内存
docker run --rm --shm-size=1g <image> chrome --version
```

#### 2. 内存不足
```bash
# 监控内存使用
free -h
docker stats

# 增加swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 3. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000
lsof -i :3000

# 修改端口
export PORT=3001
```

#### 4. 字体渲染问题
```bash
# 安装字体包
sudo apt-get install fonts-liberation fonts-noto-color-emoji

# Docker容器内检查
docker exec -it mdtopic fc-list
```

### 性能调优

#### 1. Puppeteer优化
```javascript
// 减少资源加载
await page.setRequestInterception(true);
page.on('request', (req) => {
  if(req.resourceType() == 'image'){
    req.abort();
  } else {
    req.continue();
  }
});
```

#### 2. 内存管理
```bash
# Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# Docker内存限制
docker run --memory=2g --memory-swap=4g
```

#### 3. 并发限制
```javascript
// Express限制并发
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制100个请求
}));
```

---

## 🔒 安全配置

### 基础安全
```bash
# 创建非root用户
sudo useradd -m -s /bin/bash mdtopic
sudo usermod -aG docker mdtopic

# 设置文件权限
chmod 755 start.sh
chmod 644 docker-compose.yml
```

### 防火墙配置
```bash
# UFW配置
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### HTTPS强制
```nginx
# 重定向HTTP到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📈 扩容和负载均衡

### 水平扩容
```yaml
# docker-compose.yml
services:
  mdtopic-1:
    # ...配置
    ports:
      - "3001:3000"
  
  mdtopic-2:
    # ...配置  
    ports:
      - "3002:3000"

  nginx:
    # 负载均衡器
```

### Nginx负载均衡
```nginx
upstream mdtopic_cluster {
    server localhost:3001 weight=1;
    server localhost:3002 weight=1;
    server localhost:3003 weight=1;
}

server {
    location / {
        proxy_pass http://mdtopic_cluster;
    }
}
```

---

📝 更新日期：2025-08-28  
🔧 部署版本：v2.0.0





