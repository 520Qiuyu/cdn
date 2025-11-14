/**
 * 合并 artist/top.json 与 artist/summary.json 并按 count 排序输出
 *
 * @description
 * 该脚本会读取两个列表文件，基于 id 进行浅合并，随后按 count 从大到小排序，
 * 最终写入 artist/atrist.json，方便后续使用统一的数据源。
 *
 * @example
 * // 直接执行脚本
 * // node scripts/mergeTopSummary.js
 */
const fs = require('fs');
const path = require('path');

const FILES = {
  top: path.resolve(__dirname, '../artist/top.json'),
  summary: path.resolve(__dirname, '../artist/summary.json'),
  output: path.resolve(__dirname, '../artist/atrist.json')
};

/**
 * 读取 JSON 文件内容并确保返回数组
 *
 * @param {string} filePath - JSON 文件路径
 * @returns {Array} 解析后的数组数据
 *
 * @example
 * const topList = readJsonFile(FILES.top);
 */
const readJsonFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(fileContent);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (Array.isArray(parsed?.data)) {
    return parsed.data;
  }
  return [];
};

/**
 * 基于 id 合并两个数组，并按 count 降序排序
 *
 * @param {Array} primaryList - 主要数据列表
 * @param {Array} secondaryList - 需要合并的数据列表
 * @returns {Array} 合并并排序后的数组
 *
 * @example
 * const mergedList = mergeArtistCollections(primary, secondary);
 */
const mergeArtistCollections = (primaryList, secondaryList) => {
  const mergedMap = new Map();
  const handleInsert = (item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const { id } = item;
    if (id === undefined || id === null) {
      return;
    }
    const existing = mergedMap.get(id) || {};
    mergedMap.set(id, { ...existing, ...item });
  };

  primaryList.forEach(handleInsert);
  secondaryList.forEach(handleInsert);

  return Array.from(mergedMap.values()).sort((a, b) => {
    const countA = Number(a.count) || 0;
    const countB = Number(b.count) || 0;
    if (countA === countB) {
      return String(a.name || '').localeCompare(String(b.name || ''));
    }
    return countB - countA;
  });
};

/**
 * 将数据写入指定 JSON 文件
 *
 * @param {string} filePath - 输出文件路径
 * @param {Array} data - 需要写入的数组数据
 *
 * @example
 * writeJsonFile(FILES.output, mergedList);
 */
const writeJsonFile = (filePath, data) => {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  fs.writeFileSync(filePath, content, 'utf8');
};

/**
 * 执行合并流程
 *
 * @example
 * run();
 */
const run = () => {
  const topList = readJsonFile(FILES.top);
  const summaryList = readJsonFile(FILES.summary);
  const mergedList = mergeArtistCollections(topList, summaryList);
  writeJsonFile(FILES.output, mergedList);
  console.log(`✅ 合并完成，共 ${mergedList.length} 条记录 -> ${FILES.output}`);
};

try {
  run();
} catch (error) {
  console.error('❌ 合并失败:', error.message);
  process.exit(1);
}

