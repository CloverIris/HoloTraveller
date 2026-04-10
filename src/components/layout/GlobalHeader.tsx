'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Search, 
  Command,
  Bell,
  Settings,
  User,
  ChevronDown,
  Plus,
  Zap,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  Compass
} from 'lucide-react'
import { ButtonFluent } from '@/components/ui/button-fluent'
import { Acrylic } from '@/components/ui/acrylic'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import type { AppState } from '@/stores/appStore'

interface GlobalHeaderProps {
  onSearchClick: () => void
  onSettingsClick: () => void
}

const viewLabels: Record<AppState['viewMode'], { label: string; shortcut: string }> = {
  network: { label: '网络视图', shortcut: '⌘1' },
  threads: { label: '线程管理', shortcut: '⌘2' },
  frameworks: { label: '意义结构', shortcut: '⌘3' },
  antifragility: { label: '反脆弱训练', shortcut: '⌘4' },
  trajectory: { label: '轨迹视图', shortcut: '⌘5' },
}

export function GlobalHeader({ onSearchClick, onSettingsClick }: GlobalHeaderProps) {
  const { viewMode, setViewMode, nodes, threads, navigationState } = useAppStore()
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
  const [isTheme, setIsTheme] = useState<'light' | 'dark' | 'system'>('system')
  const viewMenuRef = useRef<HTMLDivElement>(null)
  const createMenuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false)
      }
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setIsCreateMenuOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setIsTheme(theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }

  // 获取当前认知相态
  const getPhaseStatus = () => {
    if (!navigationState) return { label: '探索中', color: 'text-blue-500' }
    switch (navigationState.currentPhase) {
      case 'edge_of_chaos': return { label: '混沌边缘', color: 'text-amber-500' }
      case 'rigid_order': return { label: '有序僵化', color: 'text-emerald-500' }
      case 'disordered_chaos': return { label: '混乱迷失', color: 'text-rose-500' }
      default: return { label: '过渡状态', color: 'text-blue-500' }
    }
  }

  const phaseStatus = getPhaseStatus()

  return (
    <Acrylic
      intensity="medium"
      className="h-12 border-b border-[var(--fluent-stroke-rest)] flex-shrink-0"
      withBorder={false}
    >
      <div className="flex h-full items-center px-3">
        {/* Left Section - Brand & Navigation */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 pr-3 border-r border-[var(--fluent-stroke-rest)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--fluent-accent-rest)] to-purple-500 shadow-lg shadow-[var(--fluent-accent-rest)]/20 flex-shrink-0">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-bold text-[var(--fluent-text-primary)] whitespace-nowrap leading-tight">
                HoloTraveller
              </span>
              <span className="text-[10px] text-[var(--fluent-text-secondary)] whitespace-nowrap leading-tight">
                涨落旅者
              </span>
            </div>
          </div>

          {/* View Switcher */}
          <div className="relative" ref={viewMenuRef}>
            <button
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)] rounded-lg transition-colors"
            >
              <span className="whitespace-nowrap">{viewLabels[viewMode].label}</span>
              <ChevronDown className={cn(
                "h-4 w-4 text-[var(--fluent-text-tertiary)] transition-transform duration-200",
                isViewMenuOpen && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {isViewMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-1 w-48"
                >
                  <Acrylic intensity="heavy" className="rounded-xl shadow-depth-16 overflow-hidden border border-[var(--fluent-stroke-rest)]">
                    <div className="p-1">
                      {Object.entries(viewLabels).map(([key, { label, shortcut }]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setViewMode(key as AppState['viewMode'])
                            setIsViewMenuOpen(false)
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            viewMode === key
                              ? "bg-[var(--fluent-accent-rest)]/10 text-[var(--fluent-accent-rest)]"
                              : "text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]"
                          )}
                        >
                          <span>{label}</span>
                          <kbd className="rounded bg-[var(--fluent-fill-secondary)] px-1.5 py-0.5 text-[10px] text-[var(--fluent-text-tertiary)]">
                            {shortcut}
                          </kbd>
                        </button>
                      ))}
                    </div>
                  </Acrylic>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create Menu */}
          <div className="relative" ref={createMenuRef}>
            <button
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--fluent-accent-rest)] hover:bg-[var(--fluent-accent-rest)]/10 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline whitespace-nowrap">新建</span>
            </button>

            <AnimatePresence>
              {isCreateMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-1 w-44"
                >
                  <Acrylic intensity="heavy" className="rounded-xl shadow-depth-16 overflow-hidden border border-[var(--fluent-stroke-rest)]">
                    <div className="p-1">
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('openCreateNodeDialog'))
                          setIsCreateMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]"
                      >
                        <Sparkles className="h-4 w-4 text-[var(--fluent-accent-rest)]" />
                        <span>新建节点</span>
                      </button>
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('openCreateThreadDialog'))
                          setIsCreateMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]"
                      >
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span>新建线程</span>
                      </button>
                    </div>
                  </Acrylic>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <button
            onClick={onSearchClick}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl px-4 py-2",
              "bg-[var(--fluent-fill-secondary)] hover:bg-[var(--fluent-fill-hover)]",
              "border border-transparent hover:border-[var(--fluent-stroke-rest)]",
              "transition-all duration-200 group"
            )}
          >
            <Search className="h-4 w-4 text-[var(--fluent-text-tertiary)] group-hover:text-[var(--fluent-text-secondary)] flex-shrink-0" />
            <span className="flex-1 text-left text-sm text-[var(--fluent-text-tertiary)] group-hover:text-[var(--fluent-text-secondary)] truncate">
              搜索命令、节点、线程...
            </span>
            <kbd className="hidden sm:flex items-center gap-0.5 rounded-lg bg-[var(--fluent-fill-tertiary)] px-2 py-0.5 text-[10px] text-[var(--fluent-text-tertiary)] flex-shrink-0">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Right Section - Status & Tools */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cognitive Phase Status */}
          <div className="hidden xl:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-lg bg-[var(--fluent-fill-subtle)]">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", phaseStatus.color.replace('text-', 'bg-'))} />
            <span className={cn("text-xs font-medium", phaseStatus.color)}>
              {phaseStatus.label}
            </span>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-3 mr-2 px-3 py-1.5 rounded-lg bg-[var(--fluent-fill-subtle)]">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-[var(--fluent-text-secondary)] whitespace-nowrap">{nodes.length} 节点</span>
            </div>
            <div className="h-3 w-px bg-[var(--fluent-stroke-rest)]" />
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-xs text-[var(--fluent-text-secondary)] whitespace-nowrap">{threads.length} 线程</span>
            </div>
          </div>

          {/* Tools */}
          <div className="flex items-center">
            {/* Theme Toggle */}
            <div className="relative group">
              <ButtonFluent variant="ghost" size="icon-sm">
                {isTheme === 'dark' ? <Moon className="h-4 w-4" /> : 
                 isTheme === 'light' ? <Sun className="h-4 w-4" /> : 
                 <Monitor className="h-4 w-4" />}
              </ButtonFluent>
              
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
                <Acrylic intensity="heavy" className="rounded-xl shadow-depth-16 p-1 min-w-[120px]">
                  <button onClick={() => handleThemeChange('light')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--fluent-fill-hover)]">
                    <Sun className="h-4 w-4" /> 浅色
                  </button>
                  <button onClick={() => handleThemeChange('dark')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--fluent-fill-hover)]">
                    <Moon className="h-4 w-4" /> 深色
                  </button>
                  <button onClick={() => handleThemeChange('system')} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--fluent-fill-hover)]">
                    <Monitor className="h-4 w-4" /> 跟随系统
                  </button>
                </Acrylic>
              </div>
            </div>

            {/* Notifications */}
            <ButtonFluent variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 border-2 border-[var(--fluent-bg-card)]" />
            </ButtonFluent>

            {/* Help */}
            <ButtonFluent variant="ghost" size="icon-sm">
              <HelpCircle className="h-4 w-4" />
            </ButtonFluent>

            {/* Settings */}
            <ButtonFluent variant="ghost" size="icon-sm" onClick={onSettingsClick}>
              <Settings className="h-4 w-4" />
            </ButtonFluent>

            {/* Profile */}
            <div className="relative pl-2 ml-1 border-l border-[var(--fluent-stroke-rest)]" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-medium hover:ring-2 hover:ring-[var(--fluent-accent-rest)]/30 transition-all"
              >
                U
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    className="absolute right-0 top-full z-50 mt-2 w-48"
                  >
                    <Acrylic intensity="heavy" className="rounded-xl shadow-depth-16 overflow-hidden border border-[var(--fluent-stroke-rest)]">
                      <div className="p-3 border-b border-[var(--fluent-stroke-rest)]">
                        <p className="text-sm font-semibold text-[var(--fluent-text-primary)]">探索者</p>
                        <p className="text-xs text-[var(--fluent-text-secondary)]">user@holotraveller.app</p>
                      </div>
                      <div className="p-1">
                        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]">
                          <User className="h-4 w-4" />
                          个人资料
                        </button>
                        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]">
                          <Settings className="h-4 w-4" />
                          设置
                        </button>
                      </div>
                    </Acrylic>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Acrylic>
  )
}
