# 音乐JSON工具集

一套用于处理音乐JSON文件的命令行工具，包含对比和合并功能。

## 📁 目录结构

```
scripts/
├── cli.js                      # 命令行入口文件
├── README.md                   # 本文件
├── .gitignore                  # Git忽略配置
│
├── lib/                        # 核心功能库
│   ├── compare.js              # 对比工具
│   └── merge.js                # 合并工具
│
├── config/                     # 配置文件目录
│   ├── compare.example.json    # 对比工具配置示例
│   └── merge.example.json      # 合并工具配置示例
│
├── docs/                       # 文档目录
│   ├── README.md               # 详细功能文档
│   ├── USAGE.md                # 快速使用指南
│   └── CHANGELOG.md            # 更新日志
│
└── output/                     # 输出文件目录
    ├── *.txt                   # 对比报告
    ├── *.json                  # 合并结果
    └── *.merge-report.txt      # 合并报告
```

## 🚀 快速开始

### 安装

无需安装，直接使用Node.js运行即可。

### 基本用法

```bash
# 显示帮助
node scripts/cli.js help

# 对比两个文件
node scripts/cli.js compare file1.json file2.json

# 合并两个文件
node scripts/cli.js merge main.json secondary.json output.json
```

## 📖 文档

- **[详细功能文档](./docs/README.md)** - 完整的API和功能说明
- **[快速使用指南](./docs/USAGE.md)** - 常见场景和示例
- **[更新日志](./docs/CHANGELOG.md)** - 版本历史和更新记录

## ⚡ 核心功能

### 1. 对比功能 (`lib/compare.js`)

对比两个音乐JSON文件的差异，生成详细报告。

**特点**:
- 统计专辑和歌曲数量
- 识别专辑和歌曲差异
- 按专辑分组展示
- 生成可读性强的报告

**使用示例**:
```bash
node scripts/cli.js compare artist/3.json artist/5.json
```

### 2. 合并功能 (`lib/merge.js`)

以主文件为基准，智能合并副文件中的新歌曲。

**特点**:
- 自动识别新歌曲
- 避免重复添加
- 自动备份原文件
- 支持多种合并策略
- 生成详细合并报告

**使用示例**:
```bash
node scripts/cli.js merge main.json new.json merged.json
```

## 🔧 配置

所有配置文件模板位于 `config/` 目录：

- `compare.example.json` - 对比工具配置
- `merge.example.json` - 合并工具配置

复制并修改配置文件后，可在代码中引用。

## 📊 输出文件

所有生成的文件都保存在 `output/` 目录：

- 对比报告 (`.txt`)
- 合并结果 (`.json`)
- 合并报告 (`.merge-report.txt`)

## 🎯 设计理念

- **模块化**: 功能分离，易于维护和扩展
- **配置化**: 路径集中管理，方便复用
- **安全性**: 自动备份，保护数据
- **易用性**: 友好的CLI和详细的文档

## 📝 支持的JSON格式

### 格式一：数组格式
```json
[
  {
    "artist": "歌手名",
    "album": "专辑名",
    "name": "歌曲名",
    "id": 12345,
    "ext": "flac",
    "bitrate": 1700
  }
]
```

### 格式二：对象格式
```json
{
  "data": [
    {
      "artist": "歌手名",
      "album": "专辑名",
      "name": "歌曲名",
      "id": 12345,
      "ext": "flac",
      "bitrate": 1700
    }
  ]
}
```

## 🤝 贡献

欢迎提出问题和改进建议！

## 📄 许可

MIT License
