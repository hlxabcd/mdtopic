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
 *       "params": [
 *         { "name": "roleId", "label": "角色ID", "placeholder": "请输入角色ID" }
 *       ]
 *     },
 *     {
 *       "id": "multi",
 *       "label": "多参数查询",
 *       "url": "https://example.com/api/queryMulti",
 *       "params": [
 *         { "name": "serverId", "label": "服务器ID", "placeholder": "请输入服务器ID" },
 *         { "name": "roleId",   "label": "角色ID",   "placeholder": "请输入角色ID" }
 *       ]
 *     }
 *   ]
 * }
 *
 * 兼容旧格式: paramName + placeholder 会自动转为 params 数组
 */

const path = require('path');
const fs = require('fs');

const CONFIG_FILE = path.join(__dirname, '../../query.config.json');

const DEFAULT_QUERIES = [
  {
    id: 'powerByRoleId',
    label: '根据角色ID查询战力',
    url: 'http://localhost:3001/mock/alipay/queryByRoleId',
    params: [
      { name: 'roleId', label: '角色ID', placeholder: '请输入角色ID' },
    ],
  },
  {
    id: 'powerByOpenId',
    label: '根据OpenId查询战力',
    url: 'http://localhost:3001/mock/alipay/queryByOpenId',
    params: [
      { name: 'openId', label: 'OpenId', placeholder: '请输入OpenId' },
    ],
  },
];

function normalizeQuery(q) {
  if (q.params && Array.isArray(q.params)) return q;
  if (q.paramName) {
    return {
      ...q,
      params: [{ name: q.paramName, label: q.paramName, placeholder: q.placeholder || `请输入${q.paramName}` }],
    };
  }
  return q;
}

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
  const raw = fileConfig && Array.isArray(fileConfig.queries) && fileConfig.queries.length
    ? fileConfig.queries
    : DEFAULT_QUERIES;
  return raw.map(normalizeQuery);
}

module.exports = { getQueryConfig };
