import { registerBundledSkill } from '../../skills/bundledSkills.js'
import { BUNDLED_SKILLS } from './builtin.js'

export function registerCodeReviewSecuritySkill(): void {
  const files = BUNDLED_SKILLS['security-review'] ?? {}
  const skillMd = files['SKILL.md'] ?? ''

  registerBundledSkill({
    name: 'strict-security-review',
    description: 'Systematic code security audit — identifies vulnerabilities like SQL injection, XSS, command injection, SSRF, etc.',
    whenToUse:
      'Use when the user requests a code audit, security audit, or vulnerability scan; or mentions /code-review-security, /audit, or wants a security check before deployment',
    userInvocable: true,
    files,
    async getPromptForCommand() {
      return [{ type: 'text', text: skillMd }]
    },
  })
}
