/**
 * 快捷键管理器
 * 全局快捷键和命令面板系统
 */

export interface Shortcut {
  id: string
  key: string
  modifiers: ('ctrl' | 'cmd' | 'alt' | 'shift')[]
  description: string
  action: () => void
  scope?: 'global' | 'input'
}

export interface Command {
  id: string
  title: string
  description?: string
  icon?: string
  shortcut?: string
  action: () => void
  category: string
}

class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  private commands: Map<string, Command> = new Map()
  private isEnabled: boolean = true

  constructor() {
    this.setupKeyboardListener()
  }

  /**
   * 注册快捷键
   */
  register(shortcut: Shortcut) {
    const key = this.normalizeShortcutKey(shortcut)
    this.shortcuts.set(key, shortcut)
  }

  /**
   * 注销快捷键
   */
  unregister(id: string) {
    for (const [key, shortcut] of this.shortcuts) {
      if (shortcut.id === id) {
        this.shortcuts.delete(key)
        break
      }
    }
  }

  /**
   * 注册命令
   */
  registerCommand(command: Command) {
    this.commands.set(command.id, command)
  }

  /**
   * 执行命令
   */
  executeCommand(id: string): boolean {
    const command = this.commands.get(id)
    if (command) {
      command.action()
      return true
    }
    return false
  }

  /**
   * 获取所有命令
   */
  getCommands(): Command[] {
    return Array.from(this.commands.values()).sort((a, b) => 
      a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
    )
  }

  /**
   * 搜索命令
   */
  searchCommands(query: string): Command[] {
    const lowerQuery = query.toLowerCase()
    return this.getCommands().filter(cmd => 
      cmd.title.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 启用/禁用快捷键
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  /**
   * 格式化快捷键显示
   */
  formatShortcut(shortcut: Shortcut): string {
    const parts: string[] = []
    
    if (shortcut.modifiers.includes('ctrl')) parts.push('Ctrl')
    if (shortcut.modifiers.includes('cmd')) parts.push('Cmd')
    if (shortcut.modifiers.includes('alt')) parts.push('Alt')
    if (shortcut.modifiers.includes('shift')) parts.push('Shift')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join('+')
  }

  /**
   * 设置键盘监听器
   */
  private setupKeyboardListener() {
    if (typeof window === 'undefined') return

    window.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return

      // 忽略输入框中的快捷键（除非特别指定）
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable

      const key = this.buildKeyFromEvent(e)
      const shortcut = this.shortcuts.get(key)

      if (shortcut) {
        if (isInput && shortcut.scope !== 'input') return
        
        e.preventDefault()
        shortcut.action()
      }
    })
  }

  /**
   * 从事件构建快捷键键
   */
  private buildKeyFromEvent(e: KeyboardEvent): string {
    const parts: string[] = []
    
    if (e.ctrlKey) parts.push('ctrl')
    if (e.metaKey) parts.push('cmd')
    if (e.altKey) parts.push('alt')
    if (e.shiftKey) parts.push('shift')
    
    parts.push(e.key.toLowerCase())
    
    return parts.join('+')
  }

  /**
   * 标准化快捷键键
   */
  private normalizeShortcutKey(shortcut: Shortcut): string {
    const parts = [...shortcut.modifiers, shortcut.key.toLowerCase()]
    return parts.join('+')
  }
}

export const shortcutManager = new ShortcutManager()

// 默认快捷键配置
export const DEFAULT_SHORTCUTS: Omit<Shortcut, 'action'>[] = [
  {
    id: 'command-palette',
    key: 'k',
    modifiers: ['ctrl'],
    description: '打开命令面板',
  },
  {
    id: 'quick-open',
    key: 'p',
    modifiers: ['ctrl'],
    description: '快速打开节点',
  },
  {
    id: 'new-node',
    key: 'n',
    modifiers: ['ctrl'],
    description: '新建节点',
  },
  {
    id: 'search',
    key: 'f',
    modifiers: ['ctrl'],
    description: '搜索',
  },
  {
    id: 'goto-node',
    key: 'g',
    modifiers: ['ctrl'],
    description: '跳转到节点',
  },
  {
    id: 'toggle-sidebar',
    key: 'b',
    modifiers: ['ctrl'],
    description: '切换侧边栏',
  },
  {
    id: 'focus-graph',
    key: '1',
    modifiers: ['ctrl'],
    description: '聚焦网络视图',
  },
  {
    id: 'focus-threads',
    key: '2',
    modifiers: ['ctrl'],
    description: '聚焦线程视图',
  },
  {
    id: 'focus-frameworks',
    key: '3',
    modifiers: ['ctrl'],
    description: '聚焦框架视图',
  },
  {
    id: 'focus-antifragility',
    key: '4',
    modifiers: ['ctrl'],
    description: '聚焦反脆弱视图',
  },
  {
    id: 'generate-insight',
    key: 'i',
    modifiers: ['ctrl', 'shift'],
    description: '生成洞察',
  },
  {
    id: 'introduce-shock',
    key: 's',
    modifiers: ['ctrl', 'shift'],
    description: '引入反脆弱冲击',
  },
  {
    id: 'save-snapshot',
    key: 's',
    modifiers: ['ctrl'],
    description: '保存快照',
  },
  {
    id: 'export-data',
    key: 'e',
    modifiers: ['ctrl', 'shift'],
    description: '导出数据',
  },
  {
    id: 'import-data',
    key: 'o',
    modifiers: ['ctrl'],
    description: '导入数据',
  },
  {
    id: 'refresh-analysis',
    key: 'r',
    modifiers: ['ctrl'],
    description: '刷新分析',
  },
  {
    id: 'escape',
    key: 'escape',
    modifiers: [],
    description: '取消/关闭',
    scope: 'global',
  },
]
