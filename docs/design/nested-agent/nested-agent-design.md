# StrictPlan + StrictSpec 多层嵌套Agent设计方案

## 一、整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户请求                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │     StrictSpec (L0)    │       │     StrictPlan (L0)    │
        │   工作流编排Agent       │       │     计划执行Agent       │
        └───────────────────────┘       └───────────────────────┘
                    │                               │
                    ▼                               │
        ┌───────────────────────┐                   │
        │   Requirement (L1)    │                   │
        │      需求分析Agent      │                   │
        └───────────────────────┘                   │
                    │                               │
                    ▼                               │
        ┌───────────────────────┐                   │
        │    DesignAgent (L1)   │                   │
        │      架构设计Agent      │                   │
        └───────────────────────┘                   │
                    │                               │
                    ▼                               │
        ┌───────────────────────┐                   │
        │    TaskPlan (L1)      │                   │
        │      任务规划Agent      │                   │
        └───────────────────────┘                   │
                    │                               │
                    ▼                               │
        ┌───────────────────────┐                   │
        │    SubCoding (L1)     │ ──────────────────┘
        │      编码实施Agent      │      深度传递
        └───────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ Quick   │ │ Sub     │ │  TDD    │
    │Explore  │ │ Coding  │ │ Agents  │
    │ (L2)    │ │ (L2)    │ │ (L2)    │
    └─────────┘ └─────────┘ └─────────┘
```

## 二、现有Agent定义

### 2.1 StrictPlan (L0)

**文件路径**: `src/costrict/agents/strictPlan.ts`

**核心职责**:
- 遵循"**理解用户需求→探索项目→需求澄清→创建提案→实施提案**"工作流
- **不直接写代码**，负责任务规划、分发、审查和进度追踪
- 通过 SubCodingAgent 实施提案

**关键特性**:
- `isMainThread: true` - 主线程模式
- `context: 'fork'` - 叉载执行
- 强制使用QuickExplore进行项目深度探索
- 通过Agent工具分发任务给SubCodingAgent

**原prompt核心内容**:
```
你是StrictPlan Agent。你的核心职责是：遵循"理解用户需求→探索项目→需求澄清→创建提案→实施提案"的严格工作流。
你负责任务规划、分发、审查和进度追踪，通过SubCodingAgent实施提案。
必须先使用QuickExplore Agent进行深度的项目探索。
```

### 2.2 StrictSpec (L0)

**文件路径**: `src/costrict/agents/strictSpec.ts`

**核心职责**:
- 工作流编排专家，将用户需求按标准阶段分配到对应Agent
- 四个严谨阶段：Requirement → DesignAgent → TaskPlan → SubCoding

**原prompt核心内容**:
```
你是工作流编排专家，负责将用户需求按照标准阶段分配到对应工作流Agent执行。

阶段1: 需求明确阶段 (Requirement模式)
阶段2: 架构设计阶段 (DesignAgent模式)
阶段3: 开发任务拆分阶段 (TaskPlan模式)
阶段4: 方案执行阶段 (SubCoding模式)
```

### 2.3 Requirement (L1)

**文件路径**: `src/costrict/agents/requirement.ts`

**核心职责**:
- 专业需求分析师
- 深度理解用户原始需求，转换为结构化系统需求文档
- 增量式输出到 `.cospec/spec/{功能名}/spec.md`

**原prompt核心内容**:
```
你是专业需求分析师，唯一职责：深度、全面理解用户原始需求，将其转换为结构化的系统需求文档。

阶段1: 工作目录创建
阶段2: 需求理解（5W2H分析）
阶段3: 需求澄清（使用AskUserQuestion提问）
```

### 2.4 DesignAgent (L1)

**文件路径**: `src/costrict/agents/designAgent.ts`

**核心职责**:
- 系统架构设计
- 模块划分与接口定义
- 数据模型设计

### 2.5 TaskPlan (L1)

**文件路径**: `src/costrict/agents/taskPlan.ts`

**核心职责**:
- 将需求文档和设计文档转化为高层次任务规划
- 输出到 `.cospec/spec/{功能名}/plan.md`
- 最多3个任务条目

**原prompt核心内容**:
```
作为任务规划师，你的核心职责是将需求文档内容和技术设计文档内容转化为高层次的任务规划（plan.md）。

任务格式规则：
- 采用带编号的复选框列表格式
- 每个任务明确引用对应的子需求编号
- 任务条目最多3条
```

### 2.6 SubCoding (L1)

**文件路径**: `src/costrict/agents/subCoding.ts`

**核心职责**:
- 专业开发人员
- 高效率、低成本完成任务
- 先理解，后动手
- 最小变更，风格一致

**原prompt核心内容**:
```
你是SubCodingAgent，一名专业软件开发团队中的开发人员。

原则一：先理解，后动手
原则二：尊重项目架构
原则三：最小变更
原则四：风格一致性
原则五：注释规范
```

### 2.7 QuickExplore (L2)

**文件路径**: `src/costrict/agents/quickExplore.ts`

**核心职责**:
- 响应父Agent的定向探索任务
- 从项目代码文件和Git提交历史中提取信息
- 输出结构化探索结果

**原prompt核心内容**:
```
你是QuickExploreAgent，专门响应父Agent的定向探索任务。

探索策略：
- 从代码文件获取：Read/Grep/Glob
- 从Git历史获取：git log/git show
- 证据支撑：文件路径+行号+代码片段
```

## 三、深度控制矩阵

| Agent | 层级 | 可spawn | 说明 |
|-------|------|---------|------|
| StrictPlan | L0 | QuickExplore, SubCoding | 计划执行入口 |
| StrictSpec | L0 | Requirement, DesignAgent, TaskPlan, SubCoding | 工作流编排 |
| Requirement | L1 | - | 需求分析 |
| DesignAgent | L1 | - | 架构设计 |
| TaskPlan | L1 | - | 任务规划 |
| SubCoding | L1 | QuickExplore, TDD | 编码实施 |
| QuickExplore | L2 | - | 叶子节点 |

## 四、TDD集成

### 4.1 TDD相关Agent

**文件路径**: `src/costrict/agents/`

| Agent | 职责 |
|-------|------|
| `tddRunAndFix.ts` | 执行测试并修复失败 |
| `tddTestAndFix.ts` | 测试设计与修复 |
| `tddTestDesign.ts` | 测试用例设计 |
| `tddTestPrepare.ts` | 测试准备 |

### 4.2 TDD Skill (现有实现)

**文件路径**: `src/costrict/skill/tdd.ts`

**原prompt核心内容**:
```
You are executing a comprehensive testing workflow to ensure code quality.

Step 1: Execute Runnability Verification (@RunAndFix)
Step 2: Confirm User Requirements
Step 3: Generate Test Cases (@TestDesign)
Step 4: Execute Tests and Fix (@TestAndFix)
```

## 五、目录结构

```
src/costrict/
├── agents/                    # Agent定义
│   ├── strictPlan.ts         # StrictPlan (L0)
│   ├── strictSpec.ts         # StrictSpec (L0)
│   ├── requirement.ts        # Requirement (L1)
│   ├── designAgent.ts        # DesignAgent (L1)
│   ├── taskPlan.ts           # TaskPlan (L1)
│   ├── subCoding.ts          # SubCoding (L1)
│   ├── quickExplore.ts       # QuickExplore (L2)
│   ├── tddRunAndFix.ts      # TDD执行修复
│   ├── tddTestAndFix.ts     # TDD测试修复
│   ├── tddTestDesign.ts     # TDD测试设计
│   ├── tddTestPrepare.ts     # TDD测试准备
│   └── taskCheck.ts          # 任务检查
│
└── skill/                    # Skill定义
    ├── strictPlan.ts         # StrictPlan Skill
    ├── tdd.ts                # TDD Skill
    └── codeReviewSecurity.ts  # 代码安全审查
```

## 六、执行流程示例

### 6.1 StrictPlan执行

```
用户: /strict-plan 实现一个计算器

┌─────────────────────────────────────────────────────────────┐
│ L0: StrictPlan                                              │
│ - 理解用户需求：实现一个计算器                                 │
│ - QuickExplore探索项目                                        │
│ - 需求澄清                                                   │
│ - 创建提案                                                   │
│ - 分发任务给SubCoding                                        │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 StrictSpec执行

```
用户: /strict-spec 实现用户登录系统

┌─────────────────────────────────────────────────────────────┐
│ L0: StrictSpec                                              │
│ - 需求明确阶段 → Requirement Agent                           │
│ - 架构设计阶段 → DesignAgent                                │
│ - 开发任务拆分 → TaskPlan                                   │
│ - 方案执行阶段 → SubCoding                                  │
└─────────────────────────────────────────────────────────────┘
```

## 七、上下文传递

### 7.1 Agent间参数传递

```typescript
// StrictSpec → Requirement
Agent(tool, {
  subagent_type: "Requirement",
  prompt: 用户原始输入
})

// Requirement → DesignAgent
Agent(tool, {
  subagent_type: "DesignAgent",
  prompt: 用户原始输入
})

// TaskPlan → SubCoding
// 读取 .cospec/spec/{功能名}/plan.md
// 对每个未完成任务调用：
Agent(tool, {
  subagent_type: "SubCoding",
  prompt: `
    任务名称: <plan.md中的任务名>
    任务描述: <plan.md中的任务内容>
    需求文档: .cospec/spec/<feature>/spec.md
    设计文档: .cospec/spec/<feature>/tech.md
  `
})
```

### 7.2 文档结构

```
.cospec/
├── spec/{功能名}/
│   ├── spec.md        # 需求文档 (Requirement输出)
│   ├── tech.md        # 技术设计 (DesignAgent输出)
│   └── plan.md        # 执行计划 (TaskPlan输出)
└── plan/changes/{change-id}/
    ├── proposal.md    # 提案内容
    └── task.md        # 实施清单
```

## 八、关键设计决策

### 8.1 深度控制机制

- **StrictPlan**: 主线程模式，使用Agent工具分发任务
- **SubCoding**: 禁止使用Agent工具，防止进一步嵌套
- **QuickExplore**: 叶子节点，只读操作

### 8.2 任务分发策略

```typescript
// 任务分发规则
- 将task.md中的子任务分发给SubCodingAgent
- 最多10个任务并行
- 无依赖任务可并行启动
- 每个任务需包含：<change-id>和任务序号
```

### 8.3 状态更新

```markdown
- 每个任务完成后必须更新task.md
- 标记格式：`- [x]`
- 更新时机：开始下一个任务前
```

## 九、Skill注册

### 9.1 Skill文件

```typescript
// src/costrict/skill/strictPlan.ts
export function registerStrictPlanSkill(): void {
  registerBundledSkill({
    name: 'strict-plan',
    description: '创建结构化需求提案并协调实施 - 遵循"理解需求→探索项目→需求澄清→创建提案→实施提案"工作流',
    context: 'fork',
    agent: 'StrictPlan',
  })
}

// src/costrict/skill/tdd.ts
export function registerTddSkill(): void {
  registerBundledSkill({
    name: 'test',
    description: 'execute comprehensive testing workflow: confirm requirements, generate test cases, and execute tests with automated fixes',
  })
}
```

### 9.2 注册入口

```typescript
// src/skills/bundled/index.ts
export function initBundledSkills(): void {
  registerStrictPlanSkill()  // StrictPlan Skill
  registerTddSkill()        // TDD Skill
  // ...
}
```
