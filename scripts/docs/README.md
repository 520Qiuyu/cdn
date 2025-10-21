# 音乐JSON工具集

## 简介

这是一套用于处理音乐JSON文件的工具脚本，包含对比和合并功能。

- **对比工具** (`compareMusicJson.js`): 详细分析两个文件的差异
- **合并工具** (`mergeMusicJson.js`): 智能合并多个文件的内容

## 功能特点

- ✅ 统计两个文件的专辑数量和歌曲数量
- ✅ 列出每个专辑包含的所有歌曲
- ✅ 识别仅在某个文件中存在的专辑
- ✅ 识别仅在某个文件中存在的歌曲（基于歌名+专辑名）
- ✅ 对比共同专辑中的歌曲数量差异
- ✅ 生成详细的对比报告
- ✅ 支持配置文件路径
- ✅ 可将结果输出到文件或控制台

## 使用方法

### 方式一：直接运行（使用默认配置）

```bash
node scripts/compareMusicJson.js
```

### 方式二：修改配置后运行

1. 复制配置文件示例：
```bash
cp scripts/config.example.json scripts/config.json
```

2. 编辑 `scripts/config.json`，修改要对比的文件路径：
```json
{
  "file1": "path/to/your/file1.json",
  "file2": "path/to/your/file2.json",
  "outputPath": "./scripts/comparison-report.txt",
  "writeToFile": true,
  "showInConsole": true
}
```

3. 在脚本中加载配置文件运行（需要修改脚本导入配置）

### 方式三：作为模块使用

```javascript
const { compareMusic } = require('./scripts/compareMusicJson.js');

// 自定义配置
const customConfig = {
  file1: 'path/to/file1.json',
  file2: 'path/to/file2.json',
  outputPath: './my-report.txt',
  writeToFile: true,
  showInConsole: true
};

// 执行对比
const result = compareMusic(customConfig);

// 使用返回的结果
console.log(result.analysis1);
console.log(result.differences);
```

## 配置选项

| 选项 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `file1` | string | 第一个JSON文件路径 | - |
| `file2` | string | 第二个JSON文件路径 | - |
| `outputPath` | string | 输出报告的文件路径 | `./scripts/comparison-report.txt` |
| `writeToFile` | boolean | 是否将结果写入文件 | `true` |
| `showInConsole` | boolean | 是否在控制台显示结果 | `true` |

## JSON文件格式要求

脚本支持两种JSON格式：

### 格式一：直接数组
```json
[
  {
    "artist": "歌手名",
    "artists": ["歌手名"],
    "album": "专辑名",
    "id": 12345,
    "name": "歌曲名",
    "ext": "flac",
    "bitrate": 1700
  }
]
```

### 格式二：data字段包装
```json
{
  "data": [
    {
      "artist": "歌手名",
      "artists": ["歌手名"],
      "album": "专辑名",
      "id": 12345,
      "name": "歌曲名",
      "ext": "flac",
      "bitrate": 1700
    }
  ]
}
```

## 差异识别规则

- **专辑差异**：基于专辑名（album字段）
- **歌曲差异**：基于"歌曲名 + 专辑名"组合的唯一标识

同一首歌在不同专辑中会被视为不同的歌曲。

## 输出示例

```
╔═══════════════════════════════════════════════════════════════╗
║           音乐JSON文件对比分析报告                            ║
╚═══════════════════════════════════════════════════════════════╝

📊 总体统计
─────────────────────────────────────────────────────────────
文件1: stolenList (28).json
  - 专辑总数: 100个
  - 歌曲总数: 500首

文件2: stolenList (29).json
  - 专辑总数: 105个
  - 歌曲总数: 520首

差异统计:
  - 专辑数差异: +5个
  - 歌曲数差异: +20首
...
```

## 注意事项

1. 确保JSON文件编码为UTF-8
2. 大型文件可能需要较长处理时间
3. 输出报告会覆盖已存在的同名文件
4. 建议将配置文件路径使用绝对路径或相对于项目根目录的路径

---

## 二、合并工具 (`mergeMusicJson.js`)

### 功能特点

- ✅ 以主文件为基准进行智能合并
- ✅ 自动识别副文件中的新歌曲
- ✅ 避免重复添加已存在的歌曲
- ✅ 支持多种唯一性判断策略
- ✅ 自动创建备份文件
- ✅ 生成详细的合并报告
- ✅ 支持批量合并多个文件
- ✅ 交互式合并模式（需用户确认）

### 使用方法

#### 方式一：直接运行（自动合并）

```bash
node scripts/mergeMusicJson.js
```

默认配置会：
- 以 `stolenList (28).json` 为主文件
- 从 `stolenList (29).json` 提取新歌曲
- 保存到 `scripts/merged-result.json`
- 自动创建主文件备份

#### 方式二：修改配置运行

编辑 `scripts/mergeMusicJson.js` 中的 `config` 对象：

```javascript
const config = {
  mainFile: 'path/to/main.json',        // 主文件（基准）
  secondaryFile: 'path/to/secondary.json', // 副文件
  outputFile: './scripts/merged-result.json', // 输出路径
  createBackup: true,                    // 是否创建备份
  backupPath: '',                        // 备份路径（空则自动生成）
  showPreview: true,                     // 是否显示预览
  mergeStrategy: {
    uniqueBy: 'name+album',              // 唯一性判断
    keepMainOrder: true,                 // 保持主文件排序
    appendPosition: 'end',               // 新歌曲位置: 'end' 或 'start'
    sortNewByAlbum: true                 // 新歌曲是否按专辑排序
  }
};
```

#### 方式三：作为模块使用

```javascript
const { mergeMusic } = require('./scripts/mergeMusicJson.js');

const customConfig = {
  mainFile: 'artist/3.json',
  secondaryFile: 'artist/5.json',
  outputFile: 'artist/merged.json',
  createBackup: true
};

const result = mergeMusic(customConfig);
console.log(result.message); // "成功合并 X 首新歌曲"
```

#### 方式四：交互式合并（需确认）

```javascript
const { interactiveMerge } = require('./scripts/mergeMusicJson.js');

// 会先显示预览，询问是否继续
await interactiveMerge(config);
```

#### 方式五：批量合并

```javascript
const { batchMerge } = require('./scripts/mergeMusicJson.js');

// 将多个文件合并到主文件
batchMerge(
  'artist/main.json',
  ['artist/file1.json', 'artist/file2.json', 'artist/file3.json'],
  {
    outputFile: 'artist/merged.json',
    uniqueBy: 'name+album'
  }
);
```

### 合并策略说明

#### uniqueBy（唯一性判断依据）

- `'name+album'` (推荐): 基于歌曲名+专辑名判断，同一首歌在不同专辑视为不同歌曲
- `'id'`: 基于歌曲ID判断
- `'name+artist+album'`: 基于歌曲名+歌手+专辑名判断（最严格）

#### appendPosition（新歌曲添加位置）

- `'end'` (默认): 添加到文件末尾
- `'start'`: 添加到文件开头

#### sortNewByAlbum（新歌曲排序）

- `true` (推荐): 新增的歌曲按专辑名排序，同专辑的歌曲会聚在一起
- `false`: 保持副文件中的原有顺序

### 输出文件

合并后会生成两个文件：

1. **合并结果JSON** (`merged-result.json`): 包含合并后的所有歌曲
2. **合并报告** (`merged-result.merge-report.txt`): 详细的合并过程记录

### 安全机制

1. **自动备份**: 默认会备份主文件，文件名格式为 `原文件名.backup.时间戳.json`
2. **预览模式**: 默认显示合并预览，了解将要添加的内容
3. **不修改原文件**: 默认输出到新文件，保护原始数据

### 使用示例

#### 示例1：合并周杰伦的两个专辑列表

```javascript
const { mergeMusic } = require('./scripts/mergeMusicJson.js');

mergeMusic({
  mainFile: 'artist/3.json',
  secondaryFile: 'artist/5.json',
  outputFile: 'artist/3-merged.json',
  createBackup: true
});
```

#### 示例2：直接覆盖主文件

```javascript
mergeMusic({
  mainFile: 'artist/3.json',
  secondaryFile: 'artist/5.json',
  outputFile: 'artist/3.json',  // 直接覆盖
  createBackup: true              // 会先备份
});
```

#### 示例3：合并多个来源

```javascript
const { batchMerge } = require('./scripts/mergeMusicJson.js');

batchMerge(
  'artist/main.json',
  [
    'source1/music.json',
    'source2/music.json',
    'source3/music.json'
  ],
  {
    outputFile: 'artist/complete.json',
    createBackup: true
  }
);
```

### 注意事项

1. 合并前会自动创建备份，除非设置 `createBackup: false`
2. 备份文件包含时间戳，不会覆盖已有备份
3. 大文件合并可能需要较长时间
4. 建议先使用对比工具了解差异，再进行合并
5. 合并报告会详细记录所有新增的歌曲信息

---

## 许可

MIT

