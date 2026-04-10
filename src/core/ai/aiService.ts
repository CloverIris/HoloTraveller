/**
 * AI 服务基础架构
 * 支持本地 LLM (Ollama) 和可选的云端模型
 */

import type { Node, Edge } from '@/types'

export interface AIConfig {
  provider: 'ollama' | 'openai' | 'none'
  model: string
  baseUrl?: string
  apiKey?: string
  temperature: number
  maxTokens: number
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

export interface NodeInsight {
  summary: string
  keyConcepts: string[]
  potentialConnections: string[]
  suggestedTags: string[]
}

export interface ConnectionRecommendation {
  sourceId: string
  targetId: string
  reason: string
  strength: number
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  model: 'llama3.2',
  baseUrl: 'http://localhost:11434',
  temperature: 0.7,
  maxTokens: 2048,
}

class AIService {
  private config: AIConfig = DEFAULT_CONFIG
  private isAvailable: boolean = false

  constructor() {
    this.checkAvailability()
  }

  /**
   * 检查 AI 服务是否可用
   */
  async checkAvailability(): Promise<boolean> {
    if (this.config.provider === 'none') {
      this.isAvailable = false
      return false
    }

    try {
      if (this.config.provider === 'ollama') {
        const response = await fetch(`${this.config.baseUrl}/api/tags`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        })
        this.isAvailable = response.ok
      } else {
        // 其他提供商的检查逻辑
        this.isAvailable = !!this.config.apiKey
      }
    } catch {
      this.isAvailable = false
    }

    return this.isAvailable
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config }
    this.checkAvailability()
  }

  getConfig(): AIConfig {
    return { ...this.config }
  }

  /**
   * 发送对话请求
   */
  async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<AIResponse> {
    if (!this.isAvailable) {
      return { content: '', error: 'AI 服务不可用，请检查配置' }
    }

    try {
      if (this.config.provider === 'ollama') {
        return await this.chatWithOllama(messages)
      }
      return { content: '', error: '不支持的 AI 提供商' }
    } catch (error) {
      return { 
        content: '', 
        error: error instanceof Error ? error.message : '请求失败' 
      }
    }
  }

  /**
   * Ollama 对话
   */
  private async chatWithOllama(
    messages: { role: string; content: string }[]
  ): Promise<AIResponse> {
    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama 请求失败: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.message?.content || '',
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    }
  }

  /**
   * 生成节点洞察
   */
  async generateNodeInsight(node: Node, connectedNodes: Node[]): Promise<NodeInsight> {
    const systemPrompt = `你是一个知识管理专家，擅长分析概念之间的关系并提取关键洞察。
请基于提供的信息生成简洁的摘要、关键概念和潜在连接建议。`

    const userPrompt = `请分析以下节点：

节点名称: ${node.label}
节点类型: ${node.type}
描述: ${node.description || '无'}
标签: ${node.tags.join(', ') || '无'}

相关节点:
${connectedNodes.map(n => `- ${n.label} (${n.type})`).join('\n')}

请以 JSON 格式返回：
{
  "summary": "节点的简洁摘要",
  "keyConcepts": ["概念1", "概念2"],
  "potentialConnections": ["建议连接1", "建议连接2"],
  "suggestedTags": ["标签1", "标签2"]
}`

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    if (response.error) {
      return {
        summary: 'AI 服务暂时不可用',
        keyConcepts: [],
        potentialConnections: [],
        suggestedTags: [],
      }
    }

    try {
      // 尝试从响应中提取 JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {
      // 解析失败返回默认结构
    }

    return {
      summary: response.content.slice(0, 200),
      keyConcepts: [],
      potentialConnections: [],
      suggestedTags: [],
    }
  }

  /**
   * 推荐节点连接
   */
  async recommendConnections(
    sourceNode: Node,
    candidateNodes: Node[],
    existingEdges: Edge[]
  ): Promise<ConnectionRecommendation[]> {
    const systemPrompt = `你是一个网络分析师，擅长发现概念之间的潜在联系。
请分析源节点与候选节点之间的关系，推荐有意义的连接。`

    const existingTargets = new Set(existingEdges.map(e => 
      e.source === sourceNode.id ? e.target : e.source
    ))

    const filteredCandidates = candidateNodes.filter(n => 
      n.id !== sourceNode.id && !existingTargets.has(n.id)
    ).slice(0, 10) // 限制候选数量

    if (filteredCandidates.length === 0) {
      return []
    }

    const userPrompt = `源节点: ${sourceNode.label} (${sourceNode.type})
描述: ${sourceNode.description || '无'}

候选节点:
${filteredCandidates.map((n, i) => `${i + 1}. ${n.label} (${n.type}) - ${n.description?.slice(0, 50) || '无描述'}...`).join('\n')}

请推荐 3-5 个最有意义的连接，以 JSON 格式返回：
[
  {
    "index": 1,
    "reason": "连接理由",
    "strength": 0.8
  }
]`

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    if (response.error) {
      return []
    }

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0])
        return recommendations
          .filter((r: any) => r.index > 0 && r.index <= filteredCandidates.length)
          .map((r: any) => ({
            sourceId: sourceNode.id,
            targetId: filteredCandidates[r.index - 1].id,
            reason: r.reason,
            strength: Math.max(0, Math.min(1, r.strength)),
          }))
      }
    } catch {
      // 解析失败返回空
    }

    return []
  }

  /**
   * 生成探索建议
   */
  async generateExplorationAdvice(
    nodes: Node[],
    edges: Edge[],
    currentPhase: string
  ): Promise<{ advice: string; suggestedNodes: string[] }> {
    const systemPrompt = `你是一个探索导航助手，基于复杂系统理论提供探索建议。
当前认知相态: ${currentPhase}`

    const recentNodes = nodes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)

    const userPrompt = `网络概况:
- 总节点数: ${nodes.length}
- 总连接数: ${edges.length}
- 当前相态: ${currentPhase}

最近活跃的节点:
${recentNodes.map(n => `- ${n.label} (${n.type})`).join('\n')}

请提供：
1. 简短的探索建议（50字以内）
2. 建议探索的节点名称列表

以 JSON 格式返回：
{
  "advice": "建议内容",
  "suggestedNodes": ["节点名1", "节点名2"]
}`

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    if (response.error) {
      return { advice: 'AI 服务暂时不可用', suggestedNodes: [] }
    }

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          advice: result.advice,
          suggestedNodes: result.suggestedNodes || [],
        }
      }
    } catch {
      // 解析失败返回默认
    }

    return { advice: response.content.slice(0, 100), suggestedNodes: [] }
  }

  /**
   * 生成意义框架
   */
  async generateFramework(nodes: Node[]): Promise<{ title: string; content: string; coreConflict: string } | null> {
    if (nodes.length < 3) {
      return null
    }

    const systemPrompt = `你是一个意义构建专家，擅长从混乱的概念中提取临时的意义结构。
请识别核心冲突并提出暂时的关注点。`

    const recentNodes = nodes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 15)

    const userPrompt = `最近的探索节点:
${recentNodes.map(n => `- ${n.label} (${n.type}): ${n.description?.slice(0, 100) || '无描述'}`).join('\n')}

请生成一个临时的意义框架：
1. 标题（简洁有力）
2. 内容（当前情境的解读）
3. 核心冲突（识别出的主要张力）

以 JSON 格式返回：
{
  "title": "框架标题",
  "content": "框架内容",
  "coreConflict": "核心冲突"
}`

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    if (response.error) {
      return null
    }

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {
      // 解析失败
    }

    return null
  }
}

export const aiService = new AIService()
