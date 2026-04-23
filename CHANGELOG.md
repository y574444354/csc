# Changelog

All notable changes to this project will be documented in this file.

## [4.0.8] - 2026-04-23

### 新功能

- 同步上游主仓库最新代码
- 远程控制 Web 展示优化、状态同步与桥接控制流程改进
- 添加对 ACP 协议的支持
- 重构供应商层次结构
- 新增 Vite 构建流程
- 添加环境变量支持以覆盖 max_tokens 设置
- Langfuse LLM generation 记录工具定义

### 修复

- 修复 node 下 loading 按钮计算错误问题
- 修复 Linux 端的安装问题
- 修复类型校验问题
- **Package**: `files` 字段补充遗漏的 `scripts/run-parallel.mjs`，修复 npm install 时 `MODULE_NOT_FOUND` 错误

### 变更

- **Commands**: 移除 `desktop` 命令及相关注册
- **UI**: `LogoV2` 强制使用 condensed 模式，跳过 release notes / onboarding 检测
- **Tips**: 将 desktop app 提示文案更新为 CoStrict Web
- **Package**: 包名改为 `@costrict/csc`，描述更新为 `costrict`
- **Bin**: bin 命令统一为 `csc`，移除 `ccb`、`ccb-bun`、`claude-code-best`

## [4.0.6] - 2026-04-16

### 新功能

- 去除了运行时bun的依赖

## [4.0.5] - 2026-04-15

### 新功能

- 工具层及 MCP 大重构
- 完成第一个 MCP Chrome 浏览器接入版本
- 添加 Langfuse 监控支持
- Langfuse 工具调用显示为嵌套结构
- Brave 作为 WebSearchTool 的备选搜索引擎
- 支持自托管 remote-control-server
- 支持Ultraplan Feature 支持高级多 Agent 规划
- 增加了upgrade/update 命令

### Agent 系统

- 新增 CoStrict agent 套件用于结构化工作流
- 新增 TDD 工作流（test design / prepare / execute / run-and-fix 四个 agent）
- 新增 QuickExploreAgent，启用默认规划 agents
- 新增 planApply agent 工具列表
- 新增 StrictPlan 模式

### Skills

- 新增 `project-wiki` skill 自动生成技术文档
- 新增 `security-review` 内置 skill 支持代码审计

### 修复

- 修复内置 agent prompt 中工具名引用归一化
- 修复 mintlify ignore 和侧边栏
- 修复 Windows 上 `bun.exe` 命令识别问题
- 修复初次登陆的校验问题
- 修复类型问题（多处）