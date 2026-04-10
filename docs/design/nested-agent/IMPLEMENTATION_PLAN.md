# 多层嵌套Agent系统 - 实施计划

## 一、当前状态分析

### 1.1 已实现的Agent

| Agent | 文件路径 | 状态 | 说明 |
|-------|---------|------|------|
| StrictPlan | `src/costrict/agents/strictPlan.ts` | ✅ 正常 | 计划执行入口 |
| StrictSpec | `src/costrict/agents/strictSpec.ts` | ❌ 被注释 | 工作流编排（需启用）|
| Requirement | `src/costrict/agents/requirement.ts` | ✅ 正常 | 需求分析 |
| DesignAgent | `src/costrict/agents/designAgent.ts` | ✅ 正常 | 架构设计 |
| TaskPlan | `src/costrict/agents/taskPlan.ts` | ✅ 正常 | 任务规划 |
| SubCoding | `src/costrict/agents/subCoding.ts` | ✅ 正常 | 编码实施 |
| QuickExplore | `src/costrict/agents/quickExplore.ts` | ✅ 正常 | 代码探索 |

### 1.2 需要修复的问题

1. **StrictSpec被注释** - `builtInAgents.ts` 第9行和第67行
2. **深度控制缺失** - 没有实现深度守卫机制
3. **TDD流程不完整** - TDD Agent未正确集成到StrictPlan/SubCoding流程

## 二、实施步骤

### 步骤1: 启用StrictSpec Agent

**文件**: `src/tools/AgentTool/builtInAgents.ts`

```diff
// 第9行 - 取消注释导入
- // import { STRICT_SPEC_AGENT } from '../../costrict/agents/strictSpec.js'
+ import { STRICT_SPEC_AGENT } from '../../costrict/agents/strictSpec.js'

// 第67行 - 取消注释注册
- // STRICT_SPEC_AGENT,
+ STRICT_SPEC_AGENT,
```

### 步骤2: 实现深度守卫机制

**新建文件**: `src/costrict/agents/depthGuard.ts`

```typescript
// 深度守卫 - 防止无限嵌套
export interface DepthContext {
  depth: number
  maxDepth: number
  currentAgent: string
}

// 检查是否可以继续spawn
export function canSpawn(context: DepthContext): boolean {
  return context.depth < context.maxDepth
}

// 获取当前深度状态
export function getDepthStatus(context: DepthContext): string {
  if (context.depth >= context.maxDepth) {
    return 'LEAF_NODE'
  }
  return `DEPTH_${context.depth}`
}
```

### 步骤3: 更新SubCoding以支持深度传递

**文件**: `src/costrict/agents/subCoding.ts`

需要添加：
- 接收深度参数
- 在spawn子Agent时传递深度+1
- 禁止在深度达到上限时spawn

### 步骤4: 集成TDD到Coding流程

**文件**: `src/costrict/agents/subCoding.ts`

在Coding流程中嵌入TDD调用：
- 检测任务是否需要TDD
- 如果需要，spawn TDD相关Agent

## 三、深度控制设计

### 3.1 深度层级定义

```
L0: StrictPlan / StrictSpec (入口)
L1: Requirement, DesignAgent, TaskPlan, SubCoding
L2: QuickExplore, TDD Agents (叶子节点)
```

### 3.2 深度传递规则

| 父Agent | 子Agent | 深度变化 | 允许spawn |
|--------|---------|---------|----------|
| StrictPlan | QuickExplore | 0→1 | ✅ |
| StrictPlan | SubCoding | 0→1 | ✅ |
| SubCoding | QuickExplore | 1→2 | ❌ (叶子) |
| SubCoding | TDD | 1→2 | ✅ |
| StrictSpec | Requirement | 0→1 | ✅ |
| Requirement | - | 1 | ❌ (无spawn) |
| DesignAgent | - | 1 | ❌ (无spawn) |
| TaskPlan | - | 1 | ❌ (无spawn) |

## 四、文件清单

```
src/costrict/agents/
├── depthGuard.ts           # [新建] 深度守卫
├── strictSpec.ts          # [修改] 启用
├── subCoding.ts          # [修改] 添加深度传递
└── ...

src/tools/AgentTool/
└── builtInAgents.ts       # [修改] 启用StrictSpec
```

## 五、实施优先级

1. **P0 - 立即修复**: 启用StrictSpec Agent
2. **P1 - 核心功能**: 实现深度守卫
3. **P2 - 增强功能**: TDD集成
4. **P3 - 优化**: 完善错误处理和日志
