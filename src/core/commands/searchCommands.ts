import type { Command } from './types'
import { 
  Search, 
  Tag,
  Clock,
  Star
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { searchEngine } from '@/core/search/searchEngine'
import type { Node as AppNode, Thread as AppThread, CognitiveFramework } from '@/types'

export function createSearchCommands(searchQuery?: string): Command[] {
  const { nodes, threads, frameworks, setSelectedNodeId, setViewMode } = useAppStore.getState()
  
  const commands: Command[] = []

  // Node search results
  if (searchQuery) {
    const nodeResults = searchEngine.searchNodes(nodes, { 
      query: searchQuery, 
      fuzzy: true,
      threshold: 0.4
    }).slice(0, 5)

    nodeResults.forEach(result => {
      const node = result.item as unknown as AppNode
      commands.push({
        id: `search-node-${node.id}`,
        title: node.label,
        subtitle: `节点 · ${node.type}${node.tags.length ? ' · ' + node.tags.join(', ') : ''}`,
        icon: Search,
        keywords: [node.label, ...node.tags, 'node', 'jiedian'],
        category: 'search',
        execute: () => {
          setSelectedNodeId(node.id)
          setViewMode('network')
        },
      })
    })

    // Thread search results
    const threadResults = searchEngine.searchThreads(threads, { 
      query: searchQuery,
      fuzzy: true 
    }).slice(0, 3)

    threadResults.forEach(result => {
      const thread = result.item as unknown as AppThread
      commands.push({
        id: `search-thread-${thread.id}`,
        title: thread.name,
        subtitle: `线程 · ${thread.status} · ${thread.nodeIds.length} 个节点`,
        icon: Search,
        keywords: [thread.name, 'thread', 'xiancheng'],
        category: 'search',
        execute: () => {
          setViewMode('threads')
        },
      })
    })

    // Framework search results
    const frameworkResults = searchEngine.searchFrameworks(frameworks, { 
      query: searchQuery,
      fuzzy: true 
    }).slice(0, 3)

    frameworkResults.forEach(result => {
      const framework = result.item as unknown as CognitiveFramework
      commands.push({
        id: `search-framework-${framework.id}`,
        title: framework.title,
        subtitle: `框架 · ${framework.status}`,
        icon: Search,
        keywords: [framework.title, 'framework', 'yiyi', 'kuangjia'],
        category: 'search',
        execute: () => {
          setViewMode('frameworks')
        },
      })
    })
  }

  // Quick filters
  const allTags = [...new Set(nodes.flatMap(n => n.tags))].slice(0, 5)
  allTags.forEach(tag => {
    commands.push({
      id: `filter-tag-${tag}`,
      title: `标签: ${tag}`,
      subtitle: `筛选具有 "${tag}" 标签的节点`,
      icon: Tag,
      keywords: [tag, 'tag', 'biaoqian', '筛选', 'filter'],
      category: 'search',
      execute: () => {
        setViewMode('network')
        const event = new CustomEvent('filterByTag', { detail: tag })
        window.dispatchEvent(event)
      },
    })
  })

  // Recent nodes
  const recentNodes = [...nodes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  recentNodes.forEach(node => {
    commands.push({
      id: `recent-node-${node.id}`,
      title: node.label,
      subtitle: `最近创建 · ${new Date(node.createdAt).toLocaleDateString()}`,
      icon: Clock,
      keywords: [node.label, 'recent', 'zuijin', '最近'],
      category: 'recent',
      execute: () => {
        setSelectedNodeId(node.id)
        setViewMode('network')
      },
    })
  })

  // Important nodes (high energy or chaos affinity)
  const importantNodes = nodes
    .filter(n => n.metadata.energyLevel > 0.7 || n.metadata.chaosAffinity > 0.7)
    .slice(0, 3)

  importantNodes.forEach(node => {
    commands.push({
      id: `important-node-${node.id}`,
      title: node.label,
      subtitle: `重要节点 · 能量: ${(node.metadata.energyLevel * 100).toFixed(0)}%`,
      icon: Star,
      keywords: [node.label, 'important', 'zhongyao', '重要'],
      category: 'search',
      badge: '重要',
      execute: () => {
        setSelectedNodeId(node.id)
        setViewMode('network')
      },
    })
  })

  return commands
}
