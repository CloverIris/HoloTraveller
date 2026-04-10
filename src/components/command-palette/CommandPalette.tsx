import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'

interface PaletteCommand {
  id: string
  label: string
  shortcut?: string
  category: string
  icon?: string
  action: () => void
}

const paletteCommands: PaletteCommand[] = [
  // Navigation
  { id: 'nav-network', label: '切换到网络视图', shortcut: '⌘1', category: '导航', icon: 'M12 2L2 7l10 5 10-5-10-5z', action: () => {} },
  { id: 'nav-threads', label: '切换到线程管理', shortcut: '⌘2', category: '导航', icon: 'M4 6h16M4 10h16', action: () => {} },
  { id: 'nav-frameworks', label: '切换到意义结构', shortcut: '⌘3', category: '导航', icon: 'M12 6.253v13', action: () => {} },
  { id: 'nav-antifragility', label: '切换到反脆弱训练', shortcut: '⌘4', category: '导航', icon: 'M13 10V3', action: () => {} },
  { id: 'nav-trajectory', label: '切换到轨迹视图', shortcut: '⌘5', category: '导航', icon: 'M9 20l-5.447-2.724', action: () => {} },
  
  // Actions
  { id: 'action-create', label: '创建新节点', shortcut: '⌘N', category: '操作', icon: 'M12 5v14M5 12h14', action: () => {} },
  { id: 'action-search', label: '搜索节点', shortcut: '⌘F', category: '操作', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0', action: () => {} },
  { id: 'action-export', label: '导出数据', category: '操作', icon: 'M4 16v1a3 3 0 003 3h10', action: () => {} },
  { id: 'action-import', label: '导入数据', category: '操作', icon: 'M4 16v1a3 3 0 003 3h10', action: () => {} },
  
  // View
  { id: 'view-fit', label: '适应视图', shortcut: 'F', category: '视图', icon: 'M4 8V4m0 0h4', action: () => {} },
  { id: 'view-zoom-in', label: '放大', shortcut: '+', category: '视图', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0', action: () => {} },
  { id: 'view-zoom-out', label: '缩小', shortcut: '-', category: '视图', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0', action: () => {} },
  { id: 'view-grid', label: '切换网格', shortcut: 'G', category: '视图', icon: 'M4 6a2 2 0 012-2h2', action: () => {} },
  
  // Settings
  { id: 'settings-general', label: '通用设置', category: '设置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0', action: () => {} },
  { id: 'settings-theme', label: '切换主题', shortcut: '⌘T', category: '设置', icon: 'M20.354 15.354A9 9 0 018.646 3.646', action: () => {} },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredCommands = useMemo(() => {
    if (!query) return paletteCommands
    const q = query.toLowerCase()
    return paletteCommands.filter(cmd => 
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    )
  }, [query])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, PaletteCommand[]> = {}
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const cmd = filteredCommands[selectedIndex]
        if (cmd) {
          cmd.action()
          onOpenChange(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredCommands, selectedIndex, onOpenChange])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Palette */}
          <motion.div
            className="relative w-full max-w-xl bg-[var(--ht-bg-primary)] rounded-xl shadow-2xl border border-[var(--ht-border-default)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--ht-border-default)]">
              <svg className="w-5 h-5 text-[var(--ht-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索命令、节点或操作..."
                className="flex-1 bg-transparent text-[var(--ht-text-primary)] placeholder:text-[var(--ht-text-tertiary)] focus:outline-none text-base"
              />
              <kbd className="px-2 py-1 text-xs bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] rounded text-[var(--ht-text-tertiary)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-[var(--ht-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <p className="text-sm text-[var(--ht-text-secondary)]">未找到匹配命令</p>
                  <p className="text-xs text-[var(--ht-text-tertiary)] mt-1">尝试其他关键词</p>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items], groupIndex) => {
                  const previousItems = Object.values(groupedCommands).slice(0, groupIndex).flat()
                  return (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-xs font-medium text-[var(--ht-text-tertiary)] uppercase tracking-wider">
                        {category}
                      </div>
                      {items.map((cmd, index) => {
                        const globalIndex = previousItems.length + index
                        const isSelected = globalIndex === selectedIndex
                        
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              cmd.action()
                              onOpenChange(false)
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "w-full px-4 py-2.5 flex items-center gap-3 transition-all",
                              isSelected ? "bg-[var(--ht-accent-subtle)]" : "hover:bg-[var(--ht-bg-secondary)]"
                            )}
                          >
                            {/* Icon */}
                            {cmd.icon && (
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                isSelected ? "bg-[var(--ht-accent)] text-white" : "bg-[var(--ht-bg-secondary)] text-[var(--ht-text-secondary)]"
                              )}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d={cmd.icon} />
                                </svg>
                              </div>
                            )}
                            
                            {/* Label */}
                            <span className={cn(
                              "flex-1 text-left text-sm font-medium",
                              isSelected ? "text-[var(--ht-accent)]" : "text-[var(--ht-text-primary)]"
                            )}>
                              {cmd.label}
                            </span>
                            
                            {/* Shortcut */}
                            {cmd.shortcut && (
                              <kbd className={cn(
                                "px-2 py-0.5 text-xs rounded border",
                                isSelected 
                                  ? "bg-[var(--ht-accent)] text-white border-[var(--ht-accent)]" 
                                  : "bg-[var(--ht-bg-secondary)] text-[var(--ht-text-tertiary)] border-[var(--ht-border-default)]"
                              )}>
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--ht-border-default)] bg-[var(--ht-bg-secondary)] text-xs text-[var(--ht-text-tertiary)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-[var(--ht-bg-primary)] border border-[var(--ht-border-default)] rounded">↑↓</kbd>
                  导航
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-[var(--ht-bg-primary)] border border-[var(--ht-border-default)] rounded">↵</kbd>
                  选择
                </span>
              </div>
              <span>{filteredCommands.length} 个命令</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
