#!/usr/bin/env node

/**
 * 音乐JSON工具 - 命令行界面
 * 
 * 提供友好的命令行界面来使用对比和合并功能
 * 
 * @example
 * node scripts/music-tools.js compare file1.json file2.json
 * node scripts/music-tools.js merge main.json secondary.json
 */

const { compareMusic } = require('./lib/compare.js');
const { mergeMusic, interactiveMerge } = require('./lib/merge.js');
const path = require('path');

/**
 * 显示帮助信息
 */
const showHelp = () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              音乐JSON工具 - 使用帮助                          ║
╚═══════════════════════════════════════════════════════════════╝

用法:
  node scripts/music-tools.js <命令> [选项]

命令:

  compare <file1> <file2> [output]
    对比两个JSON文件的差异
    
    参数:
      file1   - 第一个文件路径
      file2   - 第二个文件路径
      output  - 报告输出路径（可选，默认: ./scripts/output/comparison-report.txt）
    
    示例:
      node scripts/cli.js compare artist/3.json artist/5.json
      node scripts/cli.js compare file1.json file2.json output/report.txt

  merge <main> <secondary> [output] [--no-backup]
    合并两个JSON文件（以main为基准）
    
    参数:
      main      - 主文件路径（基准文件）
      secondary - 副文件路径（提取新歌曲）
      output    - 输出文件路径（可选，默认: ./scripts/output/merged-result.json）
      --no-backup - 不创建备份（可选）
    
    示例:
      node scripts/cli.js merge artist/3.json artist/5.json
      node scripts/cli.js merge main.json new.json output/merged.json
      node scripts/cli.js merge main.json new.json main.json --no-backup

  merge-interactive <main> <secondary>
    交互式合并（需要用户确认）
    
    示例:
      node scripts/cli.js merge-interactive artist/3.json artist/5.json

  help
    显示此帮助信息

选项:
  --no-backup  不创建备份文件（仅用于merge命令）
  --quiet      静默模式，不显示预览

示例工作流程:
  
  1. 先对比查看差异
     node scripts/cli.js compare artist/3.json artist/5.json
  
  2. 查看报告确认
     cat scripts/output/comparison-report.txt
  
  3. 执行合并
     node scripts/cli.js merge artist/3.json artist/5.json output/artist-merged.json

注意事项:
  - 文件路径可以是相对路径或绝对路径
  - 合并操作默认会创建备份
  - 建议先使用compare命令了解差异，再进行merge
  - 所有报告文件会保存在scripts/output目录下

`);
};

/**
 * 对比命令处理
 */
const handleCompare = (args) => {
  if (args.length < 2) {
    console.error('✗ 错误: compare命令需要至少2个参数');
    console.log('用法: node scripts/music-tools.js compare <file1> <file2> [output]');
    process.exit(1);
  }
  
  const [file1, file2, output] = args;
  
  console.log('执行对比操作...\n');
  
  compareMusic({
    file1,
    file2,
    outputPath: output || './scripts/output/comparison-report.txt',
    writeToFile: true,
    showInConsole: true
  });
};

/**
 * 合并命令处理
 */
const handleMerge = (args) => {
  if (args.length < 2) {
    console.error('✗ 错误: merge命令需要至少2个参数');
    console.log('用法: node scripts/music-tools.js merge <main> <secondary> [output]');
    process.exit(1);
  }
  
  const mainFile = args[0];
  const secondaryFile = args[1];
  const outputFile = args[2] || './scripts/output/merged-result.json';
  const noBackup = args.includes('--no-backup');
  const quiet = args.includes('--quiet');
  
  console.log('执行合并操作...\n');
  
  mergeMusic({
    mainFile,
    secondaryFile,
    outputFile,
    createBackup: !noBackup,
    showPreview: !quiet
  });
};

/**
 * 交互式合并命令处理
 */
const handleInteractiveMerge = async (args) => {
  if (args.length < 2) {
    console.error('✗ 错误: merge-interactive命令需要至少2个参数');
    console.log('用法: node scripts/music-tools.js merge-interactive <main> <secondary>');
    process.exit(1);
  }
  
  const [mainFile, secondaryFile] = args;
  
  await interactiveMerge({
    mainFile,
    secondaryFile,
    outputFile: mainFile,  // 默认覆盖主文件
    createBackup: true
  });
};

/**
 * 主函数
 */
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  const command = args[0];
  const commandArgs = args.slice(1);
  
  try {
    switch (command) {
      case 'compare':
        handleCompare(commandArgs);
        break;
      
      case 'merge':
        handleMerge(commandArgs);
        break;
      
      case 'merge-interactive':
        await handleInteractiveMerge(commandArgs);
        break;
      
      default:
        console.error(`✗ 未知命令: ${command}`);
        console.log('运行 "node scripts/music-tools.js help" 查看帮助');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ 执行失败:', error.message);
    process.exit(1);
  }
};

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('发生错误:', error);
    process.exit(1);
  });
}

module.exports = { main };

