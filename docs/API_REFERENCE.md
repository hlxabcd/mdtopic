# MDTopic API 参考文档

## 🌐 Web API

### 基础信息
- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **响应格式**: JSON (错误) / Binary (图片)

---

## 📋 API 端点

### 1. 转换Markdown为图片
```http
POST /api/convert
```

#### 请求参数
```json
{
  "markdown": "string",           // 必需：Markdown内容
  "options": {                    // 可选：转换选项
    "width": 800,                 // 图片宽度 (200-3000)
    "format": "png",              // 输出格式 (png|jpeg|webp)
    "quality": 90,                // 图片质量 (1-100)
    "theme": "default",           // 主题 (default|dark|minimal)
    "customCss": ""               // 自定义CSS样式
  }
}
```

#### 成功响应
- **Status**: `200 OK`
- **Content-Type**: `image/png` | `image/jpeg` | `image/webp`
- **Body**: 二进制图片数据

#### 错误响应
```json
{
  "error": "错误描述",
  "code": "错误代码",
  "details": "详细错误信息"
}
```

#### 错误代码
- `INVALID_MARKDOWN`: Markdown内容无效或为空
- `CONTENT_TOO_LARGE`: 内容超过100KB限制
- `CONVERSION_FAILED`: 图片生成失败

#### 示例请求
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is **bold** text.",
    "options": {
      "width": 800,
      "format": "png",
      "quality": 90
    }
  }' \
  --output output.png
```

---

### 2. 获取支持的选项
```http
GET /api/options
```

#### 响应
```json
{
  "formats": ["png", "jpeg", "webp"],
  "theme": "default",
  "widthRange": {
    "min": 200,
    "max": 3000,
    "default": 800
  },
  "qualityRange": {
    "min": 1,
    "max": 100,
    "default": 75
  },
  "scaleRange": {
    "min": 1,
    "max": 3,
    "default": 2
  },
  "maxContentLength": 100000,
  "note": "统一使用默认样式，确保视觉效果一致"
}
```

---

### 3. 健康检查
```http
GET /api/health
```

#### 响应
```json
{
  "status": "ok",
  "service": "mdtopic-web-server",
  "version": "2.0.0",
  "timestamp": "2025-08-28T08:10:11.147Z"
}
```

---

## 💻 CLI API

### 基础命令
```bash
mdtopic convert <input> [output] [options]
```

### 参数说明

#### 位置参数
- `<input>`: Markdown文件路径（必需）
- `[output]`: 输出图片路径（可选，默认为输入文件名.webp）

#### 选项参数
```bash
-w, --width <number>     图片宽度（像素），默认800
-f, --format <type>      图片格式 (png|jpeg|webp)，默认webp  
-q, --quality <number>   图片质量 (1-100)，默认75
-t, --theme <name>       主题样式 (default|dark|minimal)，默认default
--css <file>             自定义CSS文件路径
--scale <number>         像素密度 (1-3)，默认2
--smart                  启用智能优化模式
--preset <mode>          预设模式 (web|mobile|print|archive)
--verbose                显示详细输出
```

### 预设模式详解

#### Web模式 (`--preset web`)
- **用途**: 网页展示，社交媒体分享
- **特点**: 平衡质量和文件大小
- **设置**: WebP格式，质量75，2倍缩放

#### Mobile模式 (`--preset mobile`)
- **用途**: 移动设备查看，减少流量
- **特点**: 优化文件大小，保持可读性
- **设置**: WebP格式，质量65，1.5倍缩放

#### Print模式 (`--preset print`)
- **用途**: 打印输出，文档存档
- **特点**: 最高质量，优化打印效果
- **设置**: PNG格式，质量95，3倍缩放

#### Archive模式 (`--preset archive`)
- **用途**: 长期存档，无损保存
- **特点**: 无损格式，完整保真
- **设置**: PNG格式，质量100，2倍缩放

### CLI 示例

#### 基础转换
```bash
# 使用默认设置
mdtopic convert README.md

# 指定输出文件
mdtopic convert input.md output.png
```

#### 自定义参数
```bash
# 高质量PNG输出
mdtopic convert doc.md --format png --quality 95 --width 1200

# 移动优化
mdtopic convert article.md --preset mobile

# 智能优化
mdtopic convert complex.md --smart --verbose
```

#### 批量处理
```bash
# 转换目录下所有.md文件
for file in *.md; do
  mdtopic convert "$file" --preset web
done
```

---

## 🔧 JavaScript API

### 核心库使用

```javascript
const { 
  convertMarkdownToImage, 
  convertMarkdownFileToImage,
  convertMarkdownToBase64 
} = require('mdtopic/lib/markdown-converter');

// 直接转换Markdown文本
const imageBuffer = await convertMarkdownToImage(markdownText, {
  width: 800,
  format: 'webp',
  quality: 75
});

// 转换文件
await convertMarkdownFileToImage('input.md', 'output.png', {
  format: 'png',
  quality: 90
});

// 转换为Base64
const result = await convertMarkdownToBase64(markdownText, {
  format: 'webp'
});
console.log(result.dataUrl); // data:image/webp;base64,xxxxx
```

### 自定义转换器

```javascript
const { MarkdownConverter, createConverter } = require('mdtopic/lib/markdown-converter');

// 创建自定义转换器
const converter = createConverter({
  timeout: { pageLoad: 10000 },
  puppeteer: { headless: true }
});

// 使用转换器
const imageBuffer = await converter.convertToBuffer(markdownText, options);

// 记得清理资源
await converter.closeBrowser();
```

---



## 📊 性能监控

### 性能指标
转换过程会输出详细的性能分析：

```
🔍 性能分析 (总计3924ms):
  📱 浏览器初始化: 1682ms (42.9%)
  🔧 页面设置: 199ms (5.1%)
  📄 内容加载: 1851ms (47.2%)
  📸 截图生成: 192ms (4.9%)

🧠 智能分析:
  📊 复杂度: 0.19 (simple)
  📝 内容: 13行, 1代码块, 1标题
  ⚙️ 推荐: 简单文档 - 高压缩比
  🎛️ 设置: 质量90, 格式png
```

### 性能优化建议
- 使用浏览器实例复用（避免频繁初始化）
- 启用智能优化模式
- 选择合适的预设模式
- 使用WebP格式减少文件大小

---

## 🔒 限制和配额

### Web API限制
- **请求大小**: 最大10MB
- **Markdown内容**: 最大100KB
- **并发请求**: 基于系统资源自动限制
- **超时设置**: 页面加载5秒，截图10秒

### 输出限制
- **图片宽度**: 200-3000像素
- **图片质量**: 1-100
- **支持格式**: PNG, JPEG, WebP
- **像素密度**: 1-3倍

---

## 🐛 错误处理

### 常见错误及解决方案

#### 1. 浏览器启动失败
```
错误: 图片生成失败: Browser launch failed
解决: 检查系统依赖，确保Chromium正确安装
```

#### 2. 内容过大
```
错误: Markdown内容过长，请限制在100KB以内
解决: 分割大文档或增加配置限制
```

#### 3. 格式不支持
```
错误: 不支持的图片格式
解决: 使用png、jpeg或webp格式
```

#### 4. 权限问题
```
错误: 无法写入输出文件
解决: 检查文件路径权限，确保目录存在
```

---

📝 更新日期：2025-08-28  
🔄 API版本：v2.0.0
