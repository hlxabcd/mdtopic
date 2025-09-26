/**
 * Markdown转图片核心转换器
 * 统一的转换逻辑，供所有服务使用
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { createMarkdownRenderer, getPuppeteerConfig, getImageConfig, validateOptions, getOptimizedConfig } = require('../src/config/config');
const { buildCSS } = require('../src/config/css-styles');

/**
 * Markdown转换器类 - 性能优化版本
 */
class MarkdownConverter {
  constructor(config = {}) {
    this.config = config;
    this.md = createMarkdownRenderer(config.markdownIt);
    this.browser = null; // 浏览器实例缓存
    this.isWarmedUp = false; // 预热标记
  }

  /**
   * 获取或创建浏览器实例（单例模式）
   */
  async getBrowser() {
    if (!this.browser) {
      const puppeteerConfig = getPuppeteerConfig();
      this.browser = await puppeteer.launch(puppeteerConfig);
      
      // 预热浏览器 - 创建一个页面但不使用，加速后续操作
      if (!this.isWarmedUp) {
        const warmupPage = await this.browser.newPage();
        await warmupPage.setContent('<html><body>warmup</body></html>');
        await warmupPage.close();
        this.isWarmedUp = true;
      }
    }
    return this.browser;
  }

  /**
   * 关闭浏览器实例
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isWarmedUp = false;
    }
  }

  /**
   * 创建HTML文档
   * @param {string} markdownContent - Markdown内容
   * @param {Object} options - 转换选项
   * @returns {string} 完整的HTML文档
   */
  createHTMLDocument(markdownContent, options = {}) {
    const htmlContent = this.md.render(markdownContent);
    const css = buildCSS({
      theme: options.theme || 'default',
      customCss: options.customCss || ''
    });

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>${css}</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  }

  /**
   * 将Markdown内容转换为图片Buffer
   * @param {string} markdownContent - Markdown内容
   * @param {Object} options - 转换选项
   * @returns {Promise<Buffer>} 图片Buffer
   */
  async convertToBuffer(markdownContent, options = {}) {
    if (!markdownContent || typeof markdownContent !== 'string') {
      throw new Error('Markdown内容必须是非空字符串');
    }

    // 智能内容分析和配置优化
    const { options: optimizedOptions, analysis } = getOptimizedConfig(markdownContent, options);
    const validatedOptions = validateOptions(optimizedOptions);
    const imageConfig = getImageConfig(validatedOptions);
    const puppeteerConfig = getPuppeteerConfig(this.config.puppeteer);
    
    // 性能监控
    const perf = {
      start: Date.now(),
      browserInit: 0,
      pageSetup: 0,
      contentLoad: 0,
      screenshot: 0
    };
    
    let page;
    let browser;
    try {
      // 使用复用的浏览器实例，如果出现问题则重新创建
      try {
        browser = await this.getBrowser();
      } catch (error) {
        console.warn('浏览器实例获取失败，尝试重新创建:', error.message);
        await this.closeBrowser();
        browser = await this.getBrowser();
      }
      perf.browserInit = Date.now() - perf.start;
      
      page = await browser.newPage();
      
      // 设置页面错误处理
      page.on('error', (error) => {
        console.error('页面错误:', error);
      });
      
      page.on('pageerror', (error) => {
        console.error('页面脚本错误:', error);
      });

      // 设置超时
      page.setDefaultTimeout(this.config.timeout?.pageLoad || 5000);
      page.setDefaultNavigationTimeout(this.config.timeout?.pageLoad || 5000);
      
      // 性能优化：智能处理外部资源
      await page.setRequestInterception(true);
      let fontLoadFailed = false;
      
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        const url = req.url();
        
        // 处理Google Fonts请求
        if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
          // 设置较短的超时时间，如果加载失败则使用本地字体
          req.continue();
        }
        // 允许字体文件
        else if (resourceType === 'font') {
          req.continue();
        }
        // 阻止图片、媒体等其他外部资源加载，加快渲染速度
        else if (['image', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      page.on('requestfailed', (req) => {
        const url = req.url();
        if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
          fontLoadFailed = true;
        }
      });

      // 创建HTML文档
      const htmlDocument = this.createHTMLDocument(markdownContent, validatedOptions);
      perf.pageSetup = Date.now() - perf.start - perf.browserInit;
      
      // 设置页面内容 - 智能字体加载策略
      try {
        await page.setContent(htmlDocument, { 
          waitUntil: 'networkidle0', // 等待网络空闲，确保字体加载完成
          timeout: this.config.timeout?.pageLoad || 6000 // 减少超时时间
        });
        
        // 等待Web字体加载完成（较短超时）
        await page.waitForFunction(() => {
          return document.fonts ? document.fonts.ready : Promise.resolve();
        }, { timeout: 2000 }).catch(() => {
          fontLoadFailed = true;
        });
        
      } catch (error) {
        // 如果字体加载失败，使用本地字体版本重新渲染
        if (fontLoadFailed || error.message.includes('timeout')) {
          console.warn('外部字体加载失败，切换到本地字体');
          const localFontOptions = { ...validatedOptions, theme: 'local' };
          const localHtmlDocument = this.createHTMLDocument(markdownContent, localFontOptions);
          
          await page.setContent(localHtmlDocument, { 
            waitUntil: 'domcontentloaded',
            timeout: 4000
          });
        } else {
          throw error;
        }
      }
      
      // 等待页面基本渲染完成
      await page.waitForFunction(() => {
        const body = document.querySelector('body');
        return body && body.offsetHeight > 100; // 确保内容已渲染
      }, { timeout: 1000 }).catch(() => {
        // 如果渲染检查超时，继续执行（容错处理）
      });
      
      perf.contentLoad = Date.now() - perf.start - perf.browserInit - perf.pageSetup;

      // 获取内容高度
      const bodyHandle = await page.$('body');
      if (!bodyHandle) {
        throw new Error('无法找到body元素');
      }
      
      const { height } = await bodyHandle.boundingBox();
      await bodyHandle.dispose();

      // 设置视口
      await page.setViewport({ 
        width: imageConfig.width, 
        height: Math.ceil(height),
        deviceScaleFactor: imageConfig.deviceScaleFactor || 2 // 使用配置的缩放因子，默认2
      });

      // 生成截图
      const screenshotOptions = {
        fullPage: imageConfig.fullPage,
        type: imageConfig.format,
        timeout: this.config.timeout?.screenshot || 10000
      };

      // 对于JPEG格式添加质量参数
      if (imageConfig.format === 'jpeg') {
        screenshotOptions.quality = imageConfig.quality;
      }

      const imageBuffer = await page.screenshot(screenshotOptions);
      perf.screenshot = Date.now() - perf.start - perf.browserInit - perf.pageSetup - perf.contentLoad;
      
      // 性能日志（仅在开发环境显示）
        const total = Date.now() - perf.start;
        console.log(`🔍 性能分析 (总计${total}ms):`);
        console.log(`  📱 浏览器初始化: ${perf.browserInit}ms (${(perf.browserInit/total*100).toFixed(1)}%)`);
        console.log(`  🔧 页面设置: ${perf.pageSetup}ms (${(perf.pageSetup/total*100).toFixed(1)}%)`);
        console.log(`  📄 内容加载: ${perf.contentLoad}ms (${(perf.contentLoad/total*100).toFixed(1)}%)`);
        console.log(`  📸 截图生成: ${perf.screenshot}ms (${(perf.screenshot/total*100).toFixed(1)}%)`);
        
        // 智能分析信息
        console.log(`🧠 智能分析:`);
        console.log(`  📊 复杂度: ${analysis.complexity} (${analysis.category})`);
        console.log(`  📝 内容: ${analysis.stats.lines}行, ${analysis.stats.codeBlocks}代码块, ${analysis.stats.headers}标题`);
        console.log(`  ⚙️  推荐: ${analysis.recommended.description}`);
        console.log(`  🎛️  设置: 质量${validatedOptions.quality || imageConfig.quality}, 格式${validatedOptions.format || imageConfig.format}`);
      
      return imageBuffer;

    } catch (error) {
      console.error('转换过程中出错：', error);
      throw new Error(`图片生成失败: ${error.message}`);
    } finally {
      // 只关闭页面，保留浏览器实例供复用
      if (page) {
        try {
          await page.close();
        } catch (error) {
          console.warn('页面关闭失败:', error.message);
        }
      }
      
      // 定期清理浏览器实例，防止资源泄漏
      if (browser && browser.process()) {
        const memoryUsage = process.memoryUsage();
        if (memoryUsage.heapUsed > 200 * 1024 * 1024) { // 超过200MB时重启浏览器
          console.log('内存使用过高，重启浏览器实例');
          await this.closeBrowser();
        }
      }
    }
  }

  /**
   * 将Markdown内容转换为Base64编码的图片
   * @param {string} markdownContent - Markdown内容
   * @param {Object} options - 转换选项
   * @returns {Promise<Object>} 包含base64数据和元信息的对象
   */
  async convertToBase64(markdownContent, options = {}) {
    const imageBuffer = await this.convertToBuffer(markdownContent, options);
    const imageConfig = getImageConfig(validateOptions(options));
    
    const base64Image = imageBuffer.toString('base64');
    const mimeType = `image/${imageConfig.format}`;
    
    return {
      base64: base64Image,
      mimeType,
      size: imageBuffer.length,
      format: imageConfig.format,
      width: imageConfig.width,
      dataUrl: `data:${mimeType};base64,${base64Image}`
    };
  }

  /**
   * 将Markdown文件转换为图片文件
   * @param {string} inputPath - 输入Markdown文件路径
   * @param {string} outputPath - 输出图片文件路径
   * @param {Object} options - 转换选项
   * @returns {Promise<Object>} 转换结果信息
   */
  async convertFileToFile(inputPath, outputPath, options = {}) {
    try {
      // 检查输入文件是否存在
      await fs.access(inputPath);
      
      // 读取Markdown文件
      const markdownContent = await fs.readFile(inputPath, 'utf-8');
      
      // 转换为图片
      const imageBuffer = await this.convertToBuffer(markdownContent, options);
      
      // 确保输出目录存在
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });
      
      // 保存图片文件
      await fs.writeFile(outputPath, imageBuffer);
      
      const imageConfig = getImageConfig(validateOptions(options));
      
      return {
        success: true,
        inputPath: path.resolve(inputPath),
        outputPath: path.resolve(outputPath),
        size: imageBuffer.length,
        format: imageConfig.format,
        width: imageConfig.width
      };
    } catch (error) {
      throw new Error(`文件转换失败: ${error.message}`);
    }
  }

  /**
   * 批量转换多个Markdown文件
   * @param {Array} files - 文件配置数组 [{ input, output, options }]
   * @returns {Promise<Array>} 转换结果数组
   */
  async convertMultipleFiles(files) {
    const results = [];
    
    for (const fileConfig of files) {
      try {
        const result = await this.convertFileToFile(
          fileConfig.input,
          fileConfig.output,
          fileConfig.options || {}
        );
        results.push({ ...result, error: null });
      } catch (error) {
        results.push({
          success: false,
          inputPath: fileConfig.input,
          outputPath: fileConfig.output,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

// 创建全局单例转换器实例（支持浏览器复用）
const globalConverter = new MarkdownConverter();

// 进程退出时清理资源
let isCleaningUp = false;

async function cleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;
  
  try {
    await globalConverter.closeBrowser();
  } catch (error) {
    console.error('清理浏览器实例时出错:', error);
  }
}

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

// 添加优雅退出函数，供命令行工具使用
function gracefulExit() {
  return cleanup();
}

/**
 * 创建新的转换器实例
 * @param {Object} config - 配置选项
 * @returns {MarkdownConverter} 转换器实例
 */
function createConverter(config = {}) {
  return new MarkdownConverter(config);
}

/**
 * 快捷方法：将Markdown内容转换为图片Buffer（使用全局单例，性能优化）
 * @param {string} markdownContent - Markdown内容
 * @param {Object} options - 转换选项
 * @returns {Promise<Buffer>} 图片Buffer
 */
async function convertMarkdownToImage(markdownContent, options = {}) {
  return await globalConverter.convertToBuffer(markdownContent, options);
}

/**
 * 快捷方法：将Markdown文件转换为图片文件（使用全局单例，性能优化）
 * @param {string} inputPath - 输入文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {Object} options - 转换选项
 * @returns {Promise<Object>} 转换结果
 */
async function convertMarkdownFileToImage(inputPath, outputPath, options = {}) {
  return await globalConverter.convertFileToFile(inputPath, outputPath, options);
}

/**
 * 快捷方法：将Markdown内容转换为Base64（使用全局单例，性能优化）
 * @param {string} markdownContent - Markdown内容
 * @param {Object} options - 转换选项
 * @returns {Promise<Object>} Base64结果对象
 */
async function convertMarkdownToBase64(markdownContent, options = {}) {
  return await globalConverter.convertToBase64(markdownContent, options);
}

module.exports = {
  MarkdownConverter,
  createConverter,
  convertMarkdownToImage,
  convertMarkdownFileToImage,
  convertMarkdownToBase64,
  gracefulExit
};
