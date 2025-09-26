# MDTopic 项目结构说明

## 📁 项目目录结构

```
mdtopic/
├── README.md                   # 项目主文档
├── package.json                # 项目配置和依赖
├── index.js                    # CLI工具入口 (可执行文件)
├── 
├── lib/                        # 核心库
│   └── markdown-converter.js   # Markdown转换核心逻辑
├── 
├── scripts/                    # 部署和管理脚本
│   ├── README.md              # 脚本说明文档
│   ├── install-all.sh         # 一键安装脚本
│   └── manage-service.sh      # 服务管理脚本
├── 
├── src/                        # 源代码
│   ├── config/                 # 配置模块
│   │   ├── config.js          # 主配置文件
│   │   └── css-styles.js      # CSS样式构建器
│   ├── server/                # 后端服务
│   │   └── server.js          # Express服务器
│   └── web/                   # 前端代码
│       ├── App.jsx            # React主组件
│       ├── App.css            # 前端样式
│       ├── main.jsx           # React入口
│       ├── index.html         # HTML模板
│       ├── vite.config.js     # Vite配置
│       └── package.json       # 前端包配置
├── 
├── docker/                    # Docker部署
│   ├── Dockerfile            # Docker镜像配置
│   ├── docker-compose.yml    # Docker Compose配置
│   └── start.sh              # 快速启动脚本
├── 
├── dist/                     # 前端构建产物
│   ├── index.html            # 构建后的HTML
│   └── assets/               # 静态资源
├── 
├── test/                     # 测试文件
│   ├── test-integration.md   # 测试用例
│   ├── test-integration.png  # 测试期望输出
│   └── test-integration-dark.png # 暗色主题测试
├── 
├── docs/                     # 项目文档
│   ├── INSTALLATION.md       # 安装指南
│   ├── PROJECT_STRUCTURE.md  # 本文档
│   ├── API_REFERENCE.md      # API参考
│   ├── DEPLOYMENT.md         # 部署指南
│   └── DEVELOPMENT.md        # 开发指南
└── 
```

## 🔧 核心组件说明

### 1. CLI 工具 (`index.js`)
**入口文件**，提供命令行接口：
- 支持单文件和批量转换
- 多种输出格式 (PNG, JPEG, WebP)
- 智能优化和预设模式
- 可全局安装使用

### 2. 核心转换库 (`lib/markdown-converter.js`)
**核心转换引擎**，负责：
- Markdown 解析和 HTML 渲染
- Puppeteer 浏览器控制
- 图片生成和优化
- 样式应用和字体处理

### 3. Web 服务器 (`src/server/server.js`)
**Express.js 后端服务**，提供：
- RESTful API 接口
- 静态文件服务
- 错误处理和日志
- 健康检查接口

### 4. 前端应用 (`src/web/`)
**React + Vite 前端**，包含：
- 实时 Markdown 编辑器
- 即时预览功能
- 参数配置界面
- 文件下载功能

### 5. 配置模块 (`src/config/`)
**系统配置管理**：
- `config.js`: 主要配置参数
- `css-styles.js`: CSS 样式生成器

### 6. 部署脚本 (`scripts/`)
**自动化部署工具**：
- `install-all.sh`: 一键安装脚本
- `manage-service.sh`: 服务管理脚本

## 🏗️ 技术架构

### 前端技术栈
- **React 18**: 用户界面框架
- **Vite**: 构建工具和开发服务器
- **CSS3**: 样式和布局
- **Fetch API**: HTTP 客户端

### 后端技术栈
- **Node.js**: 运行时环境
- **Express.js**: Web 框架
- **Puppeteer**: 浏览器自动化
- **Markdown-it**: Markdown 解析器

### 部署技术
- **Docker**: 容器化部署
- **Docker Compose**: 容器编排
- **Bash Scripts**: 自动化脚本
- **Systemd**: 服务管理 (可选)

## 📊 数据流

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CLI/Web   │───▶│   Express   │───▶│  Converter  │
│   Interface │    │   Server    │    │   Library   │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │  Puppeteer  │
                                    │   Browser   │
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │    Image    │
                                    │   Output    │
                                    └─────────────┘
```

1. **输入**: Markdown 文本 + 配置参数
2. **解析**: Markdown-it 解析为 HTML
3. **渲染**: Puppeteer 浏览器渲染
4. **生成**: 截图并优化为图片
5. **输出**: 返回图片数据

## 🔄 开发工作流

### 本地开发
```bash
# 1. 安装依赖
npm install

# 2. 启动前端开发服务器
npm run dev

# 3. 启动后端服务器
npm start

# 4. 构建生产版本
npm run build
```

### Docker 开发
```bash
# 构建镜像
docker compose build

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

## 📝 配置文件说明

### `package.json`
```json
{
  "name": "mdtopic",
  "main": "lib/markdown-converter.js",
  "bin": {
    "mdtopic": "./index.js"
  },
  "scripts": {
    "start": "node src/server/server.js",
    "dev": "cd src/web && vite",
    "build": "cd src/web && vite build"
  }
}
```

### `docker-compose.yml`
```yaml
services:
  mdtopic:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

## 🔍 关键文件详解

### `lib/markdown-converter.js`
核心转换逻辑，包含：
- `convertMarkdownToImage()`: 主转换函数
- `convertMarkdownFileToImage()`: 文件转换
- `convertMarkdownToBase64()`: Base64 输出
- 样式应用和优化算法

### `src/server/server.js`
Web 服务器，提供：
- `POST /api/convert`: 转换接口
- `GET /api/options`: 配置选项
- `GET /api/health`: 健康检查
- 静态文件服务

### `src/web/App.jsx`
前端主组件，包含：
- Markdown 编辑器
- 实时预览
- 参数配置
- 文件下载

## 🚀 扩展指南

### 添加新的输出格式
1. 修改 `lib/markdown-converter.js`
2. 更新 `src/server/server.js` API
3. 添加前端配置选项

### 添加新的样式主题
1. 在 `src/config/css-styles.js` 添加样式
2. 更新配置选项
3. 添加前端主题选择器

### 集成新的渲染引擎
1. 在 `lib/` 目录创建新模块
2. 实现标准接口
3. 更新主转换器调用

## 📚 相关文档

- [安装指南](INSTALLATION.md) - 详细安装说明
- [API 参考](API_REFERENCE.md) - 接口文档
- [部署指南](DEPLOYMENT.md) - 生产部署
- [开发指南](DEVELOPMENT.md) - 开发环境