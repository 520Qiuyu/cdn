# 📁 项目目录结构说明

## 整体结构

```
scripts/
│
├── 📄 cli.js                    # CLI命令行工具入口
├── 📄 package.json              # 项目配置文件
├── 📄 README.md                 # 项目主文档
├── 📄 STRUCTURE.md              # 目录结构说明（本文件）
├── 📄 .gitignore                # Git忽略配置
│
├── 📂 lib/                      # 核心功能库
│   ├── compare.js               # 对比工具核心代码
│   └── merge.js                 # 合并工具核心代码
│
├── 📂 config/                   # 配置文件
│   ├── compare.example.json     # 对比工具配置示例
│   └── merge.example.json       # 合并工具配置示例
│
├── 📂 docs/                     # 文档目录
│   ├── README.md                # 详细功能文档
│   ├── USAGE.md                 # 快速使用指南
│   └── CHANGELOG.md             # 版本更新日志
│
└── 📂 output/                   # 输出文件目录
    ├── .gitkeep                 # 保持目录
    ├── *.txt                    # 对比报告
    ├── *.json                   # 合并结果
    └── *.merge-report.txt       # 合并报告
```

## 目录说明

### 📌 根目录文件

| 文件 | 说明 | 作用 |
|------|------|------|
| `cli.js` | CLI工具 | 命令行界面入口，提供友好的命令行操作 |
| `package.json` | 项目配置 | NPM包配置，定义脚本命令和依赖 |
| `README.md` | 主文档 | 项目概述和快速开始指南 |
| `STRUCTURE.md` | 结构说明 | 详细的目录结构文档（本文件） |
| `.gitignore` | Git配置 | 定义不需要版本控制的文件 |

### 📂 lib/ - 核心功能库

存放核心业务逻辑代码。

| 文件 | 说明 | 功能 |
|------|------|------|
| `compare.js` | 对比工具 | 分析两个JSON文件的差异 |
| `merge.js` | 合并工具 | 智能合并多个JSON文件 |

**设计理念**:
- 纯函数设计，无副作用
- 可独立导入使用
- 完整的JSDoc注释
- 支持模块化调用

### 📂 config/ - 配置文件

存放配置文件模板和用户自定义配置。

| 文件 | 说明 | 用途 |
|------|------|------|
| `compare.example.json` | 对比配置示例 | 对比工具的配置模板 |
| `merge.example.json` | 合并配置示例 | 合并工具的配置模板 |

**使用方式**:
1. 复制 `.example.json` 文件
2. 重命名为自定义名称（如 `my-config.json`）
3. 修改配置参数
4. 在代码中引用

**注意**: 用户自定义的配置文件（非`.example.json`）会被`.gitignore`忽略。

### 📂 docs/ - 文档目录

存放详细的文档和使用说明。

| 文件 | 说明 | 内容 |
|------|------|------|
| `README.md` | 完整文档 | 详细的API文档、功能说明、配置选项 |
| `USAGE.md` | 使用指南 | 常见场景、示例代码、最佳实践 |
| `CHANGELOG.md` | 更新日志 | 版本历史、新功能、改进记录 |

### 📂 output/ - 输出目录

存放所有生成的文件。

| 文件类型 | 说明 | 示例 |
|----------|------|------|
| `*.txt` | 对比报告 | `comparison-report.txt` |
| `*.json` | 合并结果 | `merged-result.json` |
| `*.merge-report.txt` | 合并报告 | `merged-result.merge-report.txt` |
| `.gitkeep` | 目录占位 | 保持空目录被Git追踪 |

**注意**: 此目录下的实际输出文件会被`.gitignore`忽略，仅保留`.gitkeep`。

## 🎯 设计原则

### 1. 关注点分离
- **lib/** - 纯业务逻辑
- **config/** - 配置管理
- **docs/** - 文档说明
- **output/** - 输出隔离

### 2. 配置化优先
- 所有文件路径都通过配置管理
- 易于修改和复用
- 支持多环境配置

### 3. 输出集中管理
- 所有生成文件统一输出到`output/`
- 便于清理和管理
- 避免项目根目录混乱

### 4. 文档完善
- 多层次文档（README、USAGE、API）
- 丰富的示例代码
- 清晰的目录说明

## 📝 文件命名规范

### 代码文件
- 使用小写字母和连字符：`compare.js`, `merge.js`
- CLI工具直接命名：`cli.js`

### 配置文件
- 使用小写和点分隔：`compare.example.json`
- 示例配置必须包含`.example`后缀

### 文档文件
- 使用大写：`README.md`, `USAGE.md`, `CHANGELOG.md`
- 特殊文档：`STRUCTURE.md`（本文件）

### 输出文件
- 对比报告：`comparison-report.txt`
- 合并结果：`merged-result.json`
- 合并报告：`merged-result.merge-report.txt`

## 🔄 工作流程

```
用户
  ↓
cli.js (命令行入口)
  ↓
lib/compare.js 或 lib/merge.js (核心逻辑)
  ↓
output/ (生成结果)
```

## 🛠️ 维护指南

### 添加新功能
1. 在 `lib/` 下创建新模块
2. 在 `cli.js` 中添加新命令
3. 更新 `docs/README.md`
4. 添加配置示例到 `config/`

### 修改配置
1. 直接编辑 `lib/` 中的 `config` 对象
2. 同步更新 `config/*.example.json`

### 清理输出
```bash
# 删除所有输出文件（保留.gitkeep）
rm -rf scripts/output/*
# Windows PowerShell
Remove-Item scripts/output/* -Exclude .gitkeep
```

## 📊 存储规划

- **代码**: `lib/` (~800行)
- **配置**: `config/` (~50行JSON)
- **文档**: `docs/` (~1000行Markdown)
- **输出**: `output/` (动态，可随时清理)

## ✅ 优势

1. ✅ **清晰的职责划分** - 每个目录都有明确的用途
2. ✅ **易于导航** - 文件按功能分类存放
3. ✅ **便于维护** - 模块化设计，修改影响范围小
4. ✅ **利于协作** - 规范的结构便于团队理解
5. ✅ **Git友好** - 合理的ignore配置，不污染仓库

## 🔗 相关链接

- [主文档](./README.md)
- [使用指南](./docs/USAGE.md)
- [完整文档](./docs/README.md)
- [更新日志](./docs/CHANGELOG.md)

