/**
 * CSS样式管理模块
 * 统一管理所有Markdown转换的样式
 */

// 默认的GitHub风格CSS样式 - 优化版
const DEFAULT_CSS = `
/* 条件加载字体，优先使用本地字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Roboto', 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'Noto Sans CJK SC', 'Noto Sans', 'Liberation Sans', 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.6;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  color: #24292f;
  background-color: #ffffff;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 确保emoji正确显示 */
.emoji {
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  font-style: normal;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #24292f;
}

h1 { 
  font-size: 2em; 
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 12px;
  margin-bottom: 24px;
}

h2 { 
  font-size: 1.5em; 
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

h3 { font-size: 1.25em; }
h4 { font-size: 1.1em; }
h5 { font-size: 0.95em; }
h6 { font-size: 0.85em; color: #656d76; }

p {
  margin-bottom: 16px;
  color: #24292f;
  text-align: left;
}

ul, ol {
  margin-bottom: 16px;
  padding-left: 2em;
}

li {
  margin-bottom: 8px;
  color: #24292f;
}

pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  margin-bottom: 16px;
  border: 1px solid #d0d7de;
}

code {
  font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Roboto Mono', 'Liberation Mono', 'Fira Code', 'Consolas', 'DejaVu Sans Mono', 'Ubuntu Mono', monospace;
  font-size: 85%;
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  color: #24292f;
}

pre code {
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
}

blockquote {
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d1d9e0;
  margin: 16px 0;
  background-color: #f6f8fa;
  border-radius: 3px;
  padding: 8px 16px;
}

blockquote p {
  margin-bottom: 8px;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

table {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
  border: 1px solid #d1d9e0;
  border-radius: 6px;
  overflow: hidden;
}

table th, table td {
  padding: 6px 13px;
  border: 1px solid #d1d9e0;
  text-align: left;
}

table th {
  background-color: #f6f8fa;
  font-weight: 600;
}

table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

hr {
  border: none;
  border-top: 1px solid #d1d9e0;
  margin: 24px 0;
}

a {
  color: #0969da;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

strong {
  font-weight: 600;
}

em {
  font-style: italic;
}

/* 任务列表样式 */
.task-list-item {
  list-style: none;
  margin-left: -1.5em;
}

.task-list-item-checkbox {
  margin-right: 8px;
  margin-left: 0;
}

input[type="checkbox"] {
  margin-right: 8px;
}

/* 代码语法高亮的基本样式 */
.hljs {
  background: transparent !important;
}

.hljs-comment,
.hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #d73a49;
  font-weight: bold;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  color: #005cc5;
}

.hljs-string,
.hljs-doctag {
  color: #032f62;
}
`;

// 暗色主题样式
const DARK_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: #f0f6fc;
  background-color: #0d1117;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #f0f6fc;
}

h1 { 
  font-size: 2em; 
  border-bottom: 1px solid #30363d;
  padding-bottom: 10px;
}

h2 { 
  font-size: 1.5em; 
  border-bottom: 1px solid #30363d;
  padding-bottom: 8px;
}

pre {
  background-color: #161b22;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  margin-bottom: 16px;
  border: 1px solid #30363d;
}

code {
  background-color: #161b22;
  color: #f0f6fc;
  border: 1px solid #30363d;
}

blockquote {
  color: #8b949e;
  border-left: 0.25em solid #30363d;
  background-color: #161b22;
}

table {
  border: 1px solid #30363d;
}

table th, table td {
  border: 1px solid #30363d;
}

table th {
  background-color: #161b22;
}

table tr:nth-child(2n) {
  background-color: #161b22;
}
`;

// 简洁样式
const MINIMAL_CSS = `
body {
  font-family: Georgia, serif;
  line-height: 1.8;
  padding: 40px;
  max-width: 700px;
  margin: 0 auto;
  color: #333;
  background-color: #fff;
}

h1, h2, h3, h4, h5, h6 {
  font-family: -apple-system, sans-serif;
  margin-top: 2em;
  margin-bottom: 0.5em;
  font-weight: normal;
}

h1 { font-size: 2.2em; }
h2 { font-size: 1.8em; }
h3 { font-size: 1.4em; }

p {
  margin-bottom: 1.5em;
  text-align: justify;
}

pre, code {
  font-family: 'Courier New', monospace;
  background-color: #f8f8f8;
  border: 1px solid #e1e1e1;
}

blockquote {
  border-left: 3px solid #ccc;
  margin-left: 0;
  padding-left: 20px;
  font-style: italic;
  color: #666;
}
`;

/**
 * 获取预定义的CSS样式
 * @param {string} theme - 主题名称: 'default', 'dark', 'minimal'
 * @returns {string} CSS样式字符串
 */
function getThemeCSS(theme = 'default') {
  switch (theme.toLowerCase()) {
    case 'dark':
      return DARK_CSS;
    case 'minimal':
      return MINIMAL_CSS;
    case 'default':
    default:
      return DEFAULT_CSS;
  }
}

/**
 * 构建完整的CSS样式
 * @param {Object} options - 样式选项
 * @param {string} options.theme - 预定义主题
 * @param {string} options.customCss - 自定义CSS
 * @returns {string} 完整的CSS样式
 */
function buildCSS(options = {}) {
  const { theme = 'default', customCss = '' } = options;
  
  const baseCSS = getThemeCSS(theme);
  return `${baseCSS}\n${customCss}`;
}

// 本地字体版本（兼容本地和Docker服务器字体，支持emoji）
const LOCAL_FONT_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Roboto', 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'Noto Sans CJK SC', 'Noto Sans', 'Liberation Sans', 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.6;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  color: #24292f;
  background-color: #ffffff;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 确保emoji正确显示 */
.emoji {
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  font-style: normal;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #24292f;
}

h1 { 
  font-size: 2em; 
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 12px;
  margin-bottom: 24px;
}

h2 { 
  font-size: 1.5em; 
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

h3 { font-size: 1.25em; }
h4 { font-size: 1.1em; }
h5 { font-size: 0.95em; }
h6 { font-size: 0.85em; color: #656d76; }

p {
  margin-bottom: 16px;
  color: #24292f;
  text-align: left;
}

ul, ol {
  margin-bottom: 16px;
  padding-left: 2em;
}

li {
  margin-bottom: 8px;
  color: #24292f;
}

pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  margin-bottom: 16px;
  border: 1px solid #d0d7de;
}

code {
  font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Roboto Mono', 'Liberation Mono', 'Fira Code', 'Consolas', 'DejaVu Sans Mono', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 85%;
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  color: #24292f;
}

pre code {
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
}

blockquote {
  padding: 8px 16px;
  color: #656d76;
  border-left: 0.25em solid #d0d7de;
  margin: 16px 0;
  background-color: #f6f8fa;
  border-radius: 3px;
}

blockquote p {
  margin-bottom: 8px;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

table {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  overflow: hidden;
}

table th, table td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
  text-align: left;
}

table th {
  background-color: #f6f8fa;
  font-weight: 600;
}

table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

hr {
  border: none;
  border-top: 1px solid #d0d7de;
  margin: 24px 0;
}

a {
  color: #0969da;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

strong {
  font-weight: 600;
}

em {
  font-style: italic;
}

/* 任务列表样式 */
.task-list-item {
  list-style: none;
  margin-left: -1.5em;
}

.task-list-item-checkbox {
  margin-right: 8px;
  margin-left: 0;
}

input[type="checkbox"] {
  margin-right: 8px;
}
`;

/**
 * 获取预定义的CSS样式
 * @param {string} theme - 主题名称: 'default', 'dark', 'minimal', 'local'
 * @returns {string} CSS样式字符串
 */
function getThemeCSS(theme = 'default') {
  switch (theme.toLowerCase()) {
    case 'dark':
      return DARK_CSS;
    case 'minimal':
      return MINIMAL_CSS;
    case 'local':
      return LOCAL_FONT_CSS;
    case 'default':
    default:
      return DEFAULT_CSS;
  }
}

module.exports = {
  DEFAULT_CSS,
  DARK_CSS,
  MINIMAL_CSS,
  LOCAL_FONT_CSS,
  getThemeCSS,
  buildCSS
};
