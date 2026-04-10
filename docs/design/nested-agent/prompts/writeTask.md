# WriteTask Skill (L1/L2)

## 概述
编写和更新任务清单，基于Explore结果创建结构化任务列表

## 深度状态
- **当前深度**: L1 或 L2 (根据调用上下文)
- **可spawn**: 无 (叶子节点)

## 输入
- Explore阶段的分析结果
- 用户原始需求

## 职责

1. **创建任务列表**
   - 根据Explore结果分解任务
   - 确定每个任务的具体范围
   - 设定优先级

2. **确定任务优先级**
   - P0: 必须完成，影响核心功能
   - P1: 应该完成，影响主要功能
   - P2: 可以完成，影响用户体验

3. **识别任务依赖**
   - 分析任务间依赖关系
   - 确定并行可能性
   - 生成拓扑排序

4. **分配执行器**
   - 确定每个任务的执行Agent
   - Coding: 普通编码任务
   - TDD: 需要测试的任务

## 输出格式

```json
{
  "writeTask_id": "wt_xxx",
  "tasks": [
    {
      "id": "T001",
      "subject": "实现用户登录API",
      "description": "创建POST /api/login接口，验证用户名密码，返回JWT",
      "agent": "Coding",
      "priority": "P0",
      "dependsOn": [],
      "estimated_time": "30min",
      "files": ["src/routes/auth.ts", "src/services/auth.ts"]
    },
    {
      "id": "T002",
      "subject": "编写登录功能测试",
      "description": "使用TDD方式编写登录功能测试用例",
      "agent": "TDD",
      "priority": "P0",
      "dependsOn": ["T001"],
      "estimated_time": "45min",
      "files": ["src/__tests__/auth.login.test.ts"]
    }
  ],
  "parallel_groups": [
    ["T001"],
    ["T002"]
  ],
  "total_estimated_time": "75min",
  "status": "completed"
}
```

## 依赖分析

```json
{
  "dependency_graph": {
    "T001": [],
    "T002": ["T001"],
    "T003": ["T001"],
    "T004": ["T002", "T003"]
  },
  "critical_path": ["T001", "T002", "T004"],
  "parallelizable": ["T003"]
}
```

## 规则

### ✅ 允许
- 创建新任务
- 修改任务描述
- 设置优先级和依赖
- 确定执行Agent

### ❌ 禁止
- 执行实际编码
- 修改现有文件
- spawn子Agent

## 示例

### 创建登录功能任务

```
输入:
- Explore结果: 发现auth模块需要新建login.ts
- 用户需求: 实现用户登录功能

输出:
{
  "tasks": [
    {
      "id": "T001",
      "subject": "创建登录服务",
      "priority": "P0",
      "agent": "Coding"
    },
    {
      "id": "T002",
      "subject": "编写登录测试",
      "priority": "P0",
      "agent": "TDD",
      "dependsOn": ["T001"]
    }
  ]
}
```
