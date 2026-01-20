/**
 * 音乐JSON文件合并工具
 * 
 * 以主文件为基准，将副文件中不存在于主文件的歌曲合并到主文件中
 * 
 * @description
 * 该脚本会智能识别主文件和副文件之间的差异，
 * 将副文件中独有的歌曲添加到主文件，同时保持主文件的原有数据不变
 * 
 * @example
 * // 使用方式
 * node scripts/mergeMusicJson.js
 * 
 * // 或者作为模块使用
 * const { mergeMusic } = require('./scripts/mergeMusicJson.js');
 * mergeMusic(config);
 */

const fs = require('fs');
const path = require('path');

/**
 * 配置文件路径
 * 可以根据需要修改这些路径
 */
const config = {
  // 主文件路径（作为基准，将新内容合并到这个文件）
  mainFile: 'd:/Download/stolenList (29).json',
  // 副文件路径（从这个文件中提取不在主文件中的歌曲）
  secondaryFile: 'd:/Download/stolenList (28).json',
  // 输出文件路径（合并后的结果，如果为空则覆盖主文件）
  outputFile: './scripts/output/merged-result.json',
  // 是否创建备份
  createBackup: true,
  // 备份文件路径（如果为空则自动生成）
  backupPath: '',
  // 是否在合并前显示预览
  showPreview: true,
  // 合并策略
  mergeStrategy: {
    // 基于什么字段判断歌曲唯一性
    // 可选: 'name+album', 'id', 'name+artist+album'
    uniqueBy: 'name+album',
    // 是否保留主文件的排序
    keepMainOrder: true,
    // 新增歌曲添加到哪里: 'end' 或 'start'
    appendPosition: 'end',
    // 是否按专辑分组排序新增的歌曲
    sortNewByAlbum: true
  }
};

/**
 * 读取JSON文件
 * 
 * @param {string} filePath - 文件路径
 * @returns {Object} 包含数据和元数据的对象
 */
const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    
    // 判断是数组格式还是对象格式
    const isArrayFormat = Array.isArray(parsed);
    const data = isArrayFormat ? parsed : (parsed.data || []);
    
    return {
      data,
      isArrayFormat,
      original: parsed
    };
  } catch (error) {
    console.error(`✗ 读取文件失败: ${filePath}`);
    throw error;
  }
};

/**
 * 生成歌曲的唯一标识符
 * 
 * @param {Object} song - 歌曲对象
 * @param {string} strategy - 策略类型
 * @returns {string} 唯一标识符
 */
const generateSongKey = (song, strategy = 'name+album') => {
  switch (strategy) {
    case 'id':
      return `id_${song.id}`;
    case 'name+artist+album':
      return `${song.name}@@${song.artist}@@${song.album}`;
    case 'name+album':
    default:
      return `${song.name}@@${song.album}`;
  }
};

/**
 * 创建备份文件
 * 
 * @param {string} sourceFile - 源文件路径
 * @param {string} backupPath - 备份文件路径
 * @returns {string} 备份文件的实际路径
 */
const createBackup = (sourceFile, backupPath = '') => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const ext = path.extname(sourceFile);
    const basename = path.basename(sourceFile, ext);
    const dirname = path.dirname(sourceFile);
    
    const finalBackupPath = backupPath || path.join(
      dirname,
      `${basename}.backup.${timestamp}${ext}`
    );
    
    fs.copyFileSync(sourceFile, finalBackupPath);
    console.log(`✓ 备份已创建: ${finalBackupPath}`);
    
    return finalBackupPath;
  } catch (error) {
    console.error(`✗ 创建备份失败: ${error.message}`);
    throw error;
  }
};

/**
 * 分析两个文件的差异
 * 
 * @param {Array} mainData - 主文件数据
 * @param {Array} secondaryData - 副文件数据
 * @param {string} strategy - 唯一性判断策略
 * @returns {Object} 差异分析结果
 */
const analyzeDifferences = (mainData, secondaryData, strategy) => {
  const mainKeys = new Set();
  const mainMap = new Map();
  const secondaryMap = new Map();
  
  // 构建主文件映射
  mainData.forEach(song => {
    const key = generateSongKey(song, strategy);
    mainKeys.add(key);
    mainMap.set(key, song);
  });
  
  // 找出副文件中的新歌曲
  const newSongs = [];
  const duplicates = [];
  
  secondaryData.forEach(song => {
    const key = generateSongKey(song, strategy);
    secondaryMap.set(key, song);
    
    if (mainKeys.has(key)) {
      duplicates.push({
        key,
        main: mainMap.get(key),
        secondary: song
      });
    } else {
      newSongs.push(song);
    }
  });
  
  return {
    mainCount: mainData.length,
    secondaryCount: secondaryData.length,
    newSongs,
    duplicates,
    newCount: newSongs.length,
    duplicateCount: duplicates.length
  };
};

/**
 * 合并数据
 * 
 * @param {Array} mainData - 主文件数据
 * @param {Array} newSongs - 要添加的新歌曲
 * @param {Object} strategy - 合并策略
 * @returns {Array} 合并后的数据
 */
const mergeData = (mainData, newSongs, strategy) => {
  let result = [...mainData];
  
  // 是否对新歌曲按专辑排序
  let songsToAdd = [...newSongs];
  if (strategy.sortNewByAlbum) {
    songsToAdd.sort((a, b) => {
      const albumCompare = (a.album || '').localeCompare(b.album || '');
      if (albumCompare !== 0) return albumCompare;
      return (a.name || '').localeCompare(b.name || '');
    });
  }
  
  // 添加新歌曲
  if (strategy.appendPosition === 'start') {
    result = [...songsToAdd, ...result];
  } else {
    result = [...result, ...songsToAdd];
  }
  
  return result;
};

/**
 * 生成预览报告
 * 
 * @param {Object} analysis - 差异分析结果
 * @returns {string} 预览报告文本
 */
const generatePreview = (analysis) => {
  const lines = [];
  
  lines.push('╔═══════════════════════════════════════════════════════════════╗');
  lines.push('║                合并预览                                       ║');
  lines.push('╚═══════════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`📊 统计信息`);
  lines.push(`  - 主文件歌曲数: ${analysis.mainCount}首`);
  lines.push(`  - 副文件歌曲数: ${analysis.secondaryCount}首`);
  lines.push(`  - 将要添加的新歌曲: ${analysis.newCount}首`);
  lines.push(`  - 重复歌曲（不会添加）: ${analysis.duplicateCount}首`);
  lines.push(`  - 合并后总数: ${analysis.mainCount + analysis.newCount}首`);
  lines.push('');
  
  if (analysis.newCount > 0) {
    lines.push('─────────────────────────────────────────────────────────────');
    lines.push('🆕 将要添加的歌曲列表:');
    lines.push('─────────────────────────────────────────────────────────────');
    
    // 按专辑分组显示
    const songsByAlbum = {};
    analysis.newSongs.forEach(song => {
      const album = song.album || '未知专辑';
      if (!songsByAlbum[album]) {
        songsByAlbum[album] = [];
      }
      songsByAlbum[album].push(song);
    });
    
    Object.keys(songsByAlbum).sort().forEach(album => {
      lines.push(`\n  【${album}】 (${songsByAlbum[album].length}首)`);
      songsByAlbum[album].forEach((song, idx) => {
        lines.push(`    ${idx + 1}. ${song.name} - ${song.artist} [${song.ext}, ${song.bitrate}kbps]`);
      });
    });
    lines.push('');
  }
  
  return lines.join('\n');
};

/**
 * 保存合并结果
 * 
 * @param {Array} mergedData - 合并后的数据
 * @param {boolean} isArrayFormat - 是否为数组格式
 * @param {string} outputPath - 输出文件路径
 */
const saveMergedData = (mergedData, isArrayFormat, outputPath) => {
  try {
    const outputData = isArrayFormat 
      ? mergedData 
      : { data: mergedData };
    
    const jsonString = JSON.stringify(outputData, null, 2);
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, jsonString, 'utf8');
    console.log(`✓ 合并结果已保存到: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error(`✗ 保存文件失败: ${error.message}`);
    throw error;
  }
};

/**
 * 主合并函数
 * 
 * @param {Object} userConfig - 用户配置对象
 * @returns {Object} 合并结果
 */
const mergeMusic = (userConfig = config) => {
  const cfg = { ...config, ...userConfig };
  
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           音乐JSON文件合并工具                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // 读取文件
  console.log('📖 读取文件...');
  console.log(`  主文件: ${cfg.mainFile}`);
  const mainFile = readJsonFile(cfg.mainFile);
  console.log(`  ✓ 主文件加载成功，共 ${mainFile.data.length} 条记录`);
  
  console.log(`  副文件: ${cfg.secondaryFile}`);
  const secondaryFile = readJsonFile(cfg.secondaryFile);
  console.log(`  ✓ 副文件加载成功，共 ${secondaryFile.data.length} 条记录`);
  console.log('');
  
  // 分析差异
  console.log('🔍 分析差异...');
  const analysis = analyzeDifferences(
    mainFile.data,
    secondaryFile.data,
    cfg.mergeStrategy.uniqueBy
  );
  console.log(`  ✓ 分析完成`);
  console.log('');
  
  // 显示预览
  if (cfg.showPreview) {
    const preview = generatePreview(analysis);
    console.log(preview);
  }
  
  // 如果没有新歌曲，直接返回
  if (analysis.newCount === 0) {
    console.log('✓ 副文件中没有新歌曲需要合并');
    return {
      success: true,
      merged: false,
      analysis,
      message: '没有新内容需要合并'
    };
  }
  
  // 创建备份
  if (cfg.createBackup) {
    console.log('💾 创建备份...');
    createBackup(cfg.mainFile, cfg.backupPath);
    console.log('');
  }
  
  // 合并数据
  console.log('🔄 合并数据...');
  const mergedData = mergeData(
    mainFile.data,
    analysis.newSongs,
    cfg.mergeStrategy
  );
  console.log(`  ✓ 合并完成，新增 ${analysis.newCount} 首歌曲`);
  console.log(`  总计: ${mainFile.data.length} → ${mergedData.length} 首`);
  console.log('');
  
  // 保存结果
  console.log('💾 保存合并结果...');
  const outputPath = cfg.outputFile || cfg.mainFile;
  saveMergedData(mergedData, mainFile.isArrayFormat, outputPath);
  console.log('');
  
  // 生成合并报告
  const report = generateMergeReport(analysis, cfg);
  const reportPath = outputPath.replace(/\.json$/, '.merge-report.txt');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`✓ 合并报告已保存到: ${reportPath}`);
  console.log('');
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ 合并完成！');
  console.log('═══════════════════════════════════════════════════════════════');
  
  return {
    success: true,
    merged: true,
    analysis,
    mergedData,
    outputPath,
    message: `成功合并 ${analysis.newCount} 首新歌曲`
  };
};

/**
 * 生成合并报告
 * 
 * @param {Object} analysis - 分析结果
 * @param {Object} config - 配置对象
 * @returns {string} 合并报告文本
 */
const generateMergeReport = (analysis, config) => {
  const lines = [];
  const timestamp = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    hour12: false 
  });
  
  lines.push('╔═══════════════════════════════════════════════════════════════╗');
  lines.push('║              音乐JSON文件合并报告                             ║');
  lines.push('╚═══════════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`生成时间: ${timestamp}`);
  lines.push('');
  
  lines.push('📋 文件信息');
  lines.push('─────────────────────────────────────────────────────────────');
  lines.push(`主文件: ${config.mainFile}`);
  lines.push(`副文件: ${config.secondaryFile}`);
  lines.push(`输出文件: ${config.outputFile}`);
  lines.push('');
  
  lines.push('📊 合并统计');
  lines.push('─────────────────────────────────────────────────────────────');
  lines.push(`主文件原有歌曲: ${analysis.mainCount}首`);
  lines.push(`副文件歌曲总数: ${analysis.secondaryCount}首`);
  lines.push(`新增歌曲数量: ${analysis.newCount}首`);
  lines.push(`重复歌曲数量: ${analysis.duplicateCount}首`);
  lines.push(`合并后总数: ${analysis.mainCount + analysis.newCount}首`);
  lines.push('');
  
  lines.push('⚙️ 合并策略');
  lines.push('─────────────────────────────────────────────────────────────');
  lines.push(`唯一性判断依据: ${config.mergeStrategy.uniqueBy}`);
  lines.push(`新歌曲添加位置: ${config.mergeStrategy.appendPosition === 'end' ? '末尾' : '开头'}`);
  lines.push(`新歌曲是否排序: ${config.mergeStrategy.sortNewByAlbum ? '是（按专辑）' : '否'}`);
  lines.push('');
  
  if (analysis.newCount > 0) {
    lines.push('═════════════════════════════════════════════════════════════');
    lines.push('🆕 新增歌曲详情');
    lines.push('═════════════════════════════════════════════════════════════');
    lines.push('');
    
    // 按专辑分组
    const songsByAlbum = {};
    analysis.newSongs.forEach(song => {
      const album = song.album || '未知专辑';
      if (!songsByAlbum[album]) {
        songsByAlbum[album] = [];
      }
      songsByAlbum[album].push(song);
    });
    
    // 统计专辑
    const albumCount = Object.keys(songsByAlbum).length;
    lines.push(`共涉及 ${albumCount} 个专辑:`);
    lines.push('');
    
    Object.keys(songsByAlbum).sort().forEach(album => {
      const songs = songsByAlbum[album];
      lines.push(`【${album}】 (${songs.length}首)`);
      songs.forEach((song, idx) => {
        lines.push(`  ${idx + 1}. ${song.name}`);
        lines.push(`     歌手: ${song.artist}`);
        lines.push(`     格式: ${song.ext} | 码率: ${song.bitrate}kbps | ID: ${song.id}`);
      });
      lines.push('');
    });
  }
  
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push('✅ 合并完成');
  lines.push('═════════════════════════════════════════════════════════════');
  
  return lines.join('\n');
};

/**
 * 交互式合并（需要用户确认）
 * 
 * @param {Object} userConfig - 用户配置
 * @returns {Promise<Object>} 合并结果
 */
const interactiveMerge = async (userConfig = config) => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => {
    readline.question(query, resolve);
  });
  
  try {
    const cfg = { ...config, ...userConfig };
    
    // 先分析但不合并
    console.log('正在分析文件...\n');
    const mainFile = readJsonFile(cfg.mainFile);
    const secondaryFile = readJsonFile(cfg.secondaryFile);
    const analysis = analyzeDifferences(
      mainFile.data,
      secondaryFile.data,
      cfg.mergeStrategy.uniqueBy
    );
    
    // 显示预览
    const preview = generatePreview(analysis);
    console.log(preview);
    
    if (analysis.newCount === 0) {
      console.log('没有新内容需要合并。');
      readline.close();
      return { success: true, merged: false };
    }
    
    // 询问是否继续
    const answer = await question('\n是否继续合并？(y/n): ');
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('\n操作已取消。');
      readline.close();
      return { success: false, merged: false, message: '用户取消操作' };
    }
    
    readline.close();
    
    // 执行合并
    return mergeMusic({ ...cfg, showPreview: false });
    
  } catch (error) {
    readline.close();
    throw error;
  }
};

/**
 * 批量合并多个文件
 * 
 * @param {string} mainFile - 主文件路径
 * @param {Array<string>} secondaryFiles - 副文件路径数组
 * @param {Object} options - 合并选项
 * @returns {Object} 批量合并结果
 */
const batchMerge = (mainFile, secondaryFiles, options = {}) => {
  console.log('开始批量合并...\n');
  
  let currentData = readJsonFile(mainFile).data;
  const isArrayFormat = readJsonFile(mainFile).isArrayFormat;
  const results = [];
  let totalAdded = 0;
  
  secondaryFiles.forEach((secondaryFile, index) => {
    console.log(`[${index + 1}/${secondaryFiles.length}] 处理: ${secondaryFile}`);
    
    const secondaryData = readJsonFile(secondaryFile).data;
    const analysis = analyzeDifferences(
      currentData,
      secondaryData,
      options.uniqueBy || 'name+album'
    );
    
    if (analysis.newCount > 0) {
      currentData = mergeData(
        currentData,
        analysis.newSongs,
        options.mergeStrategy || config.mergeStrategy
      );
      totalAdded += analysis.newCount;
      console.log(`  ✓ 新增 ${analysis.newCount} 首歌曲`);
    } else {
      console.log(`  - 没有新歌曲`);
    }
    
    results.push({
      file: secondaryFile,
      newCount: analysis.newCount,
      duplicateCount: analysis.duplicateCount
    });
    
    console.log('');
  });
  
  // 保存最终结果
  const outputPath = options.outputFile || mainFile;
  saveMergedData(currentData, isArrayFormat, outputPath);
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ 批量合并完成！共新增 ${totalAdded} 首歌曲`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  return {
    success: true,
    totalAdded,
    results,
    finalCount: currentData.length
  };
};

// 如果直接运行此脚本
if (require.main === module) {
  try {
    mergeMusic();
  } catch (error) {
    console.error('\n✗ 执行失败:', error.message);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  mergeMusic,
  interactiveMerge,
  batchMerge,
  readJsonFile,
  analyzeDifferences,
  mergeData,
  generatePreview,
  createBackup,
  config
};

