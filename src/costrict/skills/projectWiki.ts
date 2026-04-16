import { registerBundledSkill } from 'src/skills/bundledSkills.js'

// Orchestrator prompt for the /project-wiki skill.

export function registerProjectWikiSkill(): void {
  registerBundledSkill({
    name: 'strict-project-wiki',
    description:
      '为项目生成完整的技术文档体系，包括项目分析、文档结构设计、技术文档生成和索引文件创建。',
    userInvocable: true,
    disableModelInvocation: true,
    context: 'fork',
    agent: 'WIKI',
    allowedTools:[
      "Agent(WikiCatalogueDesign,WikiDocumentGenerate,WikiIndexGeneration,WikiProjectAnalyze)",
      "Read",
      "Write",
      "Edit",
      "TodoWrite",
    ],
    async getPromptForCommand(args) {
      const userRequest = args.trim()
      if (!userRequest) {
        return [
          {
            type: 'text',
            text: '请提供技术文档的需求描述。用法: /strict-project-wiki',
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
