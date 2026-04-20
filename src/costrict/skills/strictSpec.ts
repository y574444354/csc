import { registerBundledSkill } from '../../skills/bundledSkills.js'

export function registerStrictSpecSkill(): void {
  registerBundledSkill({
    name: 'strict:spec',
    description:
      '将用户需求按照标准阶段分配到对应工作流Agent执行。',
    whenToUse:
      '将用户需求按照标准阶段分配到对应工作流Agent执行。',
    userInvocable: true,
    disableModelInvocation: true,
    // 关键：在子 Agent 中运行
    context: 'fork',
    allowedTools:[
    "AskUserQuestion",
    "Agent(Requirement,DesignAgent,TaskPlan,SubCoding)",
    "Read",
    "Write",
    "Edit",
    "TodoWrite",
    ],
    // 关键：使用 StrictSpec Agent
    agent: 'StrictSpec',
    async getPromptForCommand(args) {
      const userRequest = args.trim()
      if (!userRequest) {
        return [
          {
            type: 'text',
            text: '请提供需要规划的需求描述。用法: /strict-spec <需求描述>',
          },
        ]
      }
      return [
        {
          type: 'text',
          text: `用户需求：${userRequest}`,
        },
      ]
    },
  })
}
