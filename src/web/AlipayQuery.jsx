import React, { useState, useEffect } from 'react';
import './AlipayQuery.css';

function AlipayQuery() {
  useEffect(() => { document.title = '玩家信息查询'; }, []);

  const [queryTypes, setQueryTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [queryValue, setQueryValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/query/config')
      .then(r => r.json())
      .then(data => {
        setQueryTypes(data);
        if (data.length) setSelectedType(data[0].id);
      })
      .catch(() => setError('加载查询配置失败'))
      .finally(() => setConfigLoading(false));
  }, []);

  const currentType = queryTypes.find(q => q.id === selectedType);

  const handleQuery = async () => {
    if (!queryValue.trim() || !selectedType) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const params = new URLSearchParams({ queryId: selectedType, value: queryValue.trim() });
      const response = await fetch(`/api/query/exec?${params}`, {
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

  if (configLoading) {
    return <div className="alipay-query"><h1>玩家信息查询</h1><div className="loading-hint">加载配置中...</div></div>;
  }

  return (
    <div className="alipay-query">
      <h1>玩家信息查询</h1>

      <div className="query-card">
        <div className="query-form">
          <div className="form-row">
            <label className="form-label">查询类型</label>
            <div className="radio-group">
              {queryTypes.map(qt => (
                <label key={qt.id} className={`radio-option ${selectedType === qt.id ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="queryType"
                    value={qt.id}
                    checked={selectedType === qt.id}
                    onChange={(e) => { setSelectedType(e.target.value); setResult(null); setError(''); }}
                  />
                  <span>{qt.label}</span>
                </label>
              ))}
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
              placeholder={currentType?.placeholder || '请输入查询值...'}
            />
          </div>

          <button
            className="query-btn"
            onClick={handleQuery}
            disabled={loading || !queryValue.trim() || !selectedType}
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
