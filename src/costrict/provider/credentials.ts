/**
 * CoStrict 凭证管理模块
 * 负责读写 ~/.claude/csc-auth.json
 */

import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js'

/**
 * CoStrict 凭证格式 (与 IDE 插件兼容)
 */
export interface CoStrictCredentials {
  id: string // 标识符
  name: string // 显示名称
  access_token: string // OAuth 访问令牌
  refresh_token?: string // OAuth 刷新令牌 (可选)
  state?: string // OAuth 状态标识 (可选)
  machine_id: string // 机器唯一标识 (SHA256)
  base_url: string // CoStrict 服务器地址
  expiry_date: number // Token 过期时间戳 (毫秒)
  updated_at: string // 最后更新时间 (ISO 8601)
  expired_at?: string // Token 过期时间 (ISO 8601)
}

/**
 * 获取 ~/.claude/csc-auth.json 路径
 */
export function getCoStrictCredentialsPath(): string {
  return join(getClaudeConfigHomeDir(), 'csc-auth.json')
}

/**
 * 生成机器唯一标识 (SHA256)
 * 基于平台、主机名、用户名
 */
export function generateMachineId(): string {
  const os = require('node:os')
  const platform = os.platform()
  const hostname = os.hostname()
  const username = os.userInfo().username
  const machineInfo = `${platform}-${hostname}-${username}`
  return createHash('sha256').update(machineInfo).digest('hex')
}

/**
 * 加载 CoStrict 凭证
 * @returns 凭证对象或 null
 */
export async function loadCoStrictCredentials(): Promise<CoStrictCredentials | null> {
  try {
    const content = await fs.readFile(getCoStrictCredentialsPath(), 'utf-8')
    const credentials = JSON.parse(content) as CoStrictCredentials
    if (!credentials.access_token || !credentials.base_url) return null
    return credentials
  } catch (error: any) {
    if (error.code === 'ENOENT') return null
    if (error instanceof SyntaxError) return null
    return null
  }
}

/**
 * 保存 CoStrict 凭证到 ~/.claude/csc-auth.json
 */
export async function saveCoStrictCredentials(
  credentials: CoStrictCredentials,
): Promise<void> {
  const filepath = getCoStrictCredentialsPath()
  await fs.mkdir(getClaudeConfigHomeDir(), { recursive: true })
  await fs.writeFile(filepath, JSON.stringify(credentials, null, 2) + '\n', {
    encoding: 'utf-8',
    mode: 0o600,
  })
}

/**
 * 删除 CoStrict 凭证
 */
export async function deleteCoStrictCredentials(): Promise<void> {
  try {
    await fs.unlink(getCoStrictCredentialsPath())
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error
  }
}

/**
 * 检查 CoStrict 凭证是否存在
 */
export async function hasCoStrictCredentials(): Promise<boolean> {
  try {
    await fs.access(getCoStrictCredentialsPath())
    return true
  } catch {
    return false
  }
}

/**
 * 同步检查 CoStrict 凭证是否存在
 * 供同步上下文（如 modelOptions）使用
 */
export function hasCoStrictCredentialsSync(): boolean {
  try {
    // 使用 require 的同步文件系统检查
    const { existsSync } = require('node:fs')
    return existsSync(getCoStrictCredentialsPath())
  } catch {
    return false
  }
}
