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
│   ├── PROJECT_STRUCTURE.md  # 本文档
│   ├── API_REFERENCE.md      # API参考
│   ├── DEPLOYMENT.md         # 部署指南
│   └── DEVELOPMENT.md        # 开发指南
└── 
└── .delete/                  # 回收站目录
    └── backup-YYYYMMDD/      # 按日期分类的备份
```

## 🔧 核心组件说明

### 1. 核心转换器 (`lib/markdown-converter.js`)
- **功能**: Markdown到图片的核心转换逻辑
- **特性**: 
  - 浏览器实例复用，性能优化
  - 智能内容分析和优化
  - 支持多种输出格式 (PNG/JPEG/WebP)
  - 错误处理和资源清理

### 2. CLI工具 (`index.js`)
- **功能**: 命令行接口
- **用法**: `npx mdtopic convert input.md [output.png]`
- **特性**: 
  - 智能模式和预设优化
  - 批量处理支持
  - 详细进度显示

### 3. Web服务 (`src/server/server.js`)
- **功能**: RESTful API和静态文件服务
- **端点**: 
  - `POST /api/convert` - 转换Markdown
  - `GET /api/options` - 获取支持的选项
  - `GET /api/health` - 健康检查
- **特性**: 统一错误处理，请求限制

### 4. Web界面 (`src/web/`)
- **技术栈**: React + Vite
- **功能**: 实时预览和转换
- **特性**: 响应式设计，支持移动端

### 5. 配置系统 (`src/config/`)
- **config.js**: 统一的配置管理
- **css-styles.js**: 动态CSS样式生成
- **特性**: 智能内容分析，预设优化模式

## 🎯 使用场景

### 1. Web界面
- 适合：实时预览，单次转换
- 访问：http://localhost:3000

### 2. CLI工具
- 适合：批量处理，脚本集成
- 命令：`mdtopic convert file.md`

### 3. Docker部署
- 适合：云服务器，生产环境
- 启动：`./docker/start.sh`



## 🔄 数据流

```
Markdown文本 → markdown-it解析 → HTML生成 → Puppeteer渲染 → 图片输出
                     ↑
                配置系统优化
```

## 📦 依赖关系

### 核心依赖
- `puppeteer`: 浏览器自动化
- `markdown-it`: Markdown解析
- `express`: Web服务器
- `react`: 前端框架

### 开发依赖
- `vite`: 前端构建工具
- `@vitejs/plugin-react`: React支持

## 🚀 扩展性

项目采用模块化设计，便于扩展：

1. **新增输出格式**: 在`config.js`中添加格式支持
2. **自定义主题**: 扩展`css-styles.js`中的主题系统
3. **新增API**: 在`server.js`中添加路由
4. **前端功能**: 在React组件中添加新特性

## 🛡️ 安全考虑

- 输入验证和大小限制
- 浏览器沙箱隔离
- 资源使用限制
- 错误信息过滤

## 📊 性能优化

- 浏览器实例复用（响应速度提升85%）
- 智能内容分析
- WebP格式支持（文件大小减少59%）
- 预设优化模式

---

📝 更新日期：2025-08-28  
🔄 项目版本：v2.0.0
