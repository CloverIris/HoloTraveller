'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  WifiOff,
  CheckCircle2,
  Activity,
  Clock,
  Terminal,
  Keyboard,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { calculateChaosMetrics } from '@/core/chaos'

interface StatusBarProps {
  className?: string
}

export function StatusBar({ className }: StatusBarProps) {
  const { nodes, edges, threads, viewMode } = useAppStore()
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [chaosLevel, setChaosLevel] = useState(0.5)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (nodes.length > 0) {
      const metrics = calculateChaosMetrics(nodes, edges)
      setChaosLevel(metrics.chaosDegree)
    }
  }, [nodes, edges])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const getChaosColor = (level: number) => {
    if (level < 0.3) return 'text-emerald-500'
    if (level < 0.6) return 'text-amber-500'
    return 'text-rose-500'
  }

  const getChaosLabel = (level: number) => {
    if (level < 0.3) return '有序'
    if (level < 0.6) return '混沌边缘'
    return '高混沌'
  }

  return (
    <div className={cn(
      "h-7 flex items-center justify-between px-3 text-[11px] border-t border-[var(--fluent-stroke-rest)] bg-[var(--fluent-bg-surface)] flex-shrink-0",
      className
    )}>
      {/* Left Section - Status & Stats */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              <span className="text-[var(--fluent-text-secondary)] whitespace-nowrap">已连接</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-rose-500 flex-shrink-0" />
              <span className="text-rose-500 whitespace-nowrap">离线</span>
            </>
          )}
        </div>

        {/* Sync Status */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
          <span className="text-[var(--fluent-text-secondary)] whitespace-nowrap">已同步</span>
        </div>

        {/* Chaos Level */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          <Activity className={cn("h-3 w-3 flex-shrink-0", getChaosColor(chaosLevel))} />
          <span className="text-[var(--fluent-text-secondary)] whitespace-nowrap">混沌度:</span>
          <span className={cn("font-medium whitespace-nowrap", getChaosColor(chaosLevel))}>
            {getChaosLabel(chaosLevel)}
          </span>
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-2 px-2 py-0.5 rounded bg-[var(--fluent-fill-subtle)] flex-shrink-0">
          <span className="text-[var(--fluent-text-secondary)] whitespace-nowrap">{nodes.length} 节点</span>
          <span className="text-[var(--fluent-stroke-rest)]">|</span>
          <span className="text-[var(--fluent-text-secondary)] whitespace-nowrap">{edges.length} 连接</span>
          <span className="text-[var(--fluent-stroke-rest)]">|</span>
          <span className="text-[var(--fluent-text-secondary)] whitespace-nowrap">{threads.length} 线程</span>
        </div>
      </div>

      {/* Center - View Info */}
      <div className="hidden lg:block text-[var(--fluent-text-tertiary)] whitespace-nowrap px-4">
        {viewMode === 'network' && '探索网络'}
        {viewMode === 'threads' && '线程管理'}
        {viewMode === 'frameworks' && '意义结构'}
        {viewMode === 'antifragility' && '反脆弱训练'}
        {viewMode === 'trajectory' && '轨迹视图'}
      </div>

      {/* Right Section - Tools */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Current Time */}
        <div className="flex items-center gap-1 text-[var(--fluent-text-secondary)] flex-shrink-0">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="whitespace-nowrap">{currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Shortcuts Help */}
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-1 text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-accent-rest)] transition-colors flex-shrink-0"
        >
          <Keyboard className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">快捷键 (?)</span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggleTerminal'))}
          className="hidden sm:flex items-center gap-1 text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-accent-rest)] transition-colors flex-shrink-0"
        >
          <Terminal className="h-3 w-3 flex-shrink-0" />
          <span className="whitespace-nowrap">终端</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1 text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-accent-rest)] transition-colors flex-shrink-0"
        >
          {isFullscreen ? <Minimize2 className="h-3 w-3 flex-shrink-0" /> : <Maximize2 className="h-3 w-3 flex-shrink-0" />}
        </button>
      </div>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-8 right-4 z-50 w-72"
          >
            <div className="rounded-xl bg-[var(--fluent-bg-card)] shadow-depth-16 border border-[var(--fluent-stroke-rest)] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--fluent-text-primary)]">键盘快捷键</h3>
                <button onClick={() => setShowShortcuts(false)} className="text-[var(--fluent-text-tertiary)] hover:text-[var(--fluent-text-primary)] text-lg">
                  ×
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--fluent-text-secondary)]">Command Palette</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--fluent-fill-secondary)] text-[var(--fluent-text-primary)]">⌘K</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fluent-text-secondary)]">新建节点</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--fluent-fill-secondary)] text-[var(--fluent-text-primary)]">⌘N</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fluent-text-secondary)]">切换视图</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--fluent-fill-secondary)] text-[var(--fluent-text-primary)]">⌘1-5</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fluent-text-secondary)]">切换侧边栏</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--fluent-fill-secondary)] text-[var(--fluent-text-primary)]">⌘B</kbd>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
