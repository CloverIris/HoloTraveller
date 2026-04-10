import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { initializeCommands } from '@/core/commands'
import { NetworkGraph } from '@/components/graph/NetworkGraph'
import { CreateNodeDialog } from '@/components/CreateNodeDialog'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { 
  GlobalHeader,
  SidebarTabs,
  StatusBar,
  FloatingToolbar,
  RightPanel
} from '@/components/layout'
import { cn } from '@/lib/utils'
import './index.css'

function App() {
  const { loadAllData, isLoading, selectedNodeId } = useAppStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { open, setOpen } = useCommandPalette()

  useEffect(() => {
    loadAllData()
    initializeCommands()
  }, [loadAllData])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--fluent-bg-page)]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="h-16 w-16 animate-spin rounded-2xl border-[3px] border-[var(--fluent-accent-rest)]/20 border-t-[var(--fluent-accent-rest)]" />
            <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-2xl bg-gradient-to-br from-[var(--fluent-accent-rest)]/10 to-transparent" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--fluent-accent-rest)] to-purple-500 bg-clip-text text-transparent">
            HoloTraveller
          </h2>
          <p className="mt-2 text-sm text-[var(--fluent-text-secondary)]">涨落旅者</p>
          <p className="mt-4 text-xs text-[var(--fluent-text-tertiary)]">正在加载您的探索网络...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--fluent-bg-page)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 h-full transition-all duration-300 ease-standard",
          sidebarCollapsed ? "w-14" : "w-56"
        )}
      >
        <SidebarTabs 
          collapsed={sidebarCollapsed} 
          onCollapse={setSidebarCollapsed}
        />
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col min-w-0 h-full">
        {/* Global Header */}
        <GlobalHeader 
          onSearchClick={() => setOpen(true)}
          onSettingsClick={() => setShowSettings(true)}
        />

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Canvas Area */}
          <div className="flex-1 relative bg-[var(--fluent-bg-page)]">
            <NetworkGraph />
            
            {/* Floating Toolbar */}
            <FloatingToolbar
              zoom={100}
              onZoomIn={() => {}}
              onZoomOut={() => {}}
              onZoomReset={() => {}}
              onFitView={() => {}}
              showGrid={true}
              onToggleGrid={() => {}}
            />
          </div>

          {/* Right Panel */}
          <AnimatePresence>
            {selectedNodeId && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-l border-[var(--fluent-stroke-rest)] bg-[var(--fluent-bg-card)] overflow-hidden"
              >
                <RightPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <StatusBar />
      </main>

      {/* Command Palette */}
      <CommandPalette open={open} onOpenChange={setOpen} />

      {/* Create Node Dialog */}
      <CreateNodeDialog />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--fluent-bg-card)] shadow-depth-64 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">设置</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-[var(--fluent-fill-hover)]"
              >
                ×
              </button>
            </div>
            <p className="text-[var(--fluent-text-secondary)]">设置功能开发中...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
