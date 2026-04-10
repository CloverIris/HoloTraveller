import type { Command } from './types'
import { 
  Network, 
  Layers, 
  Clock, 
  Shield, 
  Target,
  Home
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

export function createNavigationCommands(): Command[] {
  const { setViewMode, selectedNodeId, setSelectedNodeId } = useAppStore.getState()

  return [
    {
      id: 'nav-network',
      title: '网络视图',
      subtitle: '查看探索网络图',
      icon: Network,
      keywords: ['network', 'wangluo', '网络', 'wls'],
      category: 'navigation',
      shortcut: '⌘1',
      execute: () => setViewMode('network'),
    },
    {
      id: 'nav-threads',
      title: '线程管理',
      subtitle: '管理并行探索线程',
      icon: Layers,
      keywords: ['threads', 'xiancheng', '线程', 'xcgl'],
      category: 'navigation',
      shortcut: '⌘2',
      execute: () => setViewMode('threads'),
    },
    {
      id: 'nav-frameworks',
      title: '意义结构',
      subtitle: '查看认知框架',
      icon: Clock,
      keywords: ['frameworks', 'yiyi', '意义', 'jg'],
      category: 'navigation',
      shortcut: '⌘3',
      execute: () => setViewMode('frameworks'),
    },
    {
      id: 'nav-antifragility',
      title: '反脆弱训练',
      subtitle: '进行反脆弱性训练',
      icon: Shield,
      keywords: ['antifragility', 'fan cuiruo', '反脆弱', 'fc'],
      category: 'navigation',
      shortcut: '⌘4',
      execute: () => setViewMode('antifragility'),
    },
    {
      id: 'nav-home',
      title: '重置视图',
      subtitle: '返回到网络视图中心',
      icon: Home,
      keywords: ['home', 'reset', 'zhongzhi', '重置', 'cz'],
      category: 'navigation',
      execute: () => {
        setViewMode('network')
        setSelectedNodeId(null)
      },
    },
    {
      id: 'nav-focus-selection',
      title: '聚焦选中节点',
      subtitle: selectedNodeId ? '聚焦到当前选中的节点' : '没有选中节点',
      icon: Target,
      keywords: ['focus', 'jujiao', '聚焦', 'jj'],
      category: 'navigation',
      disabled: !selectedNodeId,
      execute: () => {
        // Focus logic handled by NetworkGraph
      },
    },
  ]
}
