import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { initializeCommands } from '@/core/commands'
import { NetworkGraph } from '@/components/graph/NetworkGraph'
import { CreateNodeDialog } from '@/components/CreateNodeDialog'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { GlobalHeader } from '@/components/layout/GlobalHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { StatusBar } from '@/components/layout/StatusBar'
import { FloatingToolbar } from '@/components/layout/FloatingToolbar'
import { RightPanel } from '@/components/layout/RightPanel'

import './index.css'

function App() {
  const { loadAllData, isLoading, selectedNodeId, viewMode } = useAppStore()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const { open, setOpen } = useCommandPalette()

  useEffect(() => {
    loadAllData()
    initializeCommands()
  }, [loadAllData])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      // Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarExpanded(prev => !prev)
      }
      // Quick Create
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowCreateMenu(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--ht-bg-primary)]">
        <div className="text-center">
          <motion.div 
            className="relative mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ht-accent)] to-purple-500 flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <motion.div 
              className="absolute inset-0 rounded-2xl border-2 border-[var(--ht-accent)]"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <motion.h1 
            className="text-2xl font-bold text-[var(--ht-text-primary)] mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            HoloTraveller
          </motion.h1>
          <motion.p 
            className="text-sm text-[var(--ht-text-secondary)] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            涨落旅者
          </motion.p>
          <motion.div 
            className="flex items-center justify-center gap-2 text-xs text-[var(--ht-text-tertiary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-4 h-4 border-2 border-[var(--ht-accent)] border-t-transparent rounded-full animate-spin" />
            正在加载探索网络...
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[var(--ht-bg-primary)]">
      {/* Global Header */}
      <GlobalHeader 
        onSearchClick={() => setOpen(true)}
        onSettingsClick={() => setShowSettings(true)}
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Main Canvas */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Breadcrumb Bar */}
            <div className="h-9 flex items-center px-4 border-b border-[var(--ht-border-default)] bg-[var(--ht-bg-secondary)]">
              <nav className="flex items-center gap-2 text-sm">
                <span className="text-[var(--ht-text-secondary)]">HoloTraveller</span>
                <span className="text-[var(--ht-text-tertiary)]">/</span>
                <span className="text-[var(--ht-text-primary)] font-medium capitalize">
                  {viewMode === 'network' && '网络视图'}
                  {viewMode === 'threads' && '线程管理'}
                  {viewMode === 'frameworks' && '意义结构'}
                  {viewMode === 'antifragility' && '反脆弱训练'}
                  {viewMode === 'trajectory' && '轨迹视图'}
                </span>
              </nav>
            </div>

            {/* View Content */}
            <div className="flex-1 relative overflow-hidden">
              {viewMode === 'network' && <NetworkGraph />}
              {viewMode === 'threads' && (
                <div className="h-full flex items-center justify-center text-[var(--ht-text-secondary)]">
                  线程管理视图开发中...
                </div>
              )}
              {viewMode === 'frameworks' && (
                <div className="h-full flex items-center justify-center text-[var(--ht-text-secondary)]">
                  意义结构视图开发中...
                </div>
              )}
              {viewMode === 'antifragility' && (
                <div className="h-full flex items-center justify-center text-[var(--ht-text-secondary)]">
                  反脆弱训练视图开发中...
                </div>
              )}
              {viewMode === 'trajectory' && (
                <div className="h-full flex items-center justify-center text-[var(--ht-text-secondary)]">
                  轨迹视图开发中...
                </div>
              )}

              {/* Floating Toolbar */}
              <FloatingToolbar />
            </div>
          </div>

          {/* Right Panel */}
          <AnimatePresence mode="wait">
            {selectedNodeId && (
              <motion.div
                initial={{ width: 0, opacity: 0, x: 20 }}
                animate={{ width: 320, opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: 20 }}
                transition={{ 
                  duration: 0.25, 
                  ease: [0.175, 0.885, 0.32, 1.275]
                }}
                className="border-l border-[var(--ht-border-default)] bg-[var(--ht-bg-primary)] overflow-hidden"
              >
                <RightPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Overlays */}
      <CommandPalette open={open} onOpenChange={setOpen} />
      <CreateNodeDialog open={showCreateMenu} onOpenChange={setShowCreateMenu} />
      
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              className="w-full max-w-md bg-[var(--ht-bg-primary)] rounded-2xl shadow-xl border border-[var(--ht-border-default)] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[var(--ht-border-default)] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--ht-text-primary)]">设置</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--ht-bg-secondary)] text-[var(--ht-text-secondary)] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-[var(--ht-text-secondary)]">设置功能开发中...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
