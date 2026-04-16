import React, { useState } from 'react';
import './AlipayQuery.css';

function AlipayQuery() {
  const [queryType, setQueryType] = useState('rid');
  const [queryValue, setQueryValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!queryValue.trim()) {
      setError('请输入查询参数');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const params = new URLSearchParams({ [queryType]: queryValue.trim() });
      const response = await fetch(`/api/alipay/query?${params}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `请求失败: ${response.status}`);
      }

      const text = await response.text();
      setResult(text);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('请求超时，请重试');
      } else {
        setError(err.message || '查询失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleQuery();
  };

  const formatJson = (text) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  return (
    <div className="alipay-query">
      <h1>信息查询工具</h1>

      <div className="query-card">
        <div className="query-form">
          <div className="form-row">
            <label className="form-label">查询类型</label>
            <div className="radio-group">
              <label className={`radio-option ${queryType === 'rid' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="queryType"
                  value="rid"
                  checked={queryType === 'rid'}
                  onChange={(e) => setQueryType(e.target.value)}
                />
                <span>rid</span>
              </label>
              <label className={`radio-option ${queryType === 'openid' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="queryType"
                  value="openid"
                  checked={queryType === 'openid'}
                  onChange={(e) => setQueryType(e.target.value)}
                />
                <span>openid</span>
              </label>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">查询参数</label>
            <input
              type="text"
              className="query-input"
              value={queryValue}
              onChange={(e) => setQueryValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`请输入 ${queryType}...`}
            />
          </div>

          <button
            className="query-btn"
            onClick={handleQuery}
            disabled={loading || !queryValue.trim()}
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </div>
      </div>

      {error && (
        <div className="result-card error-card">
          <div className="error-msg">{error}</div>
        </div>
      )}

      {result && (
        <div className="result-card">
          <h2>查询结果</h2>
          <pre className="result-json">{formatJson(result)}</pre>
        </div>
      )}
    </div>
  );
}

export default AlipayQuery;
