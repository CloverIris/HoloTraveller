import type { Command } from './types'
import { 
  Plus, 
  GitBranch, 
  FileText, 
  Link2,
  Lightbulb
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { v4 as uuidv4 } from 'uuid'
import type { Node, Thread } from '@/types'

export function createCreationCommands(): Command[] {
  const { 
    addNode, 
    addThread, 
    nodes,
    setViewMode,
    setSelectedNodeId 
  } = useAppStore.getState()

  return [
    {
      id: 'create-node',
      title: '新建节点',
      subtitle: '创建一个新的探索节点',
      icon: Plus,
      keywords: ['create', 'new', 'jiedian', '节点', 'jd', 'xinjian'],
      category: 'creation',
      shortcut: '⌘N',
      execute: () => {
        // Open create node dialog - this would be handled by UI
        const event = new CustomEvent('openCreateNodeDialog')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'create-thread',
      title: '新建线程',
      subtitle: '创建一个新的探索线程',
      icon: GitBranch,
      keywords: ['thread', 'xiancheng', '线程', 'xc'],
      category: 'creation',
      execute: () => {
        const newThread: Thread = {
          id: uuidv4(),
          name: `线程 ${new Date().toLocaleTimeString()}`,
          description: '新建探索线程',
          nodeIds: [],
          status: 'active',
          createdAt: new Date(),
          lastActiveAt: new Date(),
          type: 'roaming',
          priority: 0.5,
          emergencePotential: 0.5,
          trajectoryIds: [],
          updatedAt: new Date(),
          phaseTransitionSignals: [],
        }
        addThread(newThread)
        setViewMode('threads')
      },
    },
    {
      id: 'create-framework',
      title: '新建意义框架',
      subtitle: '创建一个新的认知框架',
      icon: FileText,
      keywords: ['framework', 'yiyi', '意义', 'yj'],
      category: 'creation',
      execute: () => {
        setViewMode('frameworks')
        const event = new CustomEvent('openCreateFrameworkDialog')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'create-connection',
      title: '新建连接',
      subtitle: '在节点之间创建连接',
      icon: Link2,
      keywords: ['link', 'connect', 'lianjie', '连接', 'lj'],
      category: 'creation',
      disabled: nodes.length < 2,
      execute: () => {
        setViewMode('network')
        const event = new CustomEvent('startCreateEdge')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'create-insight',
      title: '记录洞见',
      subtitle: '快速记录一个想法或洞见',
      icon: Lightbulb,
      keywords: ['insight', 'dongjian', '洞见', 'dj'],
      category: 'creation',
      execute: () => {
        const newNode: Node = {
          id: uuidv4(),
          label: `洞见 ${new Date().toLocaleTimeString()}`,
          type: 'insight',
          description: '',
          tags: ['quick-capture'],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            energyLevel: 0.7,
            importance: 0.5,
            stability: 0.5,
            chaosAffinity: 0.5,
            visitCount: 0,
          },
        }
        addNode(newNode)
        setSelectedNodeId(newNode.id)
        setViewMode('network')
      },
    },
  ]
}
