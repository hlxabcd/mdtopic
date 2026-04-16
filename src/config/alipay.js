/**
 * 查询接口配置
 *
 * 配置文件 (项目根目录 query.config.json) 示例:
 * {
 *   "queries": [
 *     {
 *       "id": "roleId",
 *       "label": "按角色ID查询",
 *       "url": "https://example.com/api/queryByRoleId",
 *       "paramName": "roleId",
 *       "placeholder": "请输入角色ID"
 *     }
 *   ]
 * }
 */

const path = require('path');
const fs = require('fs');

const CONFIG_FILE = path.join(__dirname, '../../query.config.json');

const DEFAULT_QUERIES = [
  {
    id: 'roleId',
    label: '按角色ID查询',
    url: 'http://localhost:3001/mock/alipay/queryByRoleId',
    paramName: 'roleId',
    placeholder: '请输入角色ID',
  },
  {
    id: 'openId',
    label: '按OpenId查询',
    url: 'http://localhost:3001/mock/alipay/queryByOpenId',
    paramName: 'openId',
    placeholder: '请输入OpenId',
  },
];

function loadFileConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return null;
}

function getQueryConfig() {
  const fileConfig = loadFileConfig();
  return fileConfig && Array.isArray(fileConfig.queries) && fileConfig.queries.length
    ? fileConfig.queries
    : DEFAULT_QUERIES;
}

module.exports = { getQueryConfig };
