/**
 * 智能搜索引擎
 * 支持全文搜索、模糊搜索和高级过滤
 */

import type { Node, Edge, Thread, CognitiveFramework } from '@/types'

export interface SearchOptions {
  query: string
  types?: string[]
  tags?: string[]
  dateRange?: { start: Date; end: Date }
  energyRange?: { min: number; max: number }
  fuzzy?: boolean
  threshold?: number
}

export interface SearchResult {
  item: Node | Edge | Thread | CognitiveFramework
  type: 'node' | 'edge' | 'thread' | 'framework'
  score: number
  highlights: string[]
}

export interface SearchHistory {
  id: string
  query: string
  timestamp: Date
  resultCount: number
}

class SearchEngine {
  private history: SearchHistory[] = []
  private maxHistory = 20

  /**
   * 搜索节点
   */
  searchNodes(nodes: Node[], options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = []
    const query = options.query.toLowerCase().trim()
    
    if (!query && !options.types?.length && !options.tags?.length) {
      return []
    }

    for (const node of nodes) {
      let score = 0
      const highlights: string[] = []

      // 文本匹配
      if (query) {
        const textScore = this.calculateTextScore(node, query, options.fuzzy, options.threshold)
        score += textScore.score
        highlights.push(...textScore.highlights)
      }

      // 类型过滤
      if (options.types?.length && !options.types.includes(node.type)) {
        continue
      }

      // 标签过滤
      if (options.tags?.length && !options.tags.some(tag => node.tags.includes(tag))) {
        continue
      }

      // 日期范围过滤
      if (options.dateRange) {
        const nodeDate = new Date(node.createdAt)
        if (nodeDate < options.dateRange.start || nodeDate > options.dateRange.end) {
          continue
        }
      }

      // 能量范围过滤
      if (options.energyRange) {
        const energy = node.metadata.energyLevel
        if (energy < options.energyRange.min || energy > options.energyRange.max) {
          continue
        }
      }

      if (score > 0 || !query) {
        results.push({
          item: node,
          type: 'node',
          score: score || 1,
          highlights,
        })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * 搜索线程
   */
  searchThreads(threads: Thread[], options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = []
    const query = options.query.toLowerCase().trim()

    for (const thread of threads) {
      let score = 0
      const highlights: string[] = []

      if (query) {
        // 名称匹配
        if (thread.name.toLowerCase().includes(query)) {
          score += 10
          highlights.push(`名称: ${this.highlightText(thread.name, query)}`)
        }

        // 描述匹配
        if (thread.description?.toLowerCase().includes(query)) {
          score += 5
          highlights.push(`描述: ${this.highlightText(thread.description, query)}`)
        }

        // 模糊匹配
        if (options.fuzzy) {
          const fuzzyScore = this.fuzzyMatch(thread.name, query)
          if (fuzzyScore > (options.threshold || 0.6)) {
            score += fuzzyScore * 3
          }
        }
      }

      // 状态过滤
      if (options.types?.length && !options.types.includes(thread.status)) {
        continue
      }

      if (score > 0 || !query) {
        results.push({
          item: thread,
          type: 'thread',
          score: score || 1,
          highlights,
        })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * 搜索框架
   */
  searchFrameworks(frameworks: CognitiveFramework[], options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = []
    const query = options.query.toLowerCase().trim()

    for (const framework of frameworks) {
      let score = 0
      const highlights: string[] = []

      if (query) {
        // 标题匹配
        if (framework.title.toLowerCase().includes(query)) {
          score += 10
          highlights.push(`标题: ${this.highlightText(framework.title, query)}`)
        }

        // 内容匹配
        if (framework.content.toLowerCase().includes(query)) {
          score += 5
          highlights.push(`内容匹配`)
        }

        // 核心冲突匹配
        if (framework.context.coreConflict?.toLowerCase().includes(query)) {
          score += 8
          highlights.push(`冲突: ${this.highlightText(framework.context.coreConflict, query)}`)
        }
      }

      // 状态过滤
      if (options.types?.length && !options.types.includes(framework.status)) {
        continue
      }

      if (score > 0 || !query) {
        results.push({
          item: framework,
          type: 'framework',
          score: score || 1,
          highlights,
        })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * 统一搜索所有类型
   */
  searchAll(
    data: {
      nodes: Node[]
      edges: Edge[]
      threads: Thread[]
      frameworks: CognitiveFramework[]
    },
    options: SearchOptions
  ): SearchResult[] {
    const results: SearchResult[] = [
      ...this.searchNodes(data.nodes, options),
      ...this.searchThreads(data.threads, options),
      ...this.searchFrameworks(data.frameworks, options),
    ]

    // 保存搜索历史
    if (options.query) {
      this.addToHistory(options.query, results.length)
    }

    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * 获取搜索建议
   */
  getSuggestions(
    query: string,
    nodes: Node[],
    threads: Thread[]
  ): string[] {
    const suggestions: string[] = []
    const lowerQuery = query.toLowerCase()

    // 基于节点标签的建议
    const allTags = new Set(nodes.flatMap(n => n.tags))
    for (const tag of allTags) {
      if (tag.toLowerCase().includes(lowerQuery) && tag !== query) {
        suggestions.push(tag)
      }
    }

    // 基于节点名称的建议
    for (const node of nodes) {
      if (node.label.toLowerCase().includes(lowerQuery) && node.label !== query) {
        suggestions.push(node.label)
      }
    }

    // 基于线程名称的建议
    for (const thread of threads) {
      if (thread.name.toLowerCase().includes(lowerQuery) && thread.name !== query) {
        suggestions.push(thread.name)
      }
    }

    // 基于历史搜索的建议
    for (const history of this.history) {
      if (history.query.toLowerCase().includes(lowerQuery) && history.query !== query) {
        suggestions.push(history.query)
      }
    }

    return [...new Set(suggestions)].slice(0, 10)
  }

  /**
   * 获取搜索历史
   */
  getHistory(): SearchHistory[] {
    return [...this.history].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  /**
   * 清除历史
   */
  clearHistory() {
    this.history = []
  }

  /**
   * 计算节点文本匹配分数
   */
  private calculateTextScore(
    node: Node,
    query: string,
    fuzzy?: boolean,
    threshold?: number
  ): { score: number; highlights: string[] } {
    let score = 0
    const highlights: string[] = []

    // 名称匹配（权重最高）
    if (node.label.toLowerCase().includes(query)) {
      score += 20
      highlights.push(`名称: ${this.highlightText(node.label, query)}`)
    }

    // 描述匹配
    if (node.description?.toLowerCase().includes(query)) {
      score += 10
      const excerpt = this.getExcerpt(node.description, query)
      highlights.push(`描述: ${this.highlightText(excerpt, query)}`)
    }

    // 标签匹配
    const matchingTags = node.tags.filter(tag => tag.toLowerCase().includes(query))
    if (matchingTags.length > 0) {
      score += 15 * matchingTags.length
      highlights.push(`标签: ${matchingTags.join(', ')}`)
    }

    // 类型匹配
    if (node.type.toLowerCase().includes(query)) {
      score += 5
      highlights.push(`类型: ${node.type}`)
    }

    // 模糊匹配
    if (fuzzy && score === 0) {
      const fuzzyScore = this.fuzzyMatch(node.label, query)
      if (fuzzyScore > (threshold || 0.6)) {
        score += fuzzyScore * 10
        highlights.push(`模糊匹配: ${node.label}`)
      }
    }

    return { score, highlights }
  }

  /**
   * 模糊匹配算法（Levenshtein 距离）
   */
  private fuzzyMatch(text: string, query: string): number {
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    
    // 简单实现：基于子串相似度
    if (textLower.includes(queryLower)) return 1
    
    // 计算编辑距离比例
    const distance = this.levenshteinDistance(textLower, queryLower)
    const maxLength = Math.max(text.length, query.length)
    return 1 - distance / maxLength
  }

  /**
   * Levenshtein 距离计算
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * 高亮匹配文本
   */
  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi')
    return text.replace(regex, '**$1**')
  }

  /**
   * 获取文本摘要
   */
  private getExcerpt(text: string, query: string, maxLength: number = 100): string {
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)
    
    if (index === -1) {
      return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
    }

    const start = Math.max(0, index - 30)
    const end = Math.min(text.length, index + query.length + 30)
    return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
  }

  /**
   * 转义正则特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 添加到历史
   */
  private addToHistory(query: string, resultCount: number) {
    // 去重
    this.history = this.history.filter(h => h.query !== query)
    
    this.history.push({
      id: Math.random().toString(36).substr(2, 9),
      query,
      timestamp: new Date(),
      resultCount,
    })

    // 限制历史数量
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory)
    }
  }
}

export const searchEngine = new SearchEngine()
