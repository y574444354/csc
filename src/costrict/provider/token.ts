/**
 * CoStrict Token 管理模块
 * 负责 Token 验证、刷新和 JWT 解析
 */

import type { CoStrictCredentials } from './credentials.js'
import { buildOAuthParams } from './oauth-params.js'

interface JWTPayload {
  exp?: number
  iat?: number
  [key: string]: any
}

/**
 * 解析 JWT Token (不验证签名)
 */
export function parseJWT(token: string): JWTPayload {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')
  const decoded = Buffer.from(parts[1], 'base64url').toString('utf-8')
  return JSON.parse(decoded) as JWTPayload
}

/**
 * 从 JWT Token 提取过期时间 (毫秒)
 */
export function extractExpiryFromJWT(token: string): number {
  try {
    const payload = parseJWT(token)
    return payload.exp ? payload.exp * 1000 : 0
  } catch {
    return 0
  }
}

/**
 * 三层 Token 验证策略
 */
export function isCoStrictTokenValid(credentials: CoStrictCredentials): boolean {
  const now = Date.now()
  const bufferMs = 30 * 60 * 1000 // 30 分钟

  // 策略 1: expiry_date (30 分钟缓冲)
  if (credentials.expiry_date) {
    return now < credentials.expiry_date - bufferMs
  }

  // 策略 2: refresh_token JWT
  if (credentials.refresh_token) {
    try {
      const payload = parseJWT(credentials.refresh_token)
      if (payload.exp) return payload.exp * 1000 > now
    } catch {
      // fall through
    }
  }

  // 策略 3: access_token JWT (30 分钟缓冲)
  try {
    const payload = parseJWT(credentials.access_token)
    if (payload.exp) return now < payload.exp * 1000 - bufferMs
  } catch {
    // fall through
  }

  return false
}

export interface RefreshTokenParams {
  baseUrl: string
  refreshToken: string
  state?: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

/**
 * 刷新 CoStrict Token
 * ⚠️ 刷新时**排除** machine_code 参数
 */
export async function refreshCoStrictToken(
  params: RefreshTokenParams,
): Promise<RefreshTokenResponse> {
  const queryParams = buildOAuthParams(false, undefined, params.state)
  const queryString = queryParams
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  const url = `${params.baseUrl}/oidc-auth/api/v1/plugin/login/token?${queryString}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${params.refreshToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      response.status === 400 || response.status === 401
        ? `Refresh token is invalid or expired (${response.status}): ${body}`
        : `Token refresh failed with status ${response.status}: ${body}`,
    )
  }

  const data = (await response.json()) as RefreshTokenResponse

  if (!data.access_token || !data.refresh_token) {
    throw new Error('Token refresh response is missing required fields')
  }

  return data
}
