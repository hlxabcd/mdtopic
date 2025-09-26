const express = require('express');
const path = require('path');
const { 
  convertMarkdownToImage, 
  convertMarkdownFileToImage,
  convertMarkdownToBase64 
} = require('../../lib/markdown-converter');

const app = express();
const port = 3000;

// 配置中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../../dist')));

// API路由 - 转换Markdown为图片
app.post('/api/convert', async (req, res) => {
  try {
    const { markdown, options = {} } = req.body;
    
    if (!markdown || typeof markdown !== 'string') {
      return res.status(400).json({ 
        error: '请提供有效的Markdown内容',
        code: 'INVALID_MARKDOWN'
      });
    }

    if (markdown.length > 100000) {
      return res.status(400).json({ 
        error: 'Markdown内容过长，请限制在100KB以内',
        code: 'CONTENT_TOO_LARGE'
      });
    }

    // 使用核心转换器
    const imageBuffer = await convertMarkdownToImage(markdown, {
      width: options.width || 800,
      format: options.format || 'png',
      quality: options.quality || 90,
      theme: options.theme || 'default',
      customCss: options.customCss || ''
    });

    // 设置响应头
    const contentType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    res.set({
      'Content-Type': contentType,
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'no-cache'
    });
    
    res.send(imageBuffer);
  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({ 
      error: '图片生成失败，请重试',
      code: 'CONVERSION_FAILED',
      details:  error.message 
    });
  }
});

// API路由 - 获取支持的选项
app.get('/api/options', (req, res) => {
  res.json({
    formats: ['png', 'jpeg', 'webp'], // 添加WebP支持
    theme: 'default', // 固定使用默认主题，确保统一风格
    widthRange: { min: 200, max: 3000, default: 800 },
    qualityRange: { min: 1, max: 100, default: 75 }, // 平衡质量和大小
    scaleRange: { min: 1, max: 3, default: 2 }, // 保持高清晰度
    maxContentLength: 100000,
    note: 'Web和CLI模式使用统一的默认样式，确保视觉效果一致。推荐使用WebP格式获得更小的文件大小'
  });
});

// API路由 - 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mdtopic-web-server',
    version: require('../../package.json').version,
    timestamp: new Date().toISOString()
  });
});

// 处理所有其他路由，返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    error: '服务器内部错误',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// 启动服务器
const server = app.listen(port, () => {
  console.log(`🚀 MDTopic Web服务器已启动`);
  console.log(`📍 访问地址: http://localhost:${port}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，开始优雅关闭...');
  server.close(() => {
    console.log('✅ Web服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，开始优雅关闭...');
  server.close(() => {
    console.log('✅ Web服务器已关闭');
    process.exit(0);
  });
});

module.exports = app;