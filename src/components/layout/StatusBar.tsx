import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'

export function StatusBar() {
  const { nodes, edges, selectedNodeId } = useAppStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [phase, setPhase] = useState<'WANDER' | 'FOCUS' | 'SURGE'>('WANDER')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Simulate phase change based on activity
    const interval = setInterval(() => {
      setPhase(prev => {
        if (prev === 'WANDER') return 'FOCUS'
        if (prev === 'FOCUS') return 'SURGE'
        return 'WANDER'
      })
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const phaseColors = {
    WANDER: 'bg-amber-400',
    FOCUS: 'bg-[var(--ht-accent)]',
    SURGE: 'bg-purple-500',
  }

  const phaseLabels = {
    WANDER: '漫游',
    FOCUS: '专注',
    SURGE: '涌动',
  }

  return (
    <footer className="h-7 flex items-center justify-between px-3 bg-[var(--ht-bg-secondary)] border-t border-[var(--ht-border-default)] shrink-0 text-[11px]">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5 text-[var(--ht-text-secondary)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span>已连接</span>
        </div>

        {/* Cognitive Phase */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--ht-text-tertiary)]">认知相态</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-1.5"
            >
              <div className={cn("w-2 h-2 rounded-full", phaseColors[phase])} />
              <span className="font-medium text-[var(--ht-text-primary)]">{phaseLabels[phase]}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Activity Stats */}
        <div className="flex items-center gap-3 text-[var(--ht-text-tertiary)]">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
            {nodes.length} 节点
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {edges.length} 连接
          </span>
        </div>
      </div>

      {/* Center Section - Context Info */}
      <div className="flex items-center gap-4 text-[var(--ht-text-tertiary)]">
        {selectedNodeId ? (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ht-accent)]" />
            已选择节点
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            上次更新: {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 text-[var(--ht-text-tertiary)]">
        {/* Sync Status */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 hover:text-[var(--ht-text-secondary)] transition-colors"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>同步</span>
        </motion.button>

        {/* Keyboard Shortcut Hint */}
        <div className="flex items-center gap-1.5">
          <kbd className="px-1 py-0.5 bg-[var(--ht-bg-tertiary)] border border-[var(--ht-border-default)] rounded text-[10px]">
            ⌘
          </kbd>
          <span>/</span>
          <kbd className="px-1 py-0.5 bg-[var(--ht-bg-tertiary)] border border-[var(--ht-border-default)] rounded text-[10px]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1 py-0.5 bg-[var(--ht-bg-tertiary)] border border-[var(--ht-border-default)] rounded text-[10px]">
            K
          </kbd>
          <span className="text-[var(--ht-text-tertiary)]">命令面板</span>
        </div>
      </div>
    </footer>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
