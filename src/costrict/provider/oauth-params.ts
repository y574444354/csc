/**
 * CoStrict OAuth 参数构建模块
 */

import { createRequire } from 'module'

// 优先使用构建时注入的 MACRO.VERSION，否则回退到 package.json（与 opencode Installation.VERSION 逻辑一致）
function getVersion(): string {
  try {
    // MACRO.VERSION 由 Bun dev/build 构建时注入（scripts/defines.ts）
    if (typeof MACRO !== 'undefined' && MACRO.VERSION) return MACRO.VERSION
  } catch {
    // 动态 import 时 MACRO 尚未定义，继续回退
  }
  try {
    const require = createRequire(import.meta.url)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require('../../../package.json') as { version: string }
    return pkg.version
  } catch {
    return '1.0.0'
  }
}

const COSTRICT_PLUGIN_VERSION = `costrict-cli-${getVersion()}`

/**
 * 构建标准的 OAuth 查询参数
 *
 * @param includeMachineCode 是否包含 machine_code (登录和轮询时需要，刷新时不需要)
 * @param machineId 机器唯一标识
 * @param state OAuth state (可选)
 */
export function buildOAuthParams(
  includeMachineCode: boolean,
  machineId?: string,
  state?: string,
): [string, string][] {
  const params: [string, string][] = []

  if (includeMachineCode) {
    if (!machineId) throw new Error('machineId is required when includeMachineCode is true')
    params.push(['machine_code', machineId])
  }

  if (state) {
    params.push(['state', state])
  }

  params.push(
    ['provider', 'casdoor'],
    ['plugin_version', COSTRICT_PLUGIN_VERSION],
    ['vscode_version', COSTRICT_PLUGIN_VERSION],
    ['uri_scheme', 'costrict-cli'],
  )

  return params
}
