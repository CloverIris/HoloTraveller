import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToolButton {
  id: string
  icon: string
  label: string
  shortcut?: string
  active?: boolean
  divider?: boolean
}

const tools: ToolButton[] = [
  { id: 'select', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', label: '选择工具', shortcut: 'V', active: true },
  { id: 'hand', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11', label: '拖拽画布', shortcut: 'H' },
  { id: 'connection', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', label: '连接工具', shortcut: 'C' },
  { id: 'divider1', icon: '', label: '', divider: true },
  { id: 'zoomIn', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7', label: '放大', shortcut: '+' },
  { id: 'zoomOut', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7', label: '缩小', shortcut: '-' },
  { id: 'fit', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4', label: '适应视图', shortcut: 'F' },
  { id: 'divider2', icon: '', label: '', divider: true },
  { id: 'grid', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: '切换网格', shortcut: 'G', active: true },
  { id: 'fullscreen', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4', label: '全屏', shortcut: 'F11' },
]

export function FloatingToolbar() {
  const [activeTool, setActiveTool] = useState('select')
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const handleToolClick = (id: string) => {
    if (id.includes('divider')) return
    setActiveTool(id)
  }

  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <div className="flex items-center gap-1 p-1.5 bg-[var(--ht-bg-elevated)]/95 backdrop-blur-md border border-[var(--ht-border-default)] rounded-xl shadow-lg">
        {tools.map((tool) => {
          if (tool.divider) {
            return (
              <div 
                key={tool.id} 
                className="w-px h-6 bg-[var(--ht-border-default)] mx-1"
              />
            )
          }

          const isActive = activeTool === tool.id
          const isHovered = hoveredTool === tool.id

          return (
            <motion.button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                isActive 
                  ? "bg-[var(--ht-accent-subtle)] text-[var(--ht-accent)]" 
                  : "text-[var(--ht-text-secondary)] hover:bg-[var(--ht-bg-secondary)] hover:text-[var(--ht-text-primary)]"
              )}
            >
              <svg 
                className="w-[18px] h-[18px]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={isActive ? 2 : 1.5}
              >
                <path d={tool.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50"
                  >
                    <div className="px-2.5 py-1.5 bg-[#1a1a1a] text-white text-xs rounded-lg shadow-xl whitespace-nowrap">
                      <div className="font-medium">{tool.label}</div>
                      {tool.shortcut && (
                        <div className="text-white/60 text-[10px] mt-0.5">{tool.shortcut}</div>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1a1a1a]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
