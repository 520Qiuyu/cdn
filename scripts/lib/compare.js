/**
 * 音乐JSON文件对比工具
 * 
 * 用于对比两个音乐JSON文件的差异，包括专辑统计和歌曲详情
 * 
 * @description
 * 该脚本会分析两个JSON文件，统计专辑数量、每个专辑的歌曲列表，
 * 并生成详细的差异报告
 * 
 * @example
 * // 使用方式
 * node scripts/compareMusicJson.js
 * 
 * // 或者直接传入配置
 * const { compareMusic } = require('./scripts/compareMusicJson.js');
 * compareMusic(config);
 */

const fs = require('fs');
const path = require('path');

/**
 * 配置文件路径
 * 可以根据需要修改这些路径
 */
const config = {
  // 第一个JSON文件路径
  file1: 'D:/Documents/cdn/artist/6452_mp3.json',
  // 第二个JSON文件路径
  file2: 'D:/Documents/cdn/artist/3.json',
  // 输出报告的路径（可选）
  outputPath: './scripts/output/zjl-comparison-report.txt',
  // 是否将结果写入文件
  writeToFile: true,
  // 是否在控制台显示结果
  showInConsole: true
};

/**
 * 读取JSON文件
 * 
 * @param {string} filePath - 文件路径
 * @returns {Array} 解析后的数据数组
 */
const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`);
    throw error;
  }
};

/**
 * 统计专辑信息
 * 
 * @param {Array} data - 音乐数据数组
 * @returns {Object} 包含专辑统计信息的对象
 */
const analyzeAlbums = (data) => {
  const albums = {};
  const songsByAlbum = {};

  data.forEach(item => {
    const album = item.album || '未知专辑';
    const songName = item.name;
    const artist = item.artist;
    
    // 统计专辑歌曲数量
    if (!albums[album]) {
      albums[album] = 0;
      songsByAlbum[album] = [];
    }
    
    albums[album]++;
    songsByAlbum[album].push({
      name: songName,
      artist: artist,
      id: item.id,
      ext: item.ext,
      bitrate: item.bitrate
    });
  });

  return {
    albums,
    songsByAlbum,
    totalAlbums: Object.keys(albums).length,
    totalSongs: data.length
  };
};

/**
 * 生成唯一标识符
 * 
 * @param {string} songName - 歌曲名
 * @param {string} album - 专辑名
 * @returns {string} 唯一标识符
 */
const generateKey = (songName, album) => {
  return `${songName}@@${album}`;
};

/**
 * 对比两个文件的差异
 * 
 * @param {Object} analysis1 - 第一个文件的分析结果
 * @param {Object} analysis2 - 第二个文件的分析结果
 * @returns {Object} 差异对比结果
 */
const compareDifferences = (analysis1, analysis2) => {
  const albums1 = new Set(Object.keys(analysis1.albums));
  const albums2 = new Set(Object.keys(analysis2.albums));
  
  // 找出专辑差异
  const onlyInFile1 = [...albums1].filter(x => !albums2.has(x)).sort();
  const onlyInFile2 = [...albums2].filter(x => !albums1.has(x)).sort();
  const commonAlbums = [...albums1].filter(x => albums2.has(x)).sort();
  
  // 创建歌曲映射
  const songs1Map = new Map();
  const songs2Map = new Map();
  
  Object.entries(analysis1.songsByAlbum).forEach(([album, songs]) => {
    songs.forEach(song => {
      const key = generateKey(song.name, album);
      songs1Map.set(key, { ...song, album });
    });
  });
  
  Object.entries(analysis2.songsByAlbum).forEach(([album, songs]) => {
    songs.forEach(song => {
      const key = generateKey(song.name, album);
      songs2Map.set(key, { ...song, album });
    });
  });
  
  // 找出歌曲差异
  const songsOnlyIn1 = [];
  const songsOnlyIn2 = [];
  
  songs1Map.forEach((song, key) => {
    if (!songs2Map.has(key)) {
      songsOnlyIn1.push(song);
    }
  });
  
  songs2Map.forEach((song, key) => {
    if (!songs1Map.has(key)) {
      songsOnlyIn2.push(song);
    }
  });
  
  return {
    albums: {
      onlyInFile1,
      onlyInFile2,
      commonAlbums
    },
    songs: {
      onlyInFile1: songsOnlyIn1.sort((a, b) => a.album.localeCompare(b.album)),
      onlyInFile2: songsOnlyIn2.sort((a, b) => a.album.localeCompare(b.album))
    }
  };
};

/**
 * 格式化输出报告
 * 
 * @param {Object} analysis1 - 第一个文件的分析结果
 * @param {Object} analysis2 - 第二个文件的分析结果
 * @param {Object} differences - 差异对比结果
 * @param {string} file1Name - 文件1名称
 * @param {string} file2Name - 文件2名称
 * @returns {string} 格式化后的报告文本
 */
const formatReport = (analysis1, analysis2, differences, file1Name, file2Name) => {
  const lines = [];
  
  lines.push('╔═══════════════════════════════════════════════════════════════╗');
  lines.push('║           音乐JSON文件对比分析报告                            ║');
  lines.push('╚═══════════════════════════════════════════════════════════════╝');
  lines.push('');
  
  // 总体统计
  lines.push('📊 总体统计');
  lines.push('─────────────────────────────────────────────────────────────');
  lines.push(`文件1: ${file1Name}`);
  lines.push(`  - 专辑总数: ${analysis1.totalAlbums}个`);
  lines.push(`  - 歌曲总数: ${analysis1.totalSongs}首`);
  lines.push('');
  lines.push(`文件2: ${file2Name}`);
  lines.push(`  - 专辑总数: ${analysis2.totalAlbums}个`);
  lines.push(`  - 歌曲总数: ${analysis2.totalSongs}首`);
  lines.push('');
  lines.push(`差异统计:`);
  lines.push(`  - 专辑数差异: ${analysis2.totalAlbums - analysis1.totalAlbums > 0 ? '+' : ''}${analysis2.totalAlbums - analysis1.totalAlbums}个`);
  lines.push(`  - 歌曲数差异: ${analysis2.totalSongs - analysis1.totalSongs > 0 ? '+' : ''}${analysis2.totalSongs - analysis1.totalSongs}首`);
  lines.push('');
  
  // 专辑差异
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push('🔍 专辑差异详情');
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push('');
  
  // 仅在文件1中的专辑
  if (differences.albums.onlyInFile1.length > 0) {
    lines.push(`📁 仅在 ${file1Name} 中的专辑 (${differences.albums.onlyInFile1.length}个):`);
    lines.push('─────────────────────────────────────────────────────────────');
    differences.albums.onlyInFile1.forEach(album => {
      const count = analysis1.albums[album];
      lines.push(`  ▶ ${album} (${count}首)`);
      const songs = analysis1.songsByAlbum[album];
      songs.forEach((song, idx) => {
        lines.push(`      ${idx + 1}. ${song.name} - ${song.artist}`);
      });
      lines.push('');
    });
  } else {
    lines.push(`📁 仅在 ${file1Name} 中的专辑: 无`);
    lines.push('');
  }
  
  // 仅在文件2中的专辑
  if (differences.albums.onlyInFile2.length > 0) {
    lines.push(`📁 仅在 ${file2Name} 中的专辑 (${differences.albums.onlyInFile2.length}个):`);
    lines.push('─────────────────────────────────────────────────────────────');
    differences.albums.onlyInFile2.forEach(album => {
      const count = analysis2.albums[album];
      lines.push(`  ▶ ${album} (${count}首)`);
      const songs = analysis2.songsByAlbum[album];
      songs.forEach((song, idx) => {
        lines.push(`      ${idx + 1}. ${song.name} - ${song.artist}`);
      });
      lines.push('');
    });
  } else {
    lines.push(`📁 仅在 ${file2Name} 中的专辑: 无`);
    lines.push('');
  }
  
  // 共同专辑对比
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push(`📂 共同专辑对比 (${differences.albums.commonAlbums.length}个)`);
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push('');
  
  differences.albums.commonAlbums.forEach(album => {
    const count1 = analysis1.albums[album];
    const count2 = analysis2.albums[album];
    const diff = count2 - count1;
    const diffStr = diff > 0 ? `+${diff}` : diff.toString();
    
    lines.push(`  ▶ ${album}`);
    lines.push(`      ${file1Name}: ${count1}首 | ${file2Name}: ${count2}首 [${diffStr}]`);
    
    if (diff !== 0) {
      lines.push(`      ⚠️ 存在差异，详见歌曲差异部分`);
    }
    lines.push('');
  });
  
  // 歌曲差异
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push('🎵 歌曲差异详情');
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push('');
  
  // 仅在文件1中的歌曲
  if (differences.songs.onlyInFile1.length > 0) {
    lines.push(`🎶 仅在 ${file1Name} 中的歌曲 (${differences.songs.onlyInFile1.length}首):`);
    lines.push('─────────────────────────────────────────────────────────────');
    
    let currentAlbum = '';
    differences.songs.onlyInFile1.forEach(song => {
      if (song.album !== currentAlbum) {
        if (currentAlbum !== '') lines.push('');
        currentAlbum = song.album;
        lines.push(`  【${song.album}】`);
      }
      lines.push(`    • ${song.name} - ${song.artist} [${song.ext}, ${song.bitrate}kbps]`);
    });
    lines.push('');
  } else {
    lines.push(`🎶 仅在 ${file1Name} 中的歌曲: 无`);
    lines.push('');
  }
  
  // 仅在文件2中的歌曲
  if (differences.songs.onlyInFile2.length > 0) {
    lines.push(`🎶 仅在 ${file2Name} 中的歌曲 (${differences.songs.onlyInFile2.length}首):`);
    lines.push('─────────────────────────────────────────────────────────────');
    
    let currentAlbum = '';
    differences.songs.onlyInFile2.forEach(song => {
      if (song.album !== currentAlbum) {
        if (currentAlbum !== '') lines.push('');
        currentAlbum = song.album;
        lines.push(`  【${song.album}】`);
      }
      lines.push(`    • ${song.name} - ${song.artist} [${song.ext}, ${song.bitrate}kbps]`);
    });
    lines.push('');
  } else {
    lines.push(`🎶 仅在 ${file2Name} 中的歌曲: 无`);
    lines.push('');
  }
  
  // 总结
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push('📋 对比总结');
  lines.push('═════════════════════════════════════════════════════════════');
  lines.push(`仅在文件1的专辑: ${differences.albums.onlyInFile1.length}个`);
  lines.push(`仅在文件2的专辑: ${differences.albums.onlyInFile2.length}个`);
  lines.push(`共同专辑: ${differences.albums.commonAlbums.length}个`);
  lines.push(`仅在文件1的歌曲: ${differences.songs.onlyInFile1.length}首`);
  lines.push(`仅在文件2的歌曲: ${differences.songs.onlyInFile2.length}首`);
  lines.push('');
  
  return lines.join('\n');
};

/**
 * 主对比函数
 * 
 * @param {Object} userConfig - 用户配置对象
 * @returns {Object} 对比结果
 */
const compareMusic = (userConfig = config) => {
  const cfg = { ...config, ...userConfig };
  
  console.log('开始对比音乐JSON文件...\n');
  
  // 读取文件
  console.log(`读取文件1: ${cfg.file1}`);
  const data1 = readJsonFile(cfg.file1);
  console.log(`✓ 文件1加载成功，共 ${data1.length} 条记录\n`);
  
  console.log(`读取文件2: ${cfg.file2}`);
  const data2 = readJsonFile(cfg.file2);
  console.log(`✓ 文件2加载成功，共 ${data2.length} 条记录\n`);
  
  // 分析数据
  console.log('分析文件1...');
  const analysis1 = analyzeAlbums(data1);
  console.log(`✓ 文件1: ${analysis1.totalAlbums}个专辑，${analysis1.totalSongs}首歌曲\n`);
  
  console.log('分析文件2...');
  const analysis2 = analyzeAlbums(data2);
  console.log(`✓ 文件2: ${analysis2.totalAlbums}个专辑，${analysis2.totalSongs}首歌曲\n`);
  
  // 对比差异
  console.log('对比差异...');
  const differences = compareDifferences(analysis1, analysis2);
  console.log('✓ 对比完成\n');
  
  // 生成报告
  const file1Name = path.basename(cfg.file1);
  const file2Name = path.basename(cfg.file2);
  const report = formatReport(analysis1, analysis2, differences, file1Name, file2Name);
  
  // 输出到控制台
  if (cfg.showInConsole) {
    console.log('\n' + report);
  }
  
  // 写入文件
  if (cfg.writeToFile && cfg.outputPath) {
    try {
      fs.writeFileSync(cfg.outputPath, report, 'utf8');
      console.log(`\n✓ 报告已保存到: ${cfg.outputPath}`);
    } catch (error) {
      console.error(`\n✗ 保存报告失败: ${error.message}`);
    }
  }
  
  return {
    analysis1,
    analysis2,
    differences,
    report
  };
};

// 如果直接运行此脚本
if (require.main === module) {
  try {
    compareMusic();
  } catch (error) {
    console.error('\n执行失败:', error.message);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  compareMusic,
  readJsonFile,
  analyzeAlbums,
  compareDifferences,
  formatReport,
  config
};

