/**
 * Markdown 导入导出
 * 支持与 Obsidian、Logseq 等工具集成
 */

import type { Node } from '@/types'

export interface ImportOptions {
  splitHeaders?: boolean  // 按标题分割为节点
  splitParagraphs?: boolean  // 按段落分割
  includeLinks?: boolean  // 解析链接为连接
  tagPattern?: string  // 标签匹配模式
}

export interface ImportedNode {
  label: string
  type: string
  description: string
  tags: string[]
  links: string[]  // 引用的其他节点
}

/**
 * 从 Markdown 文本导入节点
 */
export function importFromMarkdown(
  content: string,
  options: ImportOptions = {}
): ImportedNode[] {
  const nodes: ImportedNode[] = []
  const { splitHeaders = true, tagPattern = '#(\\w+)' } = options

  if (splitHeaders) {
    // 按标题分割
    const headerRegex = /^(#{1,6})\s+(.+)$/gm
    const sections: Array<{ level: number; title: string; content: string }> = []
    
    let match
    let lastIndex = 0
    let currentSection: { level: number; title: string; content: string } | null = null

    while ((match = headerRegex.exec(content)) !== null) {
      if (currentSection) {
        currentSection.content = content.slice(lastIndex, match.index).trim()
        sections.push(currentSection)
      }
      
      currentSection = {
        level: match[1].length,
        title: match[2].trim(),
        content: '',
      }
      lastIndex = match.index + match[0].length
    }

    if (currentSection) {
      currentSection.content = content.slice(lastIndex).trim()
      sections.push(currentSection)
    }

    for (const section of sections) {
      const node = parseSection(section.title, section.content, tagPattern)
      nodes.push(node)
    }
  } else {
    // 整体作为一个节点
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : 'Imported Note'
    const body = content.replace(/^#\s+.+$/m, '').trim()
    
    nodes.push(parseSection(title, body, tagPattern))
  }

  return nodes
}

/**
 * 解析章节内容
 */
function parseSection(title: string, content: string, tagPattern: string): ImportedNode {
  // 提取标签
  const tagRegex = new RegExp(tagPattern, 'g')
  const tags: string[] = []
  let match
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1])
  }

  // 提取链接
  const linkRegex = /\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)/g
  const links: string[] = []
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1] || match[2])
  }

  // 清理内容
  const cleanContent = content
    .replace(new RegExp(tagPattern, 'g'), '')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .trim()

  // 推断类型
  const type = inferNodeType(title, content, tags)

  return {
    label: title,
    type,
    description: cleanContent.slice(0, 500),
    tags,
    links,
  }
}

/**
 * 推断节点类型
 */
function inferNodeType(title: string, content: string, tags: string[]): string {
  const lowerTitle = title.toLowerCase()
  const lowerContent = content.toLowerCase()
  const lowerTags = tags.map(t => t.toLowerCase())

  if (lowerTags.includes('goal') || lowerTags.includes('目标')) return 'goal'
  if (lowerTags.includes('milestone') || lowerTags.includes('里程碑')) return 'milestone'
  if (lowerTags.includes('exploration') || lowerTags.includes('探索')) return 'exploration'
  if (lowerTags.includes('insight') || lowerTags.includes('洞察')) return 'insight'
  if (lowerTitle.includes('todo') || lowerTitle.includes('任务')) return 'goal'
  if (lowerTitle.includes('idea') || lowerTitle.includes('想法')) return 'exploration'
  if (lowerContent.includes('```')) return 'concept'

  return 'concept'
}

/**
 * 导出节点为 Markdown
 */
export function exportToMarkdown(nodes: Node[]): string {
  const lines: string[] = []

  for (const node of nodes) {
    lines.push(`# ${node.label}`)
    lines.push('')
    lines.push(`**类型**: ${node.type}`)
    lines.push(`**能量**: ${Math.round(node.metadata.energyLevel * 100)}%`)
    lines.push(`**重要性**: ${Math.round(node.metadata.importance * 100)}%`)
    lines.push('')

    if (node.tags.length > 0) {
      lines.push(`**标签**: ${node.tags.map(t => `#${t}`).join(' ')}`)
      lines.push('')
    }

    if (node.description) {
      lines.push(node.description)
      lines.push('')
    }

    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * 导出为 Obsidian 格式
 */
export function exportToObsidian(nodes: Node[], edges: Array<{ source: string; target: string }>): string {
  const lines: string[] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  for (const node of nodes) {
    lines.push(`# ${node.label}`)
    lines.push('')

    // YAML frontmatter
    lines.push('---')
    lines.push(`type: ${node.type}`)
    lines.push(`created: ${node.createdAt.toISOString()}`)
    lines.push(`updated: ${node.updatedAt.toISOString()}`)
    lines.push(`energy: ${node.metadata.energyLevel}`)
    lines.push(`importance: ${node.metadata.importance}`)
    if (node.tags.length > 0) {
      lines.push(`tags: [${node.tags.join(', ')}]`)
    }
    lines.push('---')
    lines.push('')

    if (node.description) {
      lines.push(node.description)
      lines.push('')
    }

    // 反向链接
    const backlinks = edges.filter(e => e.target === node.id)
    if (backlinks.length > 0) {
      lines.push('## 反向链接')
      lines.push('')
      for (const link of backlinks) {
        const sourceNode = nodeMap.get(link.source)
        if (sourceNode) {
          lines.push(`- [[${sourceNode.label}]]`)
        }
      }
      lines.push('')
    }

    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * 解析 Obsidian Vault 目录结构
 */
export async function parseObsidianVault(fileList: FileList): Promise<ImportedNode[]> {
  const nodes: ImportedNode[] = []

  for (const file of Array.from(fileList)) {
    if (file.name.endsWith('.md')) {
      const content = await file.text()
      const imported = importFromMarkdown(content, {
        splitHeaders: false,
        includeLinks: true,
      })
      nodes.push(...imported)
    }
  }

  return nodes
}
