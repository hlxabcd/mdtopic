/**
 * 支付宝查询接口配置
 *
 * 环境变量:
 *   ALIPAY_QUERY_URL - 覆盖默认查询地址
 *
 * 配置文件 (项目根目录 query.config.json) 示例:
 * {
 *   "queryUrl": "https://your-real-api.com/query"
 * }
 */

const path = require('path');
const fs = require('fs');

const CONFIG_FILE = path.join(__dirname, '../../query.config.json');

function loadFileConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

function getAlipayConfig() {
  const fileConfig = loadFileConfig();

  return {
    queryUrl: process.env.ALIPAY_QUERY_URL
      || fileConfig.queryUrl
      || 'http://localhost:3001/mock/alipay/query',
  };
}

module.exports = { getAlipayConfig };
