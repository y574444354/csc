/**
 * 深度守卫模块 - 防止Agent无限嵌套
 *
 * 深度层级定义：
 * L0: StrictPlan / StrictSpec (入口)
 * L1: Requirement, DesignAgent, TaskPlan, SubCoding
 * L2: QuickExplore, TDD Agents (叶子节点)
 */

export interface DepthContext {
  /** 当前深度 */
  depth: number
  /** 最大允许深度 */
  maxDepth: number
  /** 当前Agent名称 */
  currentAgent: string
  /** 父Agent名称 */
  parentAgent?: string
}

export interface SpawnConfig {
  /** 目标Agent类型 */
  agentType: string
  /** 深度 */
  depth: number
  /** 最大深度 */
  maxDepth: number
}

export const DEFAULT_MAX_DEPTH = 4

/**
 * 检查是否可以继续spawn子Agent
 */
export function canSpawn(context: DepthContext): boolean {
  return context.depth < context.maxDepth
}

/**
 * 检查是否达到叶子节点
 */
export function isLeafNode(context: DepthContext): boolean {
  return context.depth >= context.maxDepth
}

/**
 * 获取当前深度状态描述
 */
export function getDepthStatus(context: DepthContext): string {
  if (context.depth >= context.maxDepth) {
    return 'LEAF_NODE'
  }
  return `DEPTH_${context.depth}`
}

/**
 * 计算下一个深度
 */
export function getNextDepth(currentDepth: number): number {
  return currentDepth + 1
}

/**
 * 验证spawn是否安全
 */
export function validateSpawn(
  currentContext: DepthContext,
  targetAgent: string
): { allowed: boolean; reason?: string } {
  if (currentContext.depth >= currentContext.maxDepth) {
    return {
      allowed: false,
      reason: `Cannot spawn ${targetAgent}: depth ${currentContext.depth} >= max ${currentContext.maxDepth} (LEAF_NODE)`
    }
  }

  if (currentContext.depth >= currentContext.maxDepth - 1) {
    return {
      allowed: true,
      reason: `Spawning ${targetAgent} at depth ${currentContext.depth} (last allowed spawn)`
    }
  }

  return { allowed: true }
}

/**
 * 叶子节点Agent列表
 */
export const LEAF_AGENTS = new Set([
  'QuickExplore',
  'TDDTestDesign',
  'TDDTestPrepare',
  'TDDTestAndFix',
  'TDDRunAndFix',
])

/**
 * 检查目标Agent是否为叶子节点
 */
export function isLeafAgent(agentType: string): boolean {
  return LEAF_AGENTS.has(agentType)
}

/**
 * 获取Agent允许的深度
 */
export function getAgentMaxDepth(agentType: string): number {
  // 叶子节点不允许再spawn
  if (isLeafAgent(agentType)) {
    return 0
  }

  // L1 Agent允许的子Agent深度
  const l1Agents = ['Requirement', 'DesignAgent', 'TaskPlan']
  if (l1Agents.includes(agentType)) {
    return 1
  }

  // L0入口Agent
  const l0Agents = ['StrictPlan', 'StrictSpec']
  if (l0Agents.includes(agentType)) {
    return 2
  }

  // SubCoding特殊处理
  if (agentType === 'SubCoding') {
    return 2
  }

  return DEFAULT_MAX_DEPTH
}

/**
 * 创建深度上下文
 */
export function createDepthContext(
  agentType: string,
  parentAgent?: string,
  parentDepth: number = -1
): DepthContext {
  const maxDepth = getAgentMaxDepth(agentType)
  const depth = parentDepth + 1

  return {
    depth,
    maxDepth,
    currentAgent: agentType,
    parentAgent,
  }
}

/**
 * 深度守卫错误
 */
export class DepthExceededError extends Error {
  constructor(
    public readonly currentDepth: number,
    public readonly maxDepth: number,
    public readonly targetAgent: string
  ) {
    super(`Cannot spawn ${targetAgent}: depth ${currentDepth} >= max ${maxDepth}`)
    this.name = 'DepthExceededError'
  }
}

/**
 * 执行深度守卫检查
 */
export function guardSpawn(
  context: DepthContext,
  targetAgent: string
): void {
  const validation = validateSpawn(context, targetAgent)
  if (!validation.allowed) {
    throw new DepthExceededError(context.depth, context.maxDepth, targetAgent)
  }
}
