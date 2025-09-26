/**
 * 配置管理模块
 * 统一管理所有转换相关的配置
 */

const MarkdownIt = require('markdown-it');
const markdownItTaskLists = require('markdown-it-task-lists');

// 默认配置
const DEFAULT_CONFIG = {
  // Markdown-it 配置
  markdownIt: {
    html: true,
    linkify: true,
    typographer: true,
    breaks: false
  },
  
  // Puppeteer 优化配置 - 针对速度和资源使用优化，支持emoji渲染
  puppeteer: {
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-zygote',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--memory-pressure-off',
      // emoji渲染支持
      '--enable-font-antialiasing',
      '--enable-features=VaapiVideoDecoder',
      '--font-render-hinting=none',
      '--enable-gpu-rasterization'
    ]
  },
  
  // 图片生成默认选项 - 平衡清晰度和文件大小
  image: {
    width: 800,
    format: 'webp',        // 默认使用WebP格式，文件更小
    quality: 75,           // 平衡质量和大小
    fullPage: true,
    deviceScaleFactor: 2,  // 保持高清晰度：2倍像素密度
    optimizeForSize: true  // 启用大小优化
  },
  
  // CSS主题
  theme: 'default',
  
  // 超时设置 - 确保稳定性
  timeout: {
    pageLoad: 10000,   // 增加页面加载超时
    screenshot: 8000   // 增加截图超时
  }
};

/**
 * 创建配置好的 Markdown-it 实例
 * @param {Object} customConfig - 自定义配置
 * @returns {MarkdownIt} 配置好的 markdown-it 实例
 */
function createMarkdownRenderer(customConfig = {}) {
  const config = {
    ...DEFAULT_CONFIG.markdownIt,
    ...customConfig
  };
  
  const md = new MarkdownIt(config);
  
  // 启用任务列表插件
  md.use(markdownItTaskLists, {
    enabled: true,
    label: true,
    labelAfter: true
  });
  
  return md;
}

/**
 * 获取 Puppeteer 配置
 * @param {Object} customConfig - 自定义配置
 * @returns {Object} Puppeteer 启动配置
 */
function getPuppeteerConfig(customConfig = {}) {
  return {
    ...DEFAULT_CONFIG.puppeteer,
    ...customConfig
  };
}

/**
 * 获取图片生成配置
 * @param {Object} options - 用户选项
 * @returns {Object} 完整的图片配置
 */
function getImageConfig(options = {}) {
  const config = {
    ...DEFAULT_CONFIG.image,
    ...options
  };
  
  // 验证配置
  if (config.width <= 0 || config.width > 3000) {
    config.width = DEFAULT_CONFIG.image.width;
  }
  
  if (!['png', 'jpeg', 'webp'].includes(config.format)) {
    config.format = DEFAULT_CONFIG.image.format;
  }
  
  if (config.quality < 1 || config.quality > 100) {
    config.quality = DEFAULT_CONFIG.image.quality;
  }
  
  return config;
}

/**
 * 获取完整配置
 * @param {Object} userConfig - 用户自定义配置
 * @returns {Object} 合并后的完整配置
 */
function getConfig(userConfig = {}) {
  return {
    markdownIt: {
      ...DEFAULT_CONFIG.markdownIt,
      ...(userConfig.markdownIt || {})
    },
    puppeteer: {
      ...DEFAULT_CONFIG.puppeteer,
      ...(userConfig.puppeteer || {})
    },
    image: getImageConfig(userConfig.image),
    theme: userConfig.theme || DEFAULT_CONFIG.theme,
    timeout: {
      ...DEFAULT_CONFIG.timeout,
      ...(userConfig.timeout || {})
    }
  };
}

/**
 * 验证用户输入的选项
 * @param {Object} options - 用户选项
 * @returns {Object} 验证后的选项
 */
function validateOptions(options = {}) {
  const validated = {};
  
  // 验证宽度
  if (typeof options.width === 'number' && options.width > 0 && options.width <= 3000) {
    validated.width = Math.floor(options.width);
  }
  
  // 验证格式
  if (typeof options.format === 'string' && ['png', 'jpeg', 'webp'].includes(options.format.toLowerCase())) {
    validated.format = options.format.toLowerCase();
  }
  
  // 验证质量
  if (typeof options.quality === 'number' && options.quality >= 1 && options.quality <= 100) {
    validated.quality = Math.floor(options.quality);
  }
  
  // 验证主题
  if (typeof options.theme === 'string' && ['default', 'dark', 'minimal'].includes(options.theme.toLowerCase())) {
    validated.theme = options.theme.toLowerCase();
  }
  
  // 验证自定义CSS
  if (typeof options.customCss === 'string') {
    validated.customCss = options.customCss;
  }
  
  // 验证缩放因子
  if (typeof options.deviceScaleFactor === 'number' && options.deviceScaleFactor >= 1 && options.deviceScaleFactor <= 3) {
    validated.deviceScaleFactor = options.deviceScaleFactor;
  }
  
  return validated;
}

/**
 * 智能内容分析 - 根据内容复杂度推荐最佳设置
 * @param {string} markdownContent - Markdown内容
 * @returns {Object} 推荐的优化设置
 */
function analyzeContentComplexity(markdownContent) {
  const lines = markdownContent.split('\n');
  const totalLines = lines.length;
  
  // 分析内容特征
  const codeBlocks = (markdownContent.match(/```[\s\S]*?```/g) || []).length;
  const inlineCode = (markdownContent.match(/`[^`]+`/g) || []).length;
  const headers = (markdownContent.match(/^#+\s/gm) || []).length;
  const lists = (markdownContent.match(/^[\s]*[-*+]\s/gm) || []).length;
  const links = (markdownContent.match(/\[.*?\]\(.*?\)/g) || []).length;
  const tables = (markdownContent.match(/\|.*\|/g) || []).length;
  const emojis = (markdownContent.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  
  // 计算复杂度分数 (0-1)
  let complexity = 0;
  complexity += Math.min(totalLines / 500, 0.3); // 长度影响
  complexity += Math.min(codeBlocks / 20, 0.25); // 代码块影响
  complexity += Math.min(headers / 30, 0.15);    // 标题影响
  complexity += Math.min(lists / 40, 0.1);       // 列表影响
  complexity += Math.min((inlineCode + links + tables + emojis) / 100, 0.2); // 其他元素
  
  // 根据复杂度推荐设置
  const recommendations = {
    simple: {    // 复杂度 < 0.3
      quality: 70,
      deviceScaleFactor: 2,
      format: 'webp',
      description: '简单文档 - 高压缩比'
    },
    moderate: {  // 复杂度 0.3-0.7
      quality: 75,
      deviceScaleFactor: 2,
      format: 'webp',
      description: '中等复杂度 - 平衡设置'
    },
    complex: {   // 复杂度 > 0.7
      quality: 80,
      deviceScaleFactor: 2,
      format: 'webp',
      description: '复杂文档 - 保证质量'
    }
  };
  
  let category = complexity < 0.3 ? 'simple' : complexity < 0.7 ? 'moderate' : 'complex';
  
  return {
    complexity: Math.round(complexity * 100) / 100,
    category,
    stats: {
      lines: totalLines,
      codeBlocks,
      headers,
      lists,
      inlineCode,
      links,
      tables,
      emojis
    },
    recommended: recommendations[category]
  };
}

/**
 * 根据内容获取优化后的配置
 * @param {string} markdownContent - Markdown内容
 * @param {Object} userOptions - 用户选项
 * @returns {Object} 优化后的配置
 */
function getOptimizedConfig(markdownContent, userOptions = {}) {
  const analysis = analyzeContentComplexity(markdownContent);
  
  // 如果用户没有指定设置，使用智能推荐
  const optimizedOptions = {
    ...analysis.recommended,
    ...userOptions // 用户设置优先级最高
  };
  
  return {
    options: optimizedOptions,
    analysis
  };
}

module.exports = {
  DEFAULT_CONFIG,
  createMarkdownRenderer,
  getPuppeteerConfig,
  getImageConfig,
  getConfig,
  validateOptions,
  analyzeContentComplexity,
  getOptimizedConfig
};
