import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import type { ViewMode } from '@/stores/appStore'
import { cn } from '@/lib/utils'

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
}

interface NavSection {
  id: string
  label: string
  icon: string
  view: ViewMode
}

const mainNav: NavSection[] = [
  { 
    id: 'network', 
    label: '网络视图', 
    view: 'network',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
  },
  { 
    id: 'threads', 
    label: '线程管理', 
    view: 'threads',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16'
  },
  { 
    id: 'frameworks', 
    label: '意义结构', 
    view: 'frameworks',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  },
  { 
    id: 'antifragility', 
    label: '反脆弱训练', 
    view: 'antifragility',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  { 
    id: 'trajectory', 
    label: '轨迹视图', 
    view: 'trajectory',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
  },
]

const toolsNav: NavSection[] = [
  { 
    id: 'analytics', 
    label: '探索分析', 
    view: 'network',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  { 
    id: 'tags', 
    label: '标签管理', 
    view: 'network',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
  },
  { 
    id: 'export', 
    label: '导入/导出', 
    view: 'network',
    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
  },
]

const recentItems = [
  { id: '1', label: '认知网络理论', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { id: '2', label: '技术博客写作', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: '3', label: '创意实验室', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
]

export function Sidebar({ expanded }: SidebarProps) {
  const { viewMode, setViewMode } = useAppStore()

  return (
    <motion.aside 
      className="h-full bg-[var(--ht-bg-secondary)] border-r border-[var(--ht-border-default)] flex flex-col shrink-0"
      initial={false}
      animate={{ width: expanded ? 240 : 64 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
    >
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {/* Primary Nav Items */}
        <nav className="space-y-1">
          {mainNav.map((item) => (
            <NavItem 
              key={item.id}
              item={item}
              active={viewMode === item.view}
              expanded={expanded}
              onClick={() => setViewMode(item.view)}
            />
          ))}
        </nav>

        {/* Divider */}
        <div className="my-3 h-px bg-[var(--ht-border-default)]" />

        {/* Tools Section */}
        {expanded && (
          <div className="mb-2 px-3">
            <span className="text-[11px] font-medium text-[var(--ht-text-tertiary)] uppercase tracking-wider">
              工具
            </span>
          </div>
        )}
        <nav className="space-y-1">
          {toolsNav.map((item) => (
            <NavItem 
              key={item.id}
              item={item}
              active={false}
              expanded={expanded}
              onClick={() => {}}
            />
          ))}
        </nav>

        {/* Recent Section */}
        <AnimatePresence mode="wait">
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="my-3 h-px bg-[var(--ht-border-default)]" />
              <div className="mb-2 px-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--ht-text-tertiary)] uppercase tracking-wider">
                  最近访问
                </span>
                <button className="text-[11px] text-[var(--ht-accent)] hover:underline">
                  查看全部
                </button>
              </div>
              <nav className="space-y-1">
                {recentItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--ht-text-secondary)] hover:bg-[var(--ht-bg-tertiary)] hover:text-[var(--ht-text-primary)] transition-colors text-left"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={item.icon} />
                    </svg>
                    <span className="truncate">{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="p-2 border-t border-[var(--ht-border-default)]">
        <NavItem
          item={{
            id: 'help',
            label: '帮助 & 反馈',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            view: 'network'
          }}
          active={false}
          expanded={expanded}
          onClick={() => {}}
        />
      </div>
    </motion.aside>
  )
}

interface NavItemProps {
  item: NavSection | { id: string; label: string; icon: string; view?: ViewMode }
  active: boolean
  expanded: boolean
  onClick: () => void
}

function NavItem({ item, active, expanded, onClick }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: expanded ? 2 : 0 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg transition-all duration-200 relative group",
        expanded ? "px-3 py-2" : "px-2 py-2 justify-center",
        active 
          ? "bg-[var(--ht-accent-subtle)] text-[var(--ht-accent)]" 
          : "text-[var(--ht-text-secondary)] hover:bg-[var(--ht-bg-tertiary)] hover:text-[var(--ht-text-primary)]"
      )}
      title={!expanded ? item.label : undefined}
    >
      {/* Active Indicator */}
      {active && expanded && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 w-0.5 h-5 bg-[var(--ht-accent)] rounded-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      
      {/* Icon */}
      <svg 
        className={cn(
          "flex-shrink-0 transition-all duration-200",
          expanded ? "w-5 h-5" : "w-5 h-5"
        )} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={active ? 2 : 1.5}
      >
        <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      
      {/* Label */}
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.span 
            className="text-sm font-medium truncate"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      
      {/* Tooltip for collapsed state */}
      {!expanded && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {item.label}
        </div>
      )}
    </motion.button>
  )
}
