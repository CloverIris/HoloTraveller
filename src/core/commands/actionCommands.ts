import type { Command } from './types'
import { 
  Moon, 
  Download, 
  Upload, 
  RefreshCw,
  Zap,
  Settings,
  HelpCircle,
  Keyboard
} from 'lucide-react'

export function createActionCommands(): Command[] {
  return [
    {
      id: 'action-dark-mode',
      title: '切换深色模式',
      subtitle: '在浅色和深色主题间切换',
      icon: Moon,
      keywords: ['dark', 'theme', 'shense', '深色', 'ss'],
      category: 'action',
      execute: () => {
        document.documentElement.classList.toggle('dark')
        localStorage.setItem('theme', 
          document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        )
      },
    },
    {
      id: 'action-export',
      title: '导出数据',
      subtitle: '导出所有数据为 JSON',
      icon: Download,
      keywords: ['export', 'daochu', '导出', 'dc'],
      category: 'action',
      execute: () => {
        const event = new CustomEvent('exportData')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'action-import',
      title: '导入数据',
      subtitle: '从 JSON 文件导入数据',
      icon: Upload,
      keywords: ['import', 'daoru', '导入', 'dr'],
      category: 'action',
      execute: () => {
        const event = new CustomEvent('importData')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'action-refresh',
      title: '刷新数据',
      subtitle: '重新加载所有数据',
      icon: RefreshCw,
      keywords: ['refresh', 'reload', 'shuaxin', '刷新', 'sx'],
      category: 'action',
      execute: () => {
        window.location.reload()
      },
    },
    {
      id: 'action-ai-analyze',
      title: 'AI 分析',
      subtitle: '使用 AI 分析当前网络',
      icon: Zap,
      keywords: ['ai', 'analyze', 'fenxi', '分析', 'fx'],
      category: 'action',
      badge: 'AI',
      execute: () => {
        const event = new CustomEvent('requestAIAnalysis')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'action-shortcuts',
      title: '键盘快捷键',
      subtitle: '查看所有可用的快捷键',
      icon: Keyboard,
      keywords: ['shortcuts', 'keyboard', 'jianpan', '键盘', 'jp'],
      category: 'action',
      shortcut: '?',
      execute: () => {
        const event = new CustomEvent('showShortcutsHelp')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'action-settings',
      title: '设置',
      subtitle: '打开应用设置',
      icon: Settings,
      keywords: ['settings', 'shezhi', '设置', 'sz'],
      category: 'action',
      execute: () => {
        const event = new CustomEvent('openSettings')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'action-help',
      title: '帮助',
      subtitle: '查看使用帮助',
      icon: HelpCircle,
      keywords: ['help', 'bangzhu', '帮助', 'bz'],
      category: 'action',
      execute: () => {
        const event = new CustomEvent('showHelp')
        window.dispatchEvent(event)
      },
    },
  ]
}
