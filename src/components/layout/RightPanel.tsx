'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Copy,
  Share2,
  Tag,
  Calendar,
  Activity,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonFluent } from '@/components/ui/button-fluent'
import { useAppStore } from '@/stores/appStore'

interface RightPanelProps {
  className?: string
}

interface SectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

function CollapsibleSection({ title, children, defaultExpanded = true }: SectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-[var(--fluent-stroke-rest)] last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-[var(--fluent-fill-hover)] transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[var(--fluent-text-tertiary)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--fluent-text-tertiary)]" />
          )}
          <span className="text-sm font-medium text-[var(--fluent-text-primary)]">{title}</span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RightPanel({ className }: RightPanelProps) {
  const { selectedNodeId, nodes, setSelectedNodeId } = useAppStore()
  const [activeTab, setActiveTab] = useState<'properties' | 'connections' | 'history'>('properties')

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null

  if (!selectedNode) {
    return (
      <div className={cn(
        "w-72 border-l border-[var(--fluent-stroke-rest)] bg-[var(--fluent-bg-card)] flex flex-col",
        className
      )}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--fluent-fill-subtle)] flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-[var(--fluent-text-tertiary)]" />
          </div>
          <h3 className="text-sm font-medium text-[var(--fluent-text-primary)] mb-1">
            未选择节点
          </h3>
          <p className="text-xs text-[var(--fluent-text-secondary)]">
            点击网络图中的节点查看详情
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "w-72 border-l border-[var(--fluent-stroke-rest)] bg-[var(--fluent-bg-card)] flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--fluent-stroke-rest)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--fluent-text-primary)]">
            节点详情
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--fluent-accent-rest)]/10 text-[var(--fluent-accent-rest)]">
            {selectedNode.type}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <ButtonFluent variant="ghost" size="icon-sm">
            <MoreHorizontal className="h-4 w-4" />
          </ButtonFluent>
          <ButtonFluent variant="ghost" size="icon-sm" onClick={() => setSelectedNodeId(null)}>
            <X className="h-4 w-4" />
          </ButtonFluent>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-[var(--fluent-stroke-rest)]">
        {(['properties', 'connections', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors",
              activeTab === tab
                ? "bg-[var(--fluent-fill-selected)] text-[var(--fluent-accent-rest)]"
                : "text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-text-primary)] hover:bg-[var(--fluent-fill-hover)]"
            )}
          >
            {tab === 'properties' && '属性'}
            {tab === 'connections' && '连接'}
            {tab === 'history' && '历史'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'properties' && (
          <>
            {/* Basic Info Section */}
            <CollapsibleSection title="基本信息" defaultExpanded={true}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--fluent-text-secondary)] mb-1 block">名称</label>
                  <input
                    type="text"
                    defaultValue={selectedNode.label}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md bg-[var(--fluent-fill-secondary)] border border-transparent focus:border-[var(--fluent-accent-rest)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--fluent-text-secondary)] mb-1 block">描述</label>
                  <textarea
                    defaultValue={selectedNode.description || ''}
                    rows={2}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md bg-[var(--fluent-fill-secondary)] border border-transparent focus:border-[var(--fluent-accent-rest)] focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Tags Section */}
            <CollapsibleSection title="标签" defaultExpanded={true}>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-[var(--fluent-fill-secondary)] text-[var(--fluent-text-primary)]"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
                <button className="px-2 py-0.5 text-[11px] rounded-md border border-dashed border-[var(--fluent-stroke-rest)] text-[var(--fluent-text-tertiary)] hover:text-[var(--fluent-text-secondary)] transition-colors">
                  + 添加
                </button>
              </div>
            </CollapsibleSection>

            {/* Metadata Section */}
            <CollapsibleSection title="元数据" defaultExpanded={false}>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fluent-text-secondary)]">重要性</span>
                  <span className="text-[var(--fluent-text-secondary)]">{(selectedNode.metadata.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-[var(--fluent-fill-secondary)] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[var(--fluent-accent-rest)]"
                    style={{ width: `${selectedNode.metadata.importance * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[var(--fluent-text-secondary)]">能量水平</span>
                  <span className="text-[var(--fluent-text-secondary)]">{(selectedNode.metadata.energyLevel * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-[var(--fluent-fill-secondary)] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${selectedNode.metadata.energyLevel * 100}%` }}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Actions */}
            <div className="p-3 space-y-2">
              <ButtonFluent variant="primary" className="w-full" size="sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                AI 分析
              </ButtonFluent>
              <div className="flex gap-2">
                <ButtonFluent variant="secondary" className="flex-1" size="sm">
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  复制
                </ButtonFluent>
                <ButtonFluent variant="secondary" className="flex-1" size="sm">
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  分享
                </ButtonFluent>
              </div>
              <ButtonFluent variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" size="sm">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                删除节点
              </ButtonFluent>
            </div>
          </>
        )}

        {activeTab === 'connections' && (
          <div className="p-4">
            <p className="text-sm text-[var(--fluent-text-secondary)]">连接功能开发中...</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="h-4 w-4 text-[var(--fluent-text-tertiary)] mt-0.5" />
              <div>
                <p className="text-[var(--fluent-text-primary)]">创建于</p>
                <p className="text-xs text-[var(--fluent-text-secondary)]">
                  {new Date(selectedNode.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Activity className="h-4 w-4 text-[var(--fluent-text-tertiary)] mt-0.5" />
              <div>
                <p className="text-[var(--fluent-text-primary)]">访问次数</p>
                <p className="text-xs text-[var(--fluent-text-secondary)]">
                  {selectedNode.metadata.visitCount} 次
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
