# MDTopic - Markdown 转图片工具

一个高性能的 Markdown 转图片转换工具，支持 Web 界面和命令行。

## ✨ 特性

- 🚀 **高性能**: 浏览器实例复用，响应速度提升 85%
- 🧠 **智能优化**: 自动分析内容复杂度，选择最佳设置
- 📋 **预设模式**: Web/移动/打印/存档 四种场景化优化
- 📦 **文件优化**: 支持 WebP 格式，移动模式减少 59% 文件大小
- 🎨 **任务列表**: 完美支持 Markdown 任务列表 `[x]` 和 `[ ]`
- 🌐 **Web 界面**: 实时预览，所见即所得
- 💻 **命令行**: 批量处理，脚本友好

- 🐳 **Docker**: 一键部署，云服务器就绪

## 📚 文档导航

| 文档 | 描述 | 适用人群 |
|------|------|----------|
| [安装指南](docs/INSTALLATION.md) | 详细的安装步骤和故障排除 | 所有用户 |
| [项目结构](docs/PROJECT_STRUCTURE.md) | 完整的项目架构和组件说明 | 开发者、维护者 |
| [API参考](docs/API_REFERENCE.md) | 详细的API文档和使用示例 | 集成开发者 |
| [部署指南](docs/DEPLOYMENT.md) | 本地、Docker、云服务器部署 | 运维人员 |
| [开发指南](docs/DEVELOPMENT.md) | 开发环境、调试、扩展指南 | 贡献者、开发者 |

## 🚀 快速开始

### 方式1: 一键安装（推荐）
```bash
# 一键安装并启动 (后台运行)
sh scripts/install-all.sh
```

### 方式2: Docker部署
```bash
cd docker
./start.sh
```

### 方式3: 手动安装
```bash
# 安装依赖
npm install

# 构建前端
npm run build

# 启动服务
npm start
```

访问: http://localhost:3000

## 🔧 服务管理

```bash
# 查看服务状态
sh scripts/manage-service.sh status

# 启动/停止/重启服务
sh scripts/manage-service.sh start|stop|restart

# 查看实时日志
sh scripts/manage-service.sh logs
```

### 命令行使用

#### 🧠 智能优化 (推荐)
```bash
# 自动分析内容复杂度，选择最佳设置
node index.js convert README.md output.webp --smart
```

#### 📋 预设模式 (一键优化)
```bash
# 移动端优化 - 最小文件大小 (减少59%)
node index.js convert README.md output.webp --preset mobile

# Web显示优化 - 平衡质量和大小
node index.js convert README.md output.webp --preset web

# 打印质量 - 高分辨率专业品质
node index.js convert README.md output.webp --preset print

# 存档模式 - 长期存储空间优先
node index.js convert README.md output.webp --preset archive
```

#### ⚙️ 传统使用
```bash
# 基本转换
node index.js convert input.md output.webp

# 自定义参数
node index.js convert input.md output.webp \
  --format webp --quality 75 --width 800 --scale 2

# 查看帮助
node index.js --help
```

## 📁 项目结构

```
mdtopic/
├── src/                    # 源代码
│   ├── web/               # React 前端 (开发)
│   ├── server/            # Express 服务器
│   └── config/            # 配置文件
├── scripts/               # 部署和管理脚本
│   ├── install-all.sh    # 一键安装脚本
│   └── manage-service.sh  # 服务管理脚本
├── dist/                  # 构建输出 (生产)
├── lib/                   # 核心转换库
├── docker/                # Docker 配置
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── start.sh          # Docker 启动脚本
├── docs/                  # 项目文档
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   └── PROJECT_STRUCTURE.md
└── test/                  # 测试文件
```

## 📊 性能优化

### 速度优化
- ✅ 浏览器实例复用: **85%** 速度提升
- ✅ 启动参数优化: 减少资源占用
- ✅ 超时时间调优: 快速响应

### 文件大小优化
- ✅ WebP 格式: **64%** 文件减少
- ✅ 质量参数调优: 画质与大小平衡
- ✅ 多格式支持: PNG, JPEG, WebP

### 性能对比

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 首次转换 | ~8秒 | ~3秒 | 62% |
| 后续转换 | ~3秒 | ~0.5秒 | 85% |
| 文件大小 | 29KB (PNG) | 10KB (WebP) | 64% |

## 🎯 API 使用

### 转换接口

```bash
POST /api/convert
Content-Type: application/json

{
  "markdown": "# 标题\n\n- [x] 完成的任务\n- [ ] 待办事项",
  "options": {
    "format": "webp",    // png, jpeg, webp
    "quality": 85,       // 1-100
    "width": 800         // 像素宽度
  }
}
```

### 获取配置

```bash
GET /api/options

{
  "formats": ["png", "jpeg", "webp"],
  "theme": "default",
  "widthRange": { "min": 200, "max": 3000, "default": 800 },
  "qualityRange": { "min": 1, "max": 100, "default": 85 }
}
```

### 健康检查

```bash
GET /api/health

{
  "status": "ok",
  "service": "mdtopic-web-server", 
  "version": "2.0.0",
  "timestamp": "2025-08-22T06:59:43.970Z"
}
```

## 💡 格式建议

### WebP (推荐)
- **优点**: 文件最小，画质优秀
- **适用**: 现代浏览器，Web 展示
- **配置**: `format: "webp", quality: 85`

### PNG
- **优点**: 无损压缩，兼容性最佳
- **适用**: 需要透明背景，打印用途
- **配置**: `format: "png"`

### JPEG
- **优点**: 适合照片内容
- **适用**: 包含图片的 Markdown
- **配置**: `format: "jpeg", quality: 90`

## 🔧 环境变量

```bash
PORT=3000                 # 服务端口
PUPPETEER_EXECUTABLE_PATH # 自定义 Chrome 路径
```


## 🚨 系统要求

- **Node.js**: 18+ 
- **内存**: 建议 2GB+
- **CPU**: 支持多核并发
- **磁盘**: 临时文件存储

### Docker 要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 容器限制 2GB

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 启动后端服务器 (另一个终端)
npm start
```

### 构建生产版本

```bash
# 构建前端
npm run build

# 测试生产版本
npm start
```

### 运行测试

```bash
# 核心库测试
npm test

# Web API 测试
npm run test:web
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关文档

- [性能优化说明](documentation/PERFORMANCE_OPTIMIZATION.md)
- [项目结构说明](documentation/PROJECT_STRUCTURE.md)


---

⭐ **如果这个项目对你有帮助，请给个 Star！**
