'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Acrylic } from '@/components/ui/acrylic'
import { commandRegistry, initializeCommands, type Command } from '@/core/commands'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryLabels: Record<string, string> = {
  recent: '最近使用',
  navigation: '导航',
  creation: '创建',
  search: '搜索',
  action: '操作',
}

const categoryOrder = ['recent', 'navigation', 'creation', 'action', 'search']

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [, setCommands] = useState<Command[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeCommands()
    setCommands(commandRegistry.getAllCommands())
  }, [])

  useEffect(() => {
    if (open) {
      setSearch('')
      setSelectedIndex(0)
      setCommands(commandRegistry.getAllCommands())
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const filteredCommands = useMemo(() => {
    if (!search.trim()) {
      const recent = commandRegistry.getRecentCommands()
      const all = commandRegistry.getAllCommands()
      const recentIds = new Set(recent.map(cmd => cmd.id))
      const others = all.filter(cmd => !recentIds.has(cmd.id))
      return {
        recent: recent.slice(0, 5),
        ...groupByCategory(others),
      }
    }

    const query = search.toLowerCase()
    const allCommands = commandRegistry.getAllCommands()
    
    const filtered = allCommands.filter(cmd => {
      const matchesTitle = cmd.title.toLowerCase().includes(query)
      const matchesSubtitle = cmd.subtitle?.toLowerCase().includes(query)
      const matchesKeywords = cmd.keywords.some(k => 
        k.toLowerCase().includes(query) || 
        query.split('').every(c => k.toLowerCase().includes(c))
      )
      return matchesTitle || matchesSubtitle || matchesKeywords
    })

    return groupByCategory(filtered)
  }, [search])

  function groupByCategory(commands: Command[]) {
    const groups: Record<string, Command[]> = {}
    commands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    })
    return groups
  }

  const flatCommands = useMemo(() => {
    const result: Array<{ command: Command; category: string }> = []
    categoryOrder.forEach(category => {
      const cmds = filteredCommands[category as keyof typeof filteredCommands]
      if (Array.isArray(cmds) && cmds.length > 0) {
        cmds.forEach(cmd => result.push({ command: cmd, category }))
      }
    })
    return result
  }, [filteredCommands])

  const executeCommand = useCallback((command: Command) => {
    if (command.disabled) return
    command.execute()
    onOpenChange(false)
    setCommands(commandRegistry.getAllCommands())
  }, [onOpenChange])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
        return
      }

      if (flatCommands.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < flatCommands.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          e.preventDefault()
          const selected = flatCommands[selectedIndex]
          if (selected) {
            executeCommand(selected.command)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, flatCommands, selectedIndex, onOpenChange, executeCommand])

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Command Palette - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="relative w-full max-w-xl mx-4"
          >
            <Acrylic
              intensity="heavy"
              className="rounded-2xl shadow-dialog overflow-hidden border border-[var(--fluent-stroke-rest)]"
            >
              {/* Search Input */}
              <div className="border-b border-[var(--fluent-stroke-rest)] p-3">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-[var(--fluent-text-tertiary)] flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setSelectedIndex(0)
                    }}
                    placeholder="搜索命令、节点、线程..."
                    className="flex-1 bg-transparent text-base text-[var(--fluent-text-primary)] placeholder:text-[var(--fluent-text-tertiary)] focus:outline-none min-w-0"
                  />
                  {search && (
                    <button
                      onClick={() => {
                        setSearch('')
                        inputRef.current?.focus()
                      }}
                      className="rounded-lg p-1 hover:bg-[var(--fluent-fill-hover)] flex-shrink-0"
                    >
                      <X className="h-4 w-4 text-[var(--fluent-text-tertiary)]" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex items-center justify-center w-10 h-6 rounded-md bg-[var(--fluent-fill-tertiary)] text-[11px] text-[var(--fluent-text-tertiary)] flex-shrink-0">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div 
                ref={listRef}
                className="max-h-[360px] overflow-y-auto p-2"
              >
                {flatCommands.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="mb-3 h-10 w-10 text-[var(--fluent-text-tertiary)]" />
                    <p className="text-sm text-[var(--fluent-text-secondary)]">
                      没有找到匹配的命令
                    </p>
                    <p className="mt-1 text-xs text-[var(--fluent-text-tertiary)]">
                      尝试使用不同的关键词搜索
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {categoryOrder.map(category => {
                      const cmds = filteredCommands[category as keyof typeof filteredCommands]
                      if (!Array.isArray(cmds) || cmds.length === 0) return null

                      return (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-medium text-[var(--fluent-text-tertiary)] uppercase tracking-wider">
                            {categoryLabels[category] || category}
                          </div>
                          <div className="space-y-0.5">
                            {cmds.map((command) => {
                              const flatIdx = flatCommands.findIndex(
                                fc => fc.command.id === command.id
                              )
                              const isSelected = flatIdx === selectedIndex
                              const Icon = command.icon

                              return (
                                <button
                                  key={command.id}
                                  data-index={flatIdx}
                                  onClick={() => executeCommand(command)}
                                  onMouseEnter={() => setSelectedIndex(flatIdx)}
                                  disabled={command.disabled}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-100",
                                    isSelected 
                                      ? 'bg-[var(--fluent-accent-rest)] text-white' 
                                      : 'text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]',
                                    command.disabled && 'opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  {Icon && (
                                    <Icon className={cn(
                                      "h-4 w-4 flex-shrink-0",
                                      isSelected ? 'text-white' : 'text-[var(--fluent-text-secondary)]'
                                    )} />
                                  )}
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm truncate">{command.title}</span>
                                      {command.badge && (
                                        <span className={cn(
                                          "rounded-full px-1.5 py-0 text-[10px] font-medium flex-shrink-0",
                                          isSelected 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-[var(--fluent-accent-rest)]/10 text-[var(--fluent-accent-rest)]'
                                        )}>
                                          {command.badge}
                                        </span>
                                      )}
                                    </div>
                                    {command.subtitle && (
                                      <p className={cn(
                                        "text-xs truncate",
                                        isSelected ? 'text-white/70' : 'text-[var(--fluent-text-secondary)]'
                                      )}>
                                        {command.subtitle}
                                      </p>
                                    )}
                                  </div>
                                  {command.shortcut && (
                                    <kbd className={cn(
                                      "rounded-lg px-2 py-0.5 text-xs flex-shrink-0",
                                      isSelected 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-[var(--fluent-fill-secondary)] text-[var(--fluent-text-tertiary)]'
                                    )}>
                                      {command.shortcut}
                                    </kbd>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--fluent-stroke-rest)] bg-[var(--fluent-fill-subtle)] px-3 py-2">
                <div className="flex items-center gap-4 text-xs text-[var(--fluent-text-tertiary)]">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" />
                    选择
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    <ArrowDown className="h-3 w-3" />
                    导航
                  </span>
                </div>
                <span className="text-xs text-[var(--fluent-text-tertiary)]">
                  {flatCommands.length} 个命令
                </span>
              </div>
            </Acrylic>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
