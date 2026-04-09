/**
 * CoStrict 凭证管理模块
 * 负责读写 ~/.costrict/share/auth.json，与 CoStrict IDE 插件共享凭证
 */

import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'

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
 * 获取 CoStrict 凭证文件路径
 * @returns ~/.costrict/share/auth.json
 */
export function getCoStrictCredentialsPath(): string {
  return join(homedir(), '.costrict', 'share', 'auth.json')
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
    const filepath = getCoStrictCredentialsPath()
    const content = await fs.readFile(filepath, 'utf-8')
    const credentials = JSON.parse(content) as CoStrictCredentials

    if (!credentials.access_token || !credentials.base_url) {
      return null
    }

    return credentials
  } catch (error: any) {
    if (error.code === 'ENOENT') return null
    if (error instanceof SyntaxError) return null
    return null
  }
}

/**
 * 保存 CoStrict 凭证
 */
export async function saveCoStrictCredentials(
  credentials: CoStrictCredentials,
): Promise<void> {
  const filepath = getCoStrictCredentialsPath()
  const dir = join(homedir(), '.costrict', 'share')
  await fs.mkdir(dir, { recursive: true, mode: 0o755 })
  const content = JSON.stringify(credentials, null, 2)
  await fs.writeFile(filepath, content, { encoding: 'utf-8', mode: 0o600 })
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
