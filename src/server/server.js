const express = require('express');
const path = require('path');
const { 
  convertMarkdownToImage, 
  convertMarkdownFileToImage,
  convertMarkdownToBase64 
} = require('../../lib/markdown-converter');
const { getQueryConfig } = require('../config/alipay');

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

    // 使用核心转换器 - 默认使用local主题确保字体效果
    const imageBuffer = await convertMarkdownToImage(markdown, {
      width: options.width || 800,
      format: options.format || 'png',
      quality: options.quality || 90,
      theme: options.theme || 'local',  // 改为默认使用local主题
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
    formats: ['png', 'jpeg', 'webp'],
    themes: ['default', 'dark', 'minimal', 'local'], // 添加主题选项
    defaultTheme: 'default', // 默认主题，会自动回退到local
    widthRange: { min: 200, max: 3000, default: 800 },
    qualityRange: { min: 1, max: 100, default: 75 },
    scaleRange: { min: 1, max: 3, default: 2 },
    maxContentLength: 100000,
    note: '智能字体加载：优先使用外部字体，网络问题时自动切换到本地字体确保渲染效果。'
  });
});

// API路由 - 获取查询类型配置（前端动态渲染）
app.get('/api/query/config', (req, res) => {
  const queries = getQueryConfig();
  res.json(queries.map(({ id, label, params }) => ({ id, label, params })));
});

// API路由 - 通用查询代理（支持多参数）
app.get('/api/query/exec', async (req, res) => {
  try {
    const { queryId, ...rest } = req.query;
    if (!queryId) {
      return res.status(400).json({ error: '请提供 queryId 参数' });
    }

    const queries = getQueryConfig();
    const queryDef = queries.find(q => q.id === queryId);
    if (!queryDef) {
      return res.status(400).json({ error: `未知的查询类型: ${queryId}` });
    }

    const params = new URLSearchParams();
    const missing = [];
    for (const p of queryDef.params) {
      const val = rest[p.name];
      if (!val || !val.trim()) {
        missing.push(p.label || p.name);
      } else {
        params.set(p.name, val.trim());
      }
    }
    if (missing.length) {
      return res.status(400).json({ error: `缺少参数: ${missing.join(', ')}` });
    }

    const targetUrl = `${queryDef.url}?${params}`;
    console.log(`[query] ${queryDef.label} -> ${targetUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const upstream = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({
        error: `上游服务返回 ${upstream.status}`,
        detail: text,
      });
    }

    const body = await upstream.text();
    res.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(body);
  } catch (err) {
    console.error('[query] 查询失败:', err);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: '上游服务超时' });
    }
    res.status(500).json({ error: '查询失败', detail: err.message });
  }
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