/**
 * CoStrict 模型名称解析模块
 * 将 Anthropic 模型名映射到 CoStrict 模型名
 */

import { getCachedCoStrictModels } from './models.js'

function getModelFamily(model: string): 'haiku' | 'sonnet' | 'opus' | null {
  if (/haiku/i.test(model)) return 'haiku'
  if (/opus/i.test(model)) return 'opus'
  if (/sonnet/i.test(model)) return 'sonnet'
  return null
}

/**
 * 解析 CoStrict 模型名
 *
 * 优先级:
 * 1. 传入的 model 本身就是已知的 CoStrict 模型 ID（用户通过 /model 明确选择）
 * 2. COSTRICT_MODEL 环境变量（管理员全局覆盖 / 登录默认值）
 * 3. COSTRICT_DEFAULT_{FAMILY}_MODEL 环境变量（按模型族）
 * 4. 已缓存的 CoStrict 模型列表中的第一个
 * 5. 直接透传原始模型名（最后兜底）
 */
export function resolveCoStrictModel(anthropicModel: string): string {
  const cleanModel = anthropicModel.replace(/\[1m\]$/, '')

  // 优先级 1: 如果传入的 model 本身就是已知 CoStrict 模型 ID，直接使用
  const cached = getCachedCoStrictModels()
  if (cached.some(m => m.id === cleanModel)) return cleanModel

  // 优先级 2: COSTRICT_MODEL 环境变量
  if (process.env.COSTRICT_MODEL) return process.env.COSTRICT_MODEL

  // 优先级 3: COSTRICT_DEFAULT_{FAMILY}_MODEL 环境变量
  const family = getModelFamily(cleanModel)
  if (family) {
    const envVar = `COSTRICT_DEFAULT_${family.toUpperCase()}_MODEL`
    const override = process.env[envVar]
    if (override) return override
  }

  // 优先级 4: 缓存中的第一个模型
  if (cached.length > 0) return cached[0].id

  // 优先级 5: 透传原始模型名
  return cleanModel
}
