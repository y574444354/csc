#!/usr/bin/env bun
/**
 * Downloads builtin skills from their source repositories and generates
 * src/costrict/skill/builtin.ts with all skill files embedded as string constants.
 *
 * Usage: bun run scripts/generate-skills.ts
 */

import fs from 'fs/promises'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const bundledSkillsDir = path.resolve(__dirname, '../.tmp/skills')
const builtinTsFile = path.resolve(__dirname, '../src/costrict/skills/builtin.ts')

const BUILTIN_SKILLS = {
  'security-review': {
    repo: 'zgsm-ai/security-review-skill',
    branch: 'main',
    subdir: 'security-review',
  },
} as const

type Index = {
  skills: Array<{
    name: string
    description: string
    files: string[]
  }>
}

async function fetchCommitSha(repo: string, branch: string): Promise<string | null> {
  const apiUrl = `https://api.github.com/repos/${repo}/commits/${branch}`
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'csc-build',
        Accept: 'application/vnd.github.v3+json',
      },
    })
    if (!response.ok) {
      console.warn(`  ⚠ Could not fetch commit SHA from GitHub API: ${response.status}`)
      return null
    }
    const data = (await response.json()) as { sha?: string }
    return data.sha ?? null
  } catch (err) {
    console.warn(`  ⚠ Failed to fetch commit SHA: ${err}`)
    return null
  }
}

async function fetchIndex(repo: string, branch: string): Promise<Index | null> {
  const indexUrl = `https://raw.githubusercontent.com/${repo}/${branch}/index.json`
  const response = await fetch(indexUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch index: ${indexUrl} (${response.status})`)
  }
  return response.json() as Promise<Index>
}

async function fetchFile(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${url} (${response.status})`)
  }
  return response.text()
}

async function downloadSkill(
  name: string,
  config: { repo: string; branch: string; subdir: string },
): Promise<{ name: string; commitSha: string | null } | null> {
  const { repo, branch, subdir } = config
  console.log(`\n📦 Downloading skill: ${name}`)
  console.log(`   From: https://github.com/${repo}`)
  console.log(`   Branch: ${branch}`)

  // Try HTTP first
  try {
    return await downloadSkillHttp(name, config)
  } catch (httpErr) {
    console.warn(`  ⚠ HTTP download failed (${httpErr}), trying git clone...`)
    return await downloadSkillGit(name, config)
  }
}

async function downloadSkillHttp(
  name: string,
  config: { repo: string; branch: string; subdir: string },
): Promise<{ name: string; commitSha: string | null } | null> {
  const { repo, branch, subdir } = config

  const commitSha = await fetchCommitSha(repo, branch)
  if (commitSha) {
    console.log(`   Commit: ${commitSha.slice(0, 7)}`)
  }

  const index = await fetchIndex(repo, branch)
  if (!index?.skills?.length) {
    throw new Error(`Invalid index for skill: ${name}`)
  }

  const skill = index.skills.find(s => s.name === name)
  if (!skill) {
    throw new Error(`Skill "${name}" not found in index`)
  }

  console.log(`  Found ${skill.files.length} files to download`)

  const skillOutputDir = path.join(bundledSkillsDir, name)
  await fs.mkdir(skillOutputDir, { recursive: true })

  const pathPrefix = subdir ? `${subdir}/` : ''

  for (const file of skill.files) {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${pathPrefix}${file}`
    const targetPath = path.join(skillOutputDir, file)

    await fs.mkdir(path.dirname(targetPath), { recursive: true })

    try {
      const content = await fetchFile(url)
      await fs.writeFile(targetPath, content, 'utf-8')
      console.log(`  ✓ ${file}`)
    } catch (err) {
      console.warn(`  ✗ Failed to download ${file}: ${err}`)
    }
  }

  const skillMdPath = path.join(skillOutputDir, 'SKILL.md')
  try {
    await fs.access(skillMdPath)
  } catch {
    throw new Error(`Skill "${name}" missing SKILL.md`)
  }

  console.log(`   ✓ Skill ${name} downloaded successfully`)
  return { name, commitSha }
}

function git(...args: string[]): { ok: boolean; stdout: string; stderr: string } {
  const result = spawnSync('git', args, { encoding: 'utf-8' })
  return {
    ok: result.status === 0,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
  }
}

async function downloadSkillGit(
  name: string,
  config: { repo: string; branch: string; subdir: string },
): Promise<{ name: string; commitSha: string | null } | null> {
  const { repo, branch, subdir } = config
  const cloneUrl = `https://github.com/${repo}.git`
  const cloneDir = path.join(bundledSkillsDir, `.clone-${name}`)
  const skillOutputDir = path.join(bundledSkillsDir, name)

  console.log(`   git clone ${cloneUrl}`)

  await fs.rm(cloneDir, { recursive: true, force: true })

  const cloneResult = git('clone', '--depth', '1', '--branch', branch, cloneUrl, cloneDir)
  if (!cloneResult.ok) {
    throw new Error(`git clone failed: ${cloneResult.stderr}`)
  }

  const shaResult = git('-C', cloneDir, 'rev-parse', 'HEAD')
  const commitSha = shaResult.ok ? shaResult.stdout : null
  if (commitSha) {
    console.log(`   Commit: ${commitSha.slice(0, 7)}`)
  }

  const srcDir = subdir ? path.join(cloneDir, subdir) : cloneDir
  await fs.rm(skillOutputDir, { recursive: true, force: true })
  await fs.cp(srcDir, skillOutputDir, { recursive: true })

  await fs.rm(cloneDir, { recursive: true, force: true })

  const skillMdPath = path.join(skillOutputDir, 'SKILL.md')
  try {
    await fs.access(skillMdPath)
  } catch {
    throw new Error(`Skill "${name}" missing SKILL.md`)
  }

  const fileCount = (await walk(skillOutputDir)).length
  console.log(`   ✓ ${fileCount} files copied via git clone`)
  return { name, commitSha }
}

async function walk(dir: string, base = ''): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files: string[] = []
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = base ? path.join(base, entry.name) : entry.name
      if (entry.isDirectory()) {
        files.push(...(await walk(fullPath, relativePath)))
      } else {
        files.push(relativePath)
      }
    }
    return files
  } catch {
    return []
  }
}

async function generateBuiltinTs(
  skills: Array<{ name: string; commitSha: string | null }>,
): Promise<void> {
  const outLines: string[] = [
    '// This file is auto-generated by scripts/generate-skills.ts',
    '// Do not edit manually',
    '',
  ]

  const skillEntries: string[] = []
  let fileIdx = 0

  for (const { name, commitSha } of skills) {
    const skillDir = path.join(bundledSkillsDir, name)
    const files = await walk(skillDir)
    const fileEntries: string[] = []

    for (const file of files) {
      const varName = `SKILL_FILE_${fileIdx++}`
      const content = await fs.readFile(path.join(skillDir, file), 'utf-8')
      const normalizedPath = file.replaceAll('\\', '/')
      outLines.push(`const ${varName} = ${JSON.stringify(content)}`)
      fileEntries.push(`    ${JSON.stringify(normalizedPath)}: ${varName}`)
    }

    skillEntries.push(`  ${JSON.stringify(name)}: {\n${fileEntries.join(',\n')}\n  }`)
  }

  outLines.push('')
  outLines.push('export const BUNDLED_SKILLS: Record<string, Record<string, string>> = {')
  outLines.push(skillEntries.join(',\n'))
  outLines.push('}')
  outLines.push('')

  const versions = skills
    .filter(s => s.commitSha)
    .map(s => `  ${JSON.stringify(s.name)}: ${JSON.stringify(s.commitSha)}`)

  outLines.push('export const SKILL_VERSIONS: Record<string, string> = {')
  outLines.push(versions.join(',\n'))
  outLines.push('}')
  outLines.push('')

  await fs.writeFile(builtinTsFile, outLines.join('\n') + '\n')
  console.log(`\n✓ Generated ${builtinTsFile}`)
}

async function main() {
  console.log('\nCSC — Downloading Builtin Skills\n')

  await fs.mkdir(bundledSkillsDir, { recursive: true })

  const results: Array<{ name: string; commitSha: string | null }> = []

  for (const [name, config] of Object.entries(BUILTIN_SKILLS)) {
    try {
      const result = await downloadSkill(name, config)
      if (result) results.push(result)
    } catch (err) {
      // Fall back to cached files in .tmp/skills/ if download fails
      const skillDir = path.join(bundledSkillsDir, name)
      const cached = await walk(skillDir)
      if (cached.length > 0) {
        console.warn(`  ⚠ Download failed, using cached files for "${name}": ${err}`)
        results.push({ name, commitSha: null })
      } else {
        console.error(`  ✗ Download failed and no cache for "${name}": ${err}`)
      }
    }
  }

  if (results.length > 0) {
    await generateBuiltinTs(results)
  } else {
    console.warn('\n⚠ No skills downloaded. builtin.ts not updated.')
  }

  console.log('\n💡 Run `bun run build` to rebuild the CLI.\n')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
