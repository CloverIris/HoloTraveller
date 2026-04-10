import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'

type Tab = 'properties' | 'connections' | 'history'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'properties', label: '属性', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'connections', label: '连接', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { id: 'history', label: '历史', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

export function RightPanel() {
  const { selectedNodeId, nodes, edges } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('properties')

  const selectedNode = nodes.find(n => n.id === selectedNodeId)
  const connectedEdges = edges.filter(e => e.source === selectedNodeId || e.target === selectedNodeId)

  if (!selectedNode) return null

  return (
    <div className="h-full flex flex-col bg-[var(--ht-bg-primary)]">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--ht-border-default)]">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            selectedNode.type === 'concept' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            selectedNode.type === 'goal' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
            selectedNode.type === 'milestone' && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
            selectedNode.type === 'insight' && "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
            selectedNode.type === 'exploration' && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            selectedNode.type === 'thread' && "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
          )}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--ht-text-primary)] truncate max-w-[180px]">
              {selectedNode.label || '未命名节点'}
            </h3>
            <span className="text-xs text-[var(--ht-text-tertiary)]">
              {selectedNode.type === 'concept' && '概念节点'}
              {selectedNode.type === 'goal' && '目标节点'}
              {selectedNode.type === 'milestone' && '里程碑'}
              {selectedNode.type === 'insight' && '洞察'}
              {selectedNode.type === 'exploration' && '探索节点'}
              {selectedNode.type === 'thread' && '线程节点'}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-lg hover:bg-[var(--ht-bg-secondary)] text-[var(--ht-text-tertiary)] hover:text-[var(--ht-text-secondary)]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--ht-border-default)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-all relative",
              activeTab === tab.id 
                ? "text-[var(--ht-accent)]" 
                : "text-[var(--ht-text-secondary)] hover:text-[var(--ht-text-primary)]"
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ht-accent)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'properties' && (
            <motion.div
              key="properties"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 space-y-4"
            >
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--ht-text-secondary)]">标题</label>
                <input 
                  type="text" 
                  value={selectedNode.label || ''}
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] rounded-lg text-[var(--ht-text-primary)]"
                />
              </div>

              {/* Type Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--ht-text-secondary)]">类型</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] rounded-lg">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    selectedNode.type === 'concept' && "bg-blue-500",
                    selectedNode.type === 'goal' && "bg-green-500",
                    selectedNode.type === 'milestone' && "bg-purple-500",
                    selectedNode.type === 'insight' && "bg-amber-500",
                    selectedNode.type === 'exploration' && "bg-gray-500",
                    selectedNode.type === 'thread' && "bg-pink-500",
                  )} />
                  <span className="text-sm text-[var(--ht-text-primary)] capitalize">
                    {selectedNode.type}
                  </span>
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--ht-text-secondary)]">描述</label>
                <textarea 
                  value={selectedNode.description || ''}
                  placeholder="添加描述..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] rounded-lg text-[var(--ht-text-primary)] placeholder:text-[var(--ht-text-tertiary)] resize-none focus:outline-none focus:border-[var(--ht-accent)]"
                />
              </div>

              {/* Tags Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--ht-text-secondary)]">标签</label>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.tags?.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-[var(--ht-accent-subtle)] text-[var(--ht-accent)] rounded-full">
                      {tag}
                    </span>
                  ))}
                  <button className="px-2 py-1 text-xs border border-dashed border-[var(--ht-border-default)] text-[var(--ht-text-tertiary)] rounded-full hover:border-[var(--ht-accent)] hover:text-[var(--ht-accent)] transition-colors">
                    + 添加标签
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-[var(--ht-border-default)] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--ht-text-tertiary)]">创建时间</span>
                  <span className="text-[var(--ht-text-secondary)]">
                    {selectedNode.createdAt?.toLocaleDateString?.() || '2026-04-10'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--ht-text-tertiary)]">更新时间</span>
                  <span className="text-[var(--ht-text-secondary)]">
                    {selectedNode.updatedAt?.toLocaleDateString?.() || '刚刚'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--ht-text-tertiary)]">连接数</span>
                  <span className="text-[var(--ht-text-secondary)]">{connectedEdges.length}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <button className="w-full py-2 px-4 bg-[var(--ht-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--ht-accent-hover)] transition-colors">
                  编辑节点
                </button>
                <button className="w-full py-2 px-4 bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] text-[var(--ht-text-secondary)] text-sm font-medium rounded-lg hover:bg-[var(--ht-bg-tertiary)] hover:text-[var(--ht-text-primary)] transition-colors">
                  删除节点
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'connections' && (
            <motion.div
              key="connections"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[var(--ht-text-secondary)]">
                  连接 ({connectedEdges.length})
                </span>
                <button className="text-xs text-[var(--ht-accent)] hover:underline">
                  + 新建连接
                </button>
              </div>
              
              <div className="space-y-2">
                {connectedEdges.length === 0 ? (
                  <div className="text-center py-8 text-[var(--ht-text-tertiary)]">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <p className="text-sm">暂无连接</p>
                    <p className="text-xs mt-1">点击"新建连接"开始</p>
                  </div>
                ) : (
                  connectedEdges.map((edge) => {
                    const otherNodeId = edge.source === selectedNodeId ? edge.target : edge.source
                    const otherNode = nodes.find(n => n.id === otherNodeId)
                    return (
                      <div 
                        key={edge.id}
                        className="flex items-center gap-3 p-3 bg-[var(--ht-bg-secondary)] rounded-lg border border-[var(--ht-border-default)] hover:border-[var(--ht-border-hover)] transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded bg-[var(--ht-bg-tertiary)] flex items-center justify-center">
                          <svg className="w-4 h-4 text-[var(--ht-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--ht-text-primary)] truncate">
                            {otherNode?.label || '未知节点'}
                          </p>
                          <p className="text-xs text-[var(--ht-text-tertiary)]">
                            {edge.source === selectedNodeId ? '连接到' : '被连接到'}
                          </p>
                        </div>
                        <button className="p-1.5 rounded hover:bg-[var(--ht-bg-tertiary)] text-[var(--ht-text-tertiary)]">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4"
            >
              <div className="text-center py-8 text-[var(--ht-text-tertiary)]">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">历史功能开发中</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
