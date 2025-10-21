# 快速使用指南

## 🚀 快速开始

### 1. 对比两个文件

```bash
# 直接运行对比脚本
node scripts/compareMusicJson.js
```

### 2. 合并两个文件

```bash
# 直接运行合并脚本
node scripts/mergeMusicJson.js
```

---

## 📝 常见使用场景

### 场景1: 对比两个艺人的歌曲列表

**需求**: 查看 `artist/3.json` 和 `artist/5.json` 的差异

**步骤**:
1. 打开 `scripts/compareMusicJson.js`
2. 修改配置:
```javascript
const config = {
  file1: 'artist/3.json',
  file2: 'artist/5.json',
  outputPath: './scripts/artist-comparison.txt',
  writeToFile: true,
  showInConsole: true
};
```
3. 运行: `node scripts/compareMusicJson.js`
4. 查看报告: `scripts/artist-comparison.txt`

---

### 场景2: 将新歌曲合并到主列表

**需求**: 将 `artist/5.json` 中的新歌曲添加到 `artist/3.json`

**步骤**:
1. 打开 `scripts/mergeMusicJson.js`
2. 修改配置:
```javascript
const config = {
  mainFile: 'artist/3.json',           // 主文件（基准）
  secondaryFile: 'artist/5.json',      // 副文件（提取新歌曲）
  outputFile: 'artist/3-merged.json',  // 输出文件
  createBackup: true,                  // 自动备份
  showPreview: true                    // 显示预览
};
```
3. 运行: `node scripts/mergeMusicJson.js`
4. 检查结果:
   - 合并后的文件: `artist/3-merged.json`
   - 合并报告: `artist/3-merged.merge-report.txt`
   - 备份文件: `artist/3.backup.时间戳.json`

---

### 场景3: 直接覆盖主文件

**需求**: 将新歌曲直接合并到原文件，不创建新文件

**步骤**:
1. 修改配置:
```javascript
const config = {
  mainFile: 'artist/3.json',
  secondaryFile: 'artist/5.json',
  outputFile: 'artist/3.json',    // ⚠️ 直接覆盖主文件
  createBackup: true,             // ✅ 强烈建议开启备份
  showPreview: true
};
```
2. 运行并确认预览信息
3. 主文件会被更新，原文件保存为备份

---

### 场景4: 批量合并多个来源

**需求**: 将多个文件合并到一个主文件

**代码示例**:
```javascript
const { batchMerge } = require('./scripts/mergeMusicJson.js');

batchMerge(
  'artist/complete.json',  // 主文件
  [
    'source1/list.json',
    'source2/list.json',
    'source3/list.json'
  ],
  {
    outputFile: 'artist/complete.json',
    createBackup: true
  }
);
```

---

## ⚙️ 配置参数详解

### 对比工具配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `file1` | 第一个文件路径 | - |
| `file2` | 第二个文件路径 | - |
| `outputPath` | 报告输出路径 | `./scripts/comparison-report.txt` |
| `writeToFile` | 是否保存到文件 | `true` |
| `showInConsole` | 是否显示在控制台 | `true` |

### 合并工具配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `mainFile` | 主文件路径（基准） | - |
| `secondaryFile` | 副文件路径 | - |
| `outputFile` | 输出文件路径 | `./scripts/merged-result.json` |
| `createBackup` | 是否创建备份 | `true` |
| `backupPath` | 备份文件路径 | 自动生成 |
| `showPreview` | 是否显示预览 | `true` |

### 合并策略配置

| 参数 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| `uniqueBy` | 唯一性判断依据 | `name+album`, `id`, `name+artist+album` | `name+album` |
| `keepMainOrder` | 保持主文件排序 | `true`, `false` | `true` |
| `appendPosition` | 新歌曲添加位置 | `end`, `start` | `end` |
| `sortNewByAlbum` | 新歌曲按专辑排序 | `true`, `false` | `true` |

---

## 🔧 工作流程建议

### 推荐工作流程

1. **先对比** → 了解差异
```bash
node scripts/compareMusicJson.js
```

2. **查看报告** → 确认要合并的内容
```bash
cat scripts/comparison-report.txt
```

3. **再合并** → 执行合并操作
```bash
node scripts/mergeMusicJson.js
```

4. **验证结果** → 检查合并是否正确
```bash
# 查看合并报告
cat scripts/merged-result.merge-report.txt
```

---

## 💡 实用技巧

### 技巧1: 仅查看新歌曲，不实际合并

修改合并脚本配置:
```javascript
showPreview: true,    // 显示预览
createBackup: false,  // 不创建备份
```
运行后查看预览，然后手动中断程序（不会保存）

### 技巧2: 使用不同的唯一性判断

如果发现很多歌曲被误判为重复，尝试更严格的策略:
```javascript
mergeStrategy: {
  uniqueBy: 'name+artist+album'  // 更严格
}
```

### 技巧3: 定期备份整合

```bash
# 定期运行，保持主文件最新
node scripts/mergeMusicJson.js

# 备份文件会自动累积，可定期清理旧备份
```

### 技巧4: 快速验证合并结果

```bash
# 统计合并后的文件
node -e "const d=require('./scripts/merged-result.json'); console.log('歌曲:', d.length)"
```

---

## ❓ 常见问题

### Q1: 合并后歌曲数量不对？
A: 检查 `uniqueBy` 策略是否合适，可能需要调整唯一性判断条件

### Q2: 如何恢复备份？
A: 备份文件格式为 `原文件名.backup.时间戳.json`，直接重命名即可恢复

### Q3: 可以一次合并3个以上的文件吗？
A: 可以，使用 `batchMerge` 函数

### Q4: 合并会修改原文件吗？
A: 不会，除非你设置 `outputFile` 为主文件路径，且会先创建备份

### Q5: 如何自定义输出格式？
A: 修改 `formatReport` 或 `generateMergeReport` 函数

---

## 📞 支持

如有问题或建议，请查看 `README.md` 获取更多信息。

