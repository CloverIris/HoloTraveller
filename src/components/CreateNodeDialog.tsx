import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'

interface CreateNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const nodeTypes = [
  { value: 'concept', label: '概念', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'bg-blue-500', desc: '记录想法、概念或理论' },
  { value: 'goal', label: '目标', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-green-500', desc: '设定想要达成的目标' },
  { value: 'milestone', label: '里程碑', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'bg-purple-500', desc: '标记重要的完成节点' },
  { value: 'insight', label: '洞察', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'bg-amber-500', desc: '记录突然的领悟或发现' },
  { value: 'resource', label: '资源', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-gray-500', desc: '链接外部资源或文档' },
]

export function CreateNodeDialog({ open, onOpenChange }: CreateNodeDialogProps) {
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [selectedType, setSelectedType] = useState('concept')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    setStep('details')
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    // Create node logic here
    console.log('Creating node:', { type: selectedType, title, description })
    onOpenChange(false)
    reset()
  }

  const reset = () => {
    setStep('type')
    setSelectedType('concept')
    setTitle('')
    setDescription('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-lg bg-[var(--ht-bg-primary)] rounded-2xl shadow-2xl border border-[var(--ht-border-default)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--ht-border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--ht-text-primary)]">
                  {step === 'type' ? '创建新节点' : '添加节点详情'}
                </h2>
                <p className="text-sm text-[var(--ht-text-tertiary)]">
                  {step === 'type' ? '选择节点类型开始' : '填写节点信息'}
                </p>
              </div>
              <button 
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--ht-bg-secondary)] text-[var(--ht-text-tertiary)] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'type' ? (
                <div className="grid grid-cols-2 gap-3">
                  {nodeTypes.map((type) => (
                    <motion.button
                      key={type.value}
                      onClick={() => handleTypeSelect(type.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border border-[var(--ht-border-default)] hover:border-[var(--ht-accent)] hover:bg-[var(--ht-accent-subtle)] transition-all text-left group"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors", type.color)}>
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d={type.icon} />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--ht-text-primary)] mb-1">{type.label}</h3>
                      <p className="text-xs text-[var(--ht-text-tertiary)]">{type.desc}</p>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Type Display */}
                  <button
                    onClick={() => setStep('type')}
                    className="flex items-center gap-2 text-sm text-[var(--ht-accent)] hover:underline"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                    返回选择类型
                  </button>

                  {/* Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--ht-text-secondary)]">标题 *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="输入节点标题..."
                      className="w-full px-4 py-3 text-base bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] rounded-xl text-[var(--ht-text-primary)] placeholder:text-[var(--ht-text-tertiary)] focus:outline-none focus:border-[var(--ht-accent)] focus:ring-2 focus:ring-[var(--ht-accent-subtle)] transition-all"
                      autoFocus
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--ht-text-secondary)]">描述</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="添加描述（可选）..."
                      rows={3}
                      className="w-full px-4 py-3 text-sm bg-[var(--ht-bg-secondary)] border border-[var(--ht-border-default)] rounded-xl text-[var(--ht-text-primary)] placeholder:text-[var(--ht-text-tertiary)] focus:outline-none focus:border-[var(--ht-accent)] focus:ring-2 focus:ring-[var(--ht-accent-subtle)] transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--ht-border-default)] flex items-center justify-end gap-3 bg-[var(--ht-bg-secondary)]">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--ht-text-secondary)] hover:text-[var(--ht-text-primary)] transition-colors"
              >
                取消
              </button>
              {step === 'details' && (
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    title.trim() 
                      ? "bg-[var(--ht-accent)] text-white hover:bg-[var(--ht-accent-hover)]" 
                      : "bg-[var(--ht-bg-tertiary)] text-[var(--ht-text-tertiary)] cursor-not-allowed"
                  )}
                >
                  创建节点
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
