/**
 * Emoji回退方案
 * 当服务器不支持彩色emoji时，使用图片或Unicode替换
 */

// 常用emoji映射表 - 可以替换为图片URL或Unicode
const EMOJI_FALLBACK_MAP = {
  // 基础表情
  '😀': '😀', // 保持Unicode，某些系统可能支持
  '😭': '😭',
  '🤔': '🤔',
  '💯': '💯',
  
  // 工具图标
  '⭐': '★',  // 使用黑白Unicode替代
  '✅': '✓',  
  '❌': '✗',
  '🚀': '↑',
  '📝': '📄',
  '🎯': '◉',
  '🛠️': '🔧',
  '🔍': '🔎',
  '🎨': '🎭',
  '🔧': '⚙',
  '🆕': 'NEW',
  
  // 其他常用
  '💻': '💻',
  '📱': '📱',
  '⌚': '⌚',
  '🎵': '♪',
  '🎮': '🎮',
  '🏆': '🏆',
  '🌟': '⭐',
  '🔥': '🔥'
};

// 图片emoji备用方案 (可选)
const EMOJI_IMAGE_MAP = {
  '😀': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f600.png',
  '🎨': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3a8.png',
  '⭐': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png',
  '✅': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2705.png',
  '❌': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/274c.png',
  '🚀': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png'
};

/**
 * 应用emoji回退策略
 * @param {string} text - 包含emoji的文本
 * @param {string} strategy - 回退策略: 'unicode', 'symbol', 'image'
 * @returns {string} 处理后的文本
 */
function applyEmojiFallback(text, strategy = 'symbol') {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  let result = text;
  
  switch (strategy) {
    case 'unicode':
      // 保持原始emoji Unicode (适用于部分支持的系统)
      break;
      
    case 'symbol':
      // 替换为简单符号
      Object.entries(EMOJI_FALLBACK_MAP).forEach(([emoji, replacement]) => {
        result = result.replace(new RegExp(emoji, 'g'), replacement);
      });
      break;
      
    case 'image':
      // 替换为图片标签 (适用于HTML渲染)
      Object.entries(EMOJI_IMAGE_MAP).forEach(([emoji, imageUrl]) => {
        const imgTag = `<img src="${imageUrl}" alt="${emoji}" style="width:1em;height:1em;vertical-align:middle;" />`;
        result = result.replace(new RegExp(emoji, 'g'), imgTag);
      });
      break;
      
    case 'remove':
      // 完全移除emoji
      // 使用Unicode emoji范围正则表达式
      result = result.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
      break;
      
    default:
      // 默认保持原样
      break;
  }
  
  return result;
}

/**
 * 检测当前环境是否支持彩色emoji
 * @returns {Promise<boolean>} 是否支持彩色emoji
 */
async function detectEmojiSupport() {
  // 这是一个简化的检测，实际应该通过渲染测试
  // 在服务器端，可以通过环境变量或配置文件设置
  const serverEmojiSupport = process.env.EMOJI_SUPPORT || 'auto';
  
  if (serverEmojiSupport === 'false' || serverEmojiSupport === 'no') {
    return false;
  }
  
  if (serverEmojiSupport === 'true' || serverEmojiSupport === 'yes') {
    return true;
  }
  
  // 自动检测逻辑 (简化版)
  // 实际项目中应该通过渲染测试来判断
  return true; // 默认假设支持
}

/**
 * 智能emoji处理
 * 根据环境自动选择最佳的emoji显示策略
 * @param {string} text - 包含emoji的文本
 * @returns {Promise<string>} 处理后的文本
 */
async function smartEmojiProcess(text) {
  const supportsEmoji = await detectEmojiSupport();
  
  if (supportsEmoji) {
    return text; // 保持原样
  }
  
  // 不支持彩色emoji，使用回退策略
  return applyEmojiFallback(text, 'symbol');
}

/**
 * 为特定服务器环境设置emoji策略
 * @param {string} strategy - 强制使用的策略
 */
function setEmojiStrategy(strategy) {
  process.env.EMOJI_FALLBACK_STRATEGY = strategy;
}

/**
 * 获取当前emoji策略
 * @returns {string} 当前策略
 */
function getEmojiStrategy() {
  return process.env.EMOJI_FALLBACK_STRATEGY || 'auto';
}

module.exports = {
  applyEmojiFallback,
  detectEmojiSupport,
  smartEmojiProcess,
  setEmojiStrategy,
  getEmojiStrategy,
  EMOJI_FALLBACK_MAP,
  EMOJI_IMAGE_MAP
};
