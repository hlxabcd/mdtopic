#!/usr/bin/env node

/**
 * MDTopic 命令行工具
 * 支持将Markdown文件转换为图片的命令行接口
 */

const { program } = require('commander');
const { convertMarkdownFileToImage, gracefulExit } = require('./lib/markdown-converter');
const path = require('path');
const fs = require('fs').promises;

// 版本信息
const packageJson = require('./package.json');

// 配置命令行程序
program
  .name('mdtopic')
  .description('将Markdown文件转换为高质量图片')
  .version(packageJson.version);

// 主要转换命令
program
  .command('convert')
  .description('将Markdown文件转换为图片')
  .argument('<input>', 'Markdown输入文件路径')
  .argument('[output]', '图片输出文件路径（可选，默认为输入文件名.webp）')
  .option('-w, --width <number>', '图片宽度（像素）', '800')
  .option('-f, --format <type>', '图片格式 (png|jpeg|webp)', 'webp')
  .option('-q, --quality <number>', '图片质量 (1-100)', '75')
  .option('-t, --theme <name>', '主题样式 (default|dark|minimal)', 'default')
  .option('--css <file>', '自定义CSS文件路径')
  .option('--scale <number>', '像素密度 (1-3)', '2')
  .option('--smart', '启用智能优化模式（根据内容复杂度自动选择最佳设置）')
  .option('--preset <mode>', '预设优化模式 (web|mobile|print|archive)', '')
  .option('--verbose', '显示详细输出')
  .action(async (input, output, options) => {
    try {
      // 验证输入文件
      const inputPath = path.resolve(input);
      await fs.access(inputPath);
      
      // 确定输出文件路径
      if (!output) {
        const inputExt = path.extname(input);
        const inputName = path.basename(input, inputExt);
        output = `${inputName}.${options.format}`;
      }
      const outputPath = path.resolve(output);
      
      // 读取自定义CSS（如果有）
      let customCss = '';
      if (options.css) {
        try {
          const cssPath = path.resolve(options.css);
          customCss = await fs.readFile(cssPath, 'utf-8');
          if (options.verbose) {
            console.log(`📝 已加载自定义CSS: ${cssPath}`);
          }
        } catch (error) {
          console.warn(`⚠️  无法读取CSS文件 ${options.css}: ${error.message}`);
        }
      }
      
      // 转换选项
      let convertOptions = {
        width: parseInt(options.width, 10),
        format: options.format.toLowerCase(),
        quality: parseInt(options.quality, 10),
        theme: options.theme.toLowerCase(),
        customCss,
        deviceScaleFactor: parseFloat(options.scale)
      };
      
      // 智能优化模式
      if (options.smart) {
        const { analyzeContentComplexity } = require('./src/config/config');
        const content = await fs.readFile(inputPath, 'utf-8');
        const analysis = analyzeContentComplexity(content);
        
        console.log(`🧠 智能分析模式:`);
        console.log(`📊 内容复杂度: ${analysis.complexity} (${analysis.category})`);
        console.log(`📝 内容统计: ${analysis.stats.lines}行, ${analysis.stats.codeBlocks}代码块, ${analysis.stats.headers}标题`);
        console.log(`⚙️  推荐设置: ${analysis.recommended.description}`);
        console.log(`🎛️  应用设置: 质量${analysis.recommended.quality}, 格式${analysis.recommended.format}`);
        
        // 应用智能推荐（用户显式设置的选项优先级更高）
        if (options.quality === '75') convertOptions.quality = analysis.recommended.quality;
        if (options.format === 'webp') convertOptions.format = analysis.recommended.format;
        if (options.scale === '2') convertOptions.deviceScaleFactor = analysis.recommended.deviceScaleFactor;
        
        console.log('');
      }
      
      // 预设优化模式
      if (options.preset) {
        const presets = {
          web: {
            quality: 75,
            format: 'webp',
            deviceScaleFactor: 2,
            width: 800,
            description: 'Web显示优化 - 平衡质量和加载速度'
          },
          mobile: {
            quality: 70,
            format: 'webp',
            deviceScaleFactor: 1,
            width: 600,
            description: '移动端优化 - 最小文件大小，节省流量'
          },
          print: {
            quality: 90,
            format: 'webp',
            deviceScaleFactor: 2,
            width: 1200,
            description: '打印质量 - 高分辨率，专业品质'
          },
          archive: {
            quality: 60,
            format: 'webp',
            deviceScaleFactor: 1,
            width: 800,
            description: '存档模式 - 长期存储，空间优先'
          }
        };
        
        const preset = presets[options.preset.toLowerCase()];
        if (preset) {
          console.log(`📋 预设模式: ${options.preset.toUpperCase()}`);
          console.log(`📝 描述: ${preset.description}`);
          console.log(`🎛️  设置: 质量${preset.quality}, 格式${preset.format}, 像素密度${preset.deviceScaleFactor}, 宽度${preset.width}`);
          
          // 应用预设（用户显式设置的选项优先级更高）
          if (options.quality === '75') convertOptions.quality = preset.quality;
          if (options.format === 'webp') convertOptions.format = preset.format;
          if (options.scale === '2') convertOptions.deviceScaleFactor = preset.deviceScaleFactor;
          if (options.width === '800') convertOptions.width = preset.width;
          
          console.log('');
        } else {
          console.warn(`⚠️  未知的预设模式: ${options.preset}`);
          console.log('可用预设: web, mobile, print, archive');
        }
      }
      
      if (options.verbose) {
        console.log('🔧 转换参数:');
        console.log(`   输入文件: ${inputPath}`);
        console.log(`   输出文件: ${outputPath}`);
        console.log(`   图片宽度: ${convertOptions.width}px`);
        console.log(`   图片格式: ${convertOptions.format.toUpperCase()}`);
        console.log(`   主题样式: ${convertOptions.theme}`);
        console.log(`   缩放因子: ${convertOptions.deviceScaleFactor}x`);
        if (convertOptions.format === 'jpeg') {
          console.log(`   JPEG质量: ${convertOptions.quality}`);
        }
        console.log('');
      }
      
      console.log('🚀 开始转换...');
      const startTime = Date.now();
      
      // 执行转换
      const result = await convertMarkdownFileToImage(inputPath, outputPath, convertOptions);
      
      const duration = Date.now() - startTime;
      
      // 输出结果
      console.log('✅ 转换完成!');
      console.log(`📁 输出文件: ${result.outputPath}`);
      console.log(`📏 文件大小: ${(result.size / 1024).toFixed(2)} KB`);
      console.log(`⏱️  用时: ${duration}ms`);
      
      // 优雅退出，清理浏览器实例
      await gracefulExit();
      
    } catch (error) {
      console.error('❌ 转换失败:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      await gracefulExit(); // 确保失败时也清理资源
      process.exit(1);
    }
  });

// 批量转换命令
program
  .command('batch')
  .description('批量转换多个Markdown文件')
  .argument('<pattern>', 'Markdown文件匹配模式 (如: "docs/*.md")')
  .option('-o, --output <dir>', '输出目录', './output')
  .option('-w, --width <number>', '图片宽度（像素）', '800')
  .option('-f, --format <type>', '图片格式 (png|jpeg)', 'png')
  .option('-q, --quality <number>', 'JPEG质量 (1-100)', '90')
  .option('-t, --theme <name>', '主题样式 (default|dark|minimal)', 'default')
  .option('--css <file>', '自定义CSS文件路径')
  .option('--verbose', '显示详细输出')
  .action(async (pattern, options) => {
    const glob = require('glob');
    const { convertMultipleFiles, createConverter } = require('./lib/markdown-converter');
    
    try {
      // 查找匹配的文件
      const files = glob.sync(pattern);
      if (files.length === 0) {
        console.log('⚠️  未找到匹配的Markdown文件');
        return;
      }
      
      console.log(`📁 找到 ${files.length} 个文件`);
      
      // 确保输出目录存在
      await fs.mkdir(options.output, { recursive: true });
      
      // 读取自定义CSS（如果有）
      let customCss = '';
      if (options.css) {
        try {
          customCss = await fs.readFile(options.css, 'utf-8');
        } catch (error) {
          console.warn(`⚠️  无法读取CSS文件: ${error.message}`);
        }
      }
      
      // 准备批量转换配置
      const convertOptions = {
        width: parseInt(options.width, 10),
        format: options.format.toLowerCase(),
        quality: parseInt(options.quality, 10),
        theme: options.theme.toLowerCase(),
        customCss
      };
      
      const fileConfigs = files.map(file => {
        const fileName = path.basename(file, path.extname(file));
        const outputFile = path.join(options.output, `${fileName}.${convertOptions.format}`);
        return {
          input: file,
          output: outputFile,
          options: convertOptions
        };
      });
      
      console.log('🚀 开始批量转换...');
      const startTime = Date.now();
      
      // 执行批量转换
      const converter = createConverter();
      const results = await converter.convertMultipleFiles(fileConfigs);
      
      const duration = Date.now() - startTime;
      
      // 统计结果
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`\n📊 转换完成:`);
      console.log(`✅ 成功: ${successful} 个文件`);
      console.log(`❌ 失败: ${failed} 个文件`);
      console.log(`⏱️  总用时: ${duration}ms`);
      
      if (options.verbose && failed > 0) {
        console.log('\n❌ 失败的文件:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`   ${r.inputPath}: ${r.error}`);
        });
      }
      
    } catch (error) {
      console.error('❌ 批量转换失败:', error.message);
      process.exit(1);
    }
  });

// 信息命令
program
  .command('info')
  .description('显示工具信息和系统状态')
  .action(async () => {
    console.log(`MDTopic v${packageJson.version}`);
    console.log('📝 Markdown转图片工具\n');
    
    console.log('🔧 支持的功能:');
    console.log('   • 单文件转换');
    console.log('   • 批量转换');
    console.log('   • 多种主题 (default, dark, minimal)');
    console.log('   • 自定义CSS样式');
    console.log('   • PNG/JPEG格式输出');
    console.log('   • 可调节图片质量和尺寸\n');
    
    console.log('🎨 可用主题:');
    console.log('   • default - GitHub风格，适合技术文档');
    console.log('   • dark - 暗色主题，适合演示');
    console.log('   • minimal - 简洁风格，适合书面文档\n');
    
    console.log('📋 使用示例:');
    console.log('   mdtopic convert README.md');
    console.log('   mdtopic convert input.md output.png --theme dark');
    console.log('   mdtopic batch "docs/*.md" --output ./images');
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}