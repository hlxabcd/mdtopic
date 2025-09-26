# MDTopic 开发指南

## 🎯 开发环境搭建

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Git**: 最新版本
- **IDE**: 推荐 VS Code + 相关插件

### 推荐的 VS Code 插件
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

### 初始化开发环境
```bash
# 1. 克隆仓库
git clone <repository-url>
cd mdtopic

# 2. 安装依赖
npm install

# 3. 启动开发环境
npm run dev      # 前端开发服务器 (http://localhost:5173)
npm start        # 后端服务器 (http://localhost:3000)
```

---

## 🏗️ 项目架构

### 技术栈
```
前端层：React + Vite + CSS3
服务层：Node.js + Express + RESTful API  
核心层：Puppeteer + markdown-it
部署层：Docker + Nginx
```

### 模块依赖关系
```
CLI工具 (index.js)
    ↓
Web服务 (src/server/)
    ↓
核心转换器 (lib/markdown-converter.js)
    ↓
配置系统 (src/config/)
    ↓
样式系统 (src/config/css-styles.js)
```

### 数据流向
```
用户输入 → 参数验证 → 内容分析 → 样式生成 → 浏览器渲染 → 图片输出
```

---

## 📁 代码组织

### 目录结构说明
```
src/
├── config/           # 配置模块
│   ├── config.js     # 主配置：Puppeteer、图片、超时等
│   └── css-styles.js # CSS构建器：主题、布局、字体
├── server/           # 后端服务
│   └── server.js     # Express应用：路由、中间件、错误处理
└── web/              # 前端应用
    ├── App.jsx       # 主组件：布局、状态管理
    ├── App.css       # 样式文件：响应式、主题
    ├── main.jsx      # React入口
    ├── index.html    # HTML模板
    └── vite.config.js # 构建配置
```

### 核心模块详解

#### 1. 配置系统 (`src/config/`)
```javascript
// config.js 主要功能
- createMarkdownRenderer()    // 创建Markdown解析器
- getPuppeteerConfig()        // Puppeteer启动配置
- getImageConfig()            // 图片生成配置
- validateOptions()           // 参数验证
- analyzeContentComplexity()  // 智能内容分析
- getOptimizedConfig()        // 智能优化配置
```

#### 2. 样式系统 (`src/config/css-styles.js`)
```javascript
// css-styles.js 主要功能
- buildCSS()                  // 构建完整CSS
- getBaseStyles()             // 基础样式
- getCodeStyles()             // 代码高亮
- getTableStyles()            // 表格样式
- getTaskListStyles()         // 任务列表样式
- getFontConfig()             // 字体配置
```

#### 3. 转换引擎 (`lib/markdown-converter.js`)
```javascript
// MarkdownConverter 类
class MarkdownConverter {
  constructor(config)         // 初始化配置
  getBrowser()               // 获取/创建浏览器实例
  createHTMLDocument()       // 生成HTML文档
  convertToBuffer()          // 转换为图片Buffer
  convertToBase64()          // 转换为Base64
  convertFileToFile()        // 文件转文件
  closeBrowser()             // 清理资源
}
```

---

## 🔧 开发工作流

### 1. 功能开发流程
```bash
# 创建功能分支
git checkout -b feature/new-feature

# 开发过程
npm run dev     # 启动前端开发服务器
npm start       # 启动后端服务器
npm test        # 运行测试

# 代码提交
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. 调试技巧

#### 前端调试
```javascript
// 在React组件中
console.log('Component state:', state);
debugger; // 设置断点

// 网络请求调试
fetch('/api/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markdown: '# Test' })
})
.then(response => {
  console.log('Response status:', response.status);
  return response.blob();
})
.catch(error => console.error('Error:', error));
```

#### 后端调试
```javascript
// 服务器端调试
app.post('/api/convert', async (req, res) => {
  console.log('Request body:', req.body);
  
  try {
    const result = await convertMarkdownToImage(markdown, options);
    console.log('Conversion success, size:', result.length);
    res.send(result);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### Puppeteer调试
```javascript
// 开启可视化调试
const browser = await puppeteer.launch({ 
  headless: false,  // 显示浏览器窗口
  devtools: true    // 打开开发者工具
});

// 页面调试
await page.evaluate(() => {
  console.log('Page content:', document.body.innerHTML);
  debugger; // 在浏览器中设置断点
});
```

### 3. 测试策略

#### 单元测试
```javascript
// 测试转换器核心功能
const { convertMarkdownToImage } = require('./lib/markdown-converter');

test('should convert simple markdown', async () => {
  const markdown = '# Test Header\n\nThis is **bold** text.';
  const imageBuffer = await convertMarkdownToImage(markdown);
  
  expect(imageBuffer).toBeDefined();
  expect(imageBuffer.length).toBeGreaterThan(1000);
});
```

#### 集成测试
```bash
# API测试
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Test"}' \
  --output test.png && echo "✅ API test passed"

# CLI测试
echo "# Test" > test.md
npx mdtopic convert test.md test-output.png
[ -f test-output.png ] && echo "✅ CLI test passed"
```

#### 性能测试
```javascript
// 性能基准测试
const { performance } = require('perf_hooks');

async function benchmarkConversion() {
  const start = performance.now();
  await convertMarkdownToImage(largeMarkdownContent);
  const end = performance.now();
  
  console.log(`Conversion took ${end - start} ms`);
}
```

---

## 🎨 UI/UX 开发

### React组件结构
```jsx
// App.jsx 组件层次
<App>
  <Header />
  <main>
    <InputSection>
      <MarkdownEditor />
      <OptionsPanel />
    </InputSection>
    <OutputSection>
      <PreviewArea />
      <ConvertButton />
      <DownloadArea />
    </OutputSection>
  </main>
  <Footer />
</App>
```

### 状态管理
```javascript
// 使用React Hooks管理状态
const [markdown, setMarkdown] = useState('');
const [options, setOptions] = useState({
  width: 800,
  format: 'png',
  quality: 90
});
const [isConverting, setIsConverting] = useState(false);
const [result, setResult] = useState(null);

// 转换处理
const handleConvert = async () => {
  setIsConverting(true);
  try {
    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown, options })
    });
    
    if (response.ok) {
      const blob = await response.blob();
      setResult(URL.createObjectURL(blob));
    }
  } catch (error) {
    console.error('Conversion failed:', error);
  } finally {
    setIsConverting(false);
  }
};
```

### 响应式设计
```css
/* 移动端适配 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 1rem;
  }
  
  .editor {
    height: 200px;
    font-size: 14px;
  }
  
  .options-panel {
    position: relative;
    width: 100%;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .container {
    max-width: 900px;
  }
}
```

---

## 🔌 API 扩展

### 添加新的API端点
```javascript
// 在 src/server/server.js 中添加
app.get('/api/templates', (req, res) => {
  const templates = [
    { id: 'blog', name: '博客文章', template: '# 标题\n\n内容...' },
    { id: 'doc', name: '技术文档', template: '## 概述\n\n描述...' }
  ];
  res.json(templates);
});

app.post('/api/batch-convert', async (req, res) => {
  const { files } = req.body;
  const results = [];
  
  for (const file of files) {
    try {
      const result = await convertMarkdownToImage(file.markdown, file.options);
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  res.json(results);
});
```

### 中间件扩展
```javascript
// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 添加CORS支持
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🎛️ 配置系统扩展

### 添加新的输出格式
```javascript
// 在 src/config/config.js 中扩展
const SUPPORTED_FORMATS = {
  png: { mime: 'image/png', extension: 'png' },
  jpeg: { mime: 'image/jpeg', extension: 'jpg' },
  webp: { mime: 'image/webp', extension: 'webp' },
  pdf: { mime: 'application/pdf', extension: 'pdf' }  // 新增PDF支持
};

// 扩展转换选项
function getImageConfig(options = {}) {
  const config = {
    ...DEFAULT_CONFIG.image,
    ...options
  };
  
  // 新增PDF特殊处理
  if (config.format === 'pdf') {
    config.printBackground = true;
    config.preferCSSPageSize = true;
  }
  
  return config;
}
```

### 添加新主题
```javascript
// 在 src/config/css-styles.js 中添加
const THEMES = {
  default: {
    background: '#ffffff',
    text: '#333333',
    accent: '#007acc'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    accent: '#4fc3f7'
  },
  github: {  // 新增GitHub风格主题
    background: '#ffffff',
    text: '#24292e',
    accent: '#0366d6',
    border: '#e1e4e8'
  }
};
```

---

## 🧩 插件系统

### 创建Markdown插件
```javascript
// 自定义markdown-it插件
function customPlugin(md) {
  md.renderer.rules.custom_block = function(tokens, idx) {
    const token = tokens[idx];
    return `<div class="custom-block">${token.content}</div>`;
  };
}

// 在转换器中使用
const md = new MarkdownIt()
  .use(markdownItTaskLists)
  .use(customPlugin);
```

### 创建样式插件
```javascript
// 样式插件系统
const stylePlugins = {
  codeTheme: (theme) => {
    return theme === 'github' 
      ? `.hljs { background: #f6f8fa; }`
      : `.hljs { background: #2d3748; }`;
  },
  
  typography: (options) => {
    return `
      body { 
        font-family: ${options.fontFamily}; 
        line-height: ${options.lineHeight};
      }
    `;
  }
};
```

---

## 🔍 调试和故障排除

### 常见开发问题

#### 1. 浏览器启动失败
```javascript
// 调试Puppeteer配置
const browser = await puppeteer.launch({
  headless: false,
  devtools: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

console.log('Browser version:', await browser.version());
```

#### 2. 内存泄漏
```javascript
// 监控内存使用
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Memory: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);
}, 5000);

// 确保资源清理
process.on('exit', async () => {
  await globalConverter.closeBrowser();
});
```

#### 3. 样式不生效
```javascript
// 调试CSS生成
console.log('Generated CSS:', buildCSS(options));

// 检查HTML结构
const html = createHTMLDocument(markdown, options);
console.log('HTML structure:', html);
```

### 性能分析
```javascript
// 启用详细性能日志
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.time('conversion');
  const result = await convertMarkdownToImage(markdown);
  console.timeEnd('conversion');
  
  console.log('Result size:', result.length);
  console.log('Memory usage:', process.memoryUsage());
}
```

---

## 📚 代码规范

### ESLint配置
```json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Git Hooks
```bash
# .husky/pre-commit
#!/usr/bin/env sh
npm run lint
npm run test
```

### 提交信息规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

---

## 🚀 发布流程

### 版本管理
```bash
# 更新版本号
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0  
npm version major   # 1.0.0 -> 2.0.0

# 推送标签
git push origin --tags
```

### 构建发布
```bash
# 清理和构建
npm run clean
npm run build
npm test

# Docker镜像构建
docker build -t mdtopic:latest .
docker tag mdtopic:latest mdtopic:v2.0.0
```

### 部署检查清单
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 版本号已更新
- [ ] Docker镜像构建成功
- [ ] 性能基准测试正常
- [ ] 安全扫描通过

---

📝 更新日期：2025-08-28  
👨‍💻 开发版本：v2.0.0





