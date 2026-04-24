import { spawnSync, execSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// 全局安装最新版
spawnSync('npm', ['install', '-g', '@costrict/cosknow@latest'], {
  stdio: 'inherit',
  shell: true,
})

// 获取全局 node_modules 路径
let globalPrefix
try {
  globalPrefix = execSync('npm root -g', { encoding: 'utf8' }).trim()
} catch {
  console.warn('[cosknow] cannot determine global npm root, skipping')
  process.exit(0)
}

let install
try {
  const mod = await import(pathToFileURL(join(globalPrefix, '@costrict', 'cosknow', 'dist', 'index.js')).href)
  install = mod.install
} catch {
  console.warn('[cosknow] package not available, skipping command installation')
  process.exit(0)
}

try {
  await install({ target: 'claude-commands' })
  console.log('[cosknow] commands installed to ~/.claude/commands/')
} catch (e) {
  console.warn('[cosknow] install failed (non-fatal):', e.message)
}
