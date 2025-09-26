import React, { useState } from 'react';
import './App.css';
import MarkdownIt from 'markdown-it';
import markdownItTaskLists from 'markdown-it-task-lists';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// 启用任务列表插件，与后端保持一致
md.use(markdownItTaskLists, {
  enabled: true,
  label: true,
  labelAfter: true
});

function App() {
  const [markdown, setMarkdown] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMarkdownChange = (e) => {
    setMarkdown(e.target.value);
  };

  const handleConvertToImage = async () => {
    if (!markdown.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
      });

      if (!response.ok) {
        throw new Error('转换失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      console.error('转换失败:', error);
      alert('转换失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      if (isIOS) {
        // iOS设备：使用fetch获取图片数据
        fetch(imageUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'markdown-image.png', { type: 'image/png' });
            if (navigator.share) {
              navigator.share({
                files: [file],
                title: 'Markdown转换的图片'
              }).catch(error => {
                console.error('分享失败:', error);
                // 如果分享失败，提供备选方案
                const tempUrl = URL.createObjectURL(blob);
                window.location.href = tempUrl;
                setTimeout(() => URL.revokeObjectURL(tempUrl), 60000);
              });
            } else {
              // 如果不支持share API，使用临时URL
              const tempUrl = URL.createObjectURL(blob);
              window.location.href = tempUrl;
              setTimeout(() => URL.revokeObjectURL(tempUrl), 60000);
            }
          })
          .catch(error => {
            console.error('下载失败:', error);
            alert('下载失败，请重试');
          });
      } else {
        // 非iOS移动设备：创建临时链接并触发下载
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'markdown-image.png';
        link.target = '_self';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          alert('如果图片没有自动下载，请长按图片选择"保存图片"');
        }, 100);
      }
    } else {
      // 非移动设备：使用常规下载方式
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'markdown-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app">
      <h1>Markdown转图片工具</h1>
      <div className="container">
        <div className="editor-section">
          <h2>Markdown编辑器</h2>
          <textarea
            value={markdown}
            onChange={handleMarkdownChange}
            placeholder="在这里输入Markdown内容..."
          />
        </div>
        <div className="preview-section">
          <h2>预览</h2>
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: md.render(markdown) }}
          />
        </div>
      </div>
      <div className="actions">
        <button onClick={handleConvertToImage} disabled={loading || !markdown.trim()}>
          {loading ? '转换中...' : '转换为图片'}
        </button>
        {imageUrl && (
          <button onClick={handleDownload}>
            下载图片
          </button>
        )}
      </div>
      {imageUrl && (
        <div className="image-preview">
          <h2>图片预览</h2>
          <img src={imageUrl} alt="转换后的图片" />
        </div>
      )}
    </div>
  );
}

export default App;