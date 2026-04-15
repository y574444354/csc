import { registerBundledSkill } from 'src/skills/bundledSkills.js'

export function registerTddSkill(): void {
  registerBundledSkill({
    name: 'strict-test',
    description:
      'execute comprehensive testing workflow: confirm requirements, generate test cases, and execute tests with automated fixes',
    userInvocable: true,
    disableModelInvocation: true,
    context: 'fork',
    agent: 'TDD',
    async getPromptForCommand(args) {
      const userRequest = args.trim()
      if (!userRequest) {
        return [
          {
            type: 'text',
            text: '请提供需要规划的需求描述。用法: /strict-test <需求描述>',
          },
        ]
      }
      return [
        {
          type: 'text',
          text: `用户输入：${userRequest}`,
        },
      ]
    },
  })
}
