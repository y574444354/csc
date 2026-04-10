# TDD Skill (L1/L2)

## 概述
测试驱动开发(TDD)：RED → GREEN → REFACTOR 循环

## 深度状态
- **当前深度**: L1 或 L2 (根据调用上下文)
- **最大深度**: 2
- **可spawn**: 无 (叶子节点)

## TDD三阶段

```
┌─────────────────────────────────────────────────────────────┐
│                         TDD循环                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐     ┌─────────┐     ┌─────────────┐         │
│   │   RED   │ ──→ │  GREEN  │ ──→ │  REFACTOR   │         │
│   │ 写测试   │     │ 写实现   │     │   重构优化   │         │
│   │ 测试失败 │     │ 测试通过 │     │  覆盖率检查  │         │
│   └─────────┘     └─────────┘     └─────────────┘         │
│        │               │                  │                  │
│        └───────────────┴──────────────────┘                  │
│                        ↓                                     │
│              ┌─────────────────┐                            │
│              │   下一测试用例    │                            │
│              └─────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: RED (失败测试)

### 任务
编写测试代码，测试必须失败（因为实现还不存在）

### 规则

### ✅ 必须
- 为每个功能点编写完整测试
- 使用describe/test/it结构
- 包含Arrange-Act-Assert模式
- 设置正确的expected值
- Mock外部依赖

### ❌ 禁止
- 不要写任何实现代码
- 不要尝试让测试通过
- 不要跳过任何测试用例

### 输出
```json
{
  "phase": "RED",
  "test_files": [
    {
      "path": "src/__tests__/auth.login.test.ts",
      "content": "import { describe, test, expect } from 'vitest'..."
    }
  ],
  "expected_failures": ["TC001", "TC002", "TC003"],
  "run_command": "bun test src/__tests__/auth.login.test.ts"
}
```

## Phase 2: GREEN (通过实现)

### 任务
编写最小实现代码，让所有测试通过

### 规则

### ✅ 必须
- 编写最小化实现
- 让所有RED阶段的测试通过
- 不写多余代码 (YAGNI原则)
- 保持代码简洁

### ❌ 禁止
- 不要跳过任何测试
- 不要写未来可能用到的代码
- 不要过度设计

### 输出
```json
{
  "phase": "GREEN",
  "implementation_files": [
    {
      "path": "src/services/auth.service.ts",
      "changes": {"additions": 30, "deletions": 0}
    }
  ],
  "test_results": {
    "total": 3,
    "passed": 3,
    "failed": 0
  }
}
```

## Phase 3: REFACTOR (重构优化)

### 任务
优化代码结构，保持测试通过

### 规则

### ✅ 必须
- 优化代码结构和命名
- 消除重复代码
- 提高可读性
- 保持所有测试通过

### ❌ 禁止
- 不要添加新功能
- 不要破坏现有测试
- 不要降低覆盖率

### 覆盖率要求
- 行覆盖率 >= 80%
- 分支覆盖率 >= 75%
- 函数覆盖率 >= 90%

### 输出
```json
{
  "phase": "REFACTOR",
  "refactored_files": [
    {
      "path": "src/services/auth.service.ts",
      "improvements": ["提取validateToken函数", "简化错误处理"]
    }
  ],
  "coverage": {
    "lines": 85,
    "branches": 78,
    "functions": 92
  },
  "test_results": {
    "total": 3,
    "passed": 3,
    "failed": 0
  }
}
```

## Mock使用

### Vitest Mock模板

```typescript
import { vi } from 'vitest'

// 模块Mock
vi.mock('../services/apiClient', () => ({
  fetch: vi.fn().mockResolvedValue({ data: 'mocked' })
}))

// 函数Mock
const mockFn = vi.fn()
  .mockReturnValue('result')
  .mockResolvedValue('async result')
  .mockRejectedValue(new Error('error'))
```

### Mock验证

```typescript
// 验证调用
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledTimes(1)

// 验证调用顺序
expect(mockFn.mock.calls).toEqual([
  ['call1'],
  ['call2']
])
```

## 完整输出格式

```json
{
  "tdd_id": "tdd_xxx",
  "status": "completed",
  "phases": {
    "red": {
      "tests_written": 5,
      "test_files": ["test1.ts", "test2.ts"],
      "expected_failures": 5
    },
    "green": {
      "implementation_files": ["service.ts"],
      "tests_passed": 5,
      "tests_failed": 0
    },
    "refactor": {
      "files_refactored": 2,
      "improvements": ["提取公共函数", "简化逻辑"]
    }
  },
  "coverage": {
    "lines": 85,
    "branches": 78,
    "functions": 92
  },
  "verdict": "PASS",
  "total_duration_ms": 5000
}
```

## 错误处理

### RED阶段测试通过
```json
{
  "error": "TDD_VIOLATION",
  "message": "Test passed in RED phase - tests must fail before implementation",
  "violated_tests": ["TC001"],
  "suggestion": "Remove implementation or fix test expectation"
}
```

### GREEN阶段测试失败
```json
{
  "error": "IMPLEMENTATION_INCOMPLETE",
  "message": "Tests failed after implementation",
  "failed_tests": ["TC002"],
  "suggestion": "Complete implementation for failing test cases"
}
```

### 覆盖率不达标
```json
{
  "error": "COVERAGE_BELOW_THRESHOLD",
  "current": {"lines": 65, "branches": 60},
  "required": {"lines": 80, "branches": 75},
  "suggestion": "Add more test cases for uncovered branches"
}
```
