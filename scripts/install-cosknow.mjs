let install
try {
  const mod = await import('cosknow')
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
