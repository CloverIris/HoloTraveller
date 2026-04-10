import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import type { ViewMode as VM } from '@/stores/appStore'
import { cn } from '@/lib/utils'

interface GlobalHeaderProps {
  onSearchClick: () => void
  onSettingsClick: () => void
  sidebarExpanded: boolean
  onToggleSidebar: () => void
}

const viewOptions: { value: VM; label: string; icon: string }[] = [
  { value: 'network', label: '网络视图', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { value: 'threads', label: '线程管理', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { value: 'frameworks', label: '意义结构', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { value: 'antifragility', label: '反脆弱训练', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { value: 'trajectory', label: '轨迹视图', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
]

export function GlobalHeader({ 
  onSearchClick, 
  onSettingsClick,
  sidebarExpanded,
  onToggleSidebar 
}: GlobalHeaderProps) {
  const { viewMode, setViewMode } = useAppStore()

  return (
    <header className="h-[52px] flex items-center justify-between px-3 bg-[var(--ht-bg-primary)] border-b border-[var(--ht-border-default)] shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            sidebarExpanded 
              ? "bg-[var(--ht-accent-subtle)] text-[var(--ht-accent)]" 
              : "hover:bg-[var(--ht-bg-secondary)] text-[var(--ht-text-secondary)]"
          )}
          title="切换侧边栏 (⌘B)"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </motion.button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--ht-accent)] to-purple-500 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--ht-text-primary)] leading-tight">HoloTraveller</span>
            <span className="text-[10px] text-[var(--ht-text-tertiary)] leading-tight">涨落旅者</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--ht-border-default)] mx-2" />

        {/* View Selector */}
        <div className="flex items-center gap-1">
          {viewOptions.map((view) => (
            <motion.button
              key={view.value}
              onClick={() => setViewMode(view.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                viewMode === view.value
                  ? "text-[var(--ht-accent)]"
                  : "text-[var(--ht-text-secondary)] hover:text-[var(--ht-text-primary)] hover:bg-[var(--ht-bg-secondary)]"
              )}
            >
              {viewMode === view.value && (
                <motion.div
                  layoutId="activeView"
                  className="absolute inset-0 bg-[var(--ht-accent-subtle)] rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative">{view.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-xl mx-8">
        <motion.button
          onClick={onSearchClick}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          className="w-full h-9 flex items-center gap-2 px-3 bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] rounded-lg text-sm text-[var(--ht-text-secondary)] hover:border-[var(--ht-border-hover)] hover:bg-[var(--ht-bg-tertiary)] transition-all group"
        >
          <svg className="w-4 h-4 text-[var(--ht-text-tertiary)] group-hover:text-[var(--ht-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="flex-1 text-left">搜索节点、线程或命令...</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-[var(--ht-bg-primary)] border border-[var(--ht-border-default)] rounded text-[var(--ht-text-tertiary)]">
            ⌘K
          </kbd>
        </motion.button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* Create Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-8 px-3 bg-[var(--ht-accent)] text-white text-sm font-medium rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-[var(--ht-accent-hover)] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>新建</span>
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--ht-border-default)] mx-2" />

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--ht-bg-secondary)] text-[var(--ht-text-secondary)] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--ht-bg-primary)]" />
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--ht-bg-secondary)] text-[var(--ht-text-secondary)] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </motion.button>

        {/* User Avatar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-medium shadow-sm"
        >
          T
        </motion.button>
      </div>
    </header>
  )
}
