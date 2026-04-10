'use client'

import { 
  Network, 
  Layers, 
  Clock, 
  Shield,
  GitBranch,
  Zap,
  Bookmark,
  Tag,
  Filter,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonFluent } from '@/components/ui/button-fluent'
import { useAppStore } from '@/stores/appStore'
import type { AppState } from '@/stores/appStore'

interface TabItem {
  id: AppState['viewMode']
  label: string
  icon: typeof Network
}

const mainTabs: TabItem[] = [
  { id: 'network', label: '网络视图', icon: Network },
  { id: 'threads', label: '线程管理', icon: Layers },
  { id: 'frameworks', label: '意义结构', icon: Clock },
  { id: 'antifragility', label: '反脆弱', icon: Shield },
  { id: 'trajectory', label: '轨迹视图', icon: GitBranch },
]

const toolTabs = [
  { id: 'insights', label: '洞见', icon: Zap },
  { id: 'bookmarks', label: '收藏', icon: Bookmark },
  { id: 'tags', label: '标签', icon: Tag },
]

interface SidebarTabsProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function SidebarTabs({ collapsed = false, onCollapse }: SidebarTabsProps) {
  const { viewMode, setViewMode, nodes, threads } = useAppStore()

  const handleTabClick = (tabId: AppState['viewMode']) => {
    setViewMode(tabId)
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-[var(--fluent-bg-surface)] border-r border-[var(--fluent-stroke-rest)] transition-all duration-300",
      collapsed ? "w-14" : "w-56"
    )}>
      {/* Main Navigation */}
      <div className="flex-1 py-3 px-2">
        <div className="space-y-0.5">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = viewMode === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[var(--fluent-fill-selected)] text-[var(--fluent-accent-rest)]"
                    : "text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]",
                  collapsed && "justify-center px-2"
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-[var(--fluent-accent-rest)]" />
                )}

                <Icon className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive && "text-[var(--fluent-accent-rest)]"
                )} />
                
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{tab.label}</span>
                    
                    {/* Badges */}
                    {tab.id === 'network' && nodes.length > 0 && (
                      <span className="text-xs text-[var(--fluent-text-tertiary)]">
                        {nodes.length}
                      </span>
                    )}
                    {tab.id === 'threads' && threads.length > 0 && (
                      <span className="text-xs text-[var(--fluent-text-tertiary)]">
                        {threads.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        {!collapsed && <div className="my-3 mx-2 h-px bg-[var(--fluent-stroke-rest)]" />}

        {/* Tools Section */}
        {!collapsed && (
          <div className="space-y-0.5">
            <p className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fluent-text-tertiary)]">
              工具
            </p>
            {toolTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)] transition-colors"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Filters Section */}
        {!collapsed && (
          <div className="mt-4 space-y-0.5">
            <p className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fluent-text-tertiary)]">
              筛选
            </p>
            <button className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)] transition-colors">
              <Filter className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 text-left">过滤器</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)] transition-colors">
              <Target className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 text-left">我的关注</span>
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[var(--fluent-stroke-rest)]">
        <ButtonFluent
          variant="ghost"
          size="sm"
          onClick={() => onCollapse?.(!collapsed)}
          className={cn(
            "w-full transition-all",
            collapsed && "rotate-180"
          )}
        >
          <svg className="h-4 w-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </svg>
        </ButtonFluent>
      </div>
    </div>
  )
}
