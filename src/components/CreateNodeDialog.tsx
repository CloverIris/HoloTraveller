import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { ButtonFluent } from '@/components/ui/button-fluent'
import { InputFluent } from '@/components/ui/input-fluent'
import { Textarea } from '@/components/ui/textarea'
import { DialogFluent, DialogFluentContent, DialogFluentHeader, DialogFluentTitle, DialogFluentDescription, DialogFluentFooter } from '@/components/ui/dialog-fluent'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Plus } from 'lucide-react'
import type { Node } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const nodeTypeLabels: Record<Node['type'], string> = {
  concept: '概念',
  goal: '目标',
  milestone: '里程碑',
  exploration: '探索',
  insight: '洞察',
  thread: '线程',
}

export function CreateNodeDialog() {
  const { addNode } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    label: '',
    type: 'concept' as Node['type'],
    description: '',
    importance: 0.5,
    energyLevel: 0.5,
    tags: '',
  })

  // Listen for custom event to open dialog from Command Palette
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('openCreateNodeDialog', handleOpen)
    return () => window.removeEventListener('openCreateNodeDialog', handleOpen)
  }, [])

  const handleSubmit = async () => {
    if (!form.label.trim()) return

    const node: Node = {
      id: uuidv4(),
      label: form.label,
      type: form.type,
      description: form.description,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        importance: form.importance,
        stability: 0.5,
        chaosAffinity: 0.5,
        energyLevel: form.energyLevel,
        visitCount: 0,
      },
    }

    if (window.electronAPI) {
      const created = await window.electronAPI.db.createNode(node)
      addNode(created)
    } else {
      addNode(node)
    }

    setIsOpen(false)
    setForm({
      label: '',
      type: 'concept',
      description: '',
      importance: 0.5,
      energyLevel: 0.5,
      tags: '',
    })
  }

  return (
    <DialogFluent open={isOpen} onOpenChange={setIsOpen}>
      <ButtonFluent
        variant="primary"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="mr-1 h-4 w-4" />
        新建节点
      </ButtonFluent>
      <DialogFluentContent size="md">
        <DialogFluentHeader>
          <DialogFluentTitle>创建新节点</DialogFluentTitle>
          <DialogFluentDescription>
            在认知网络中添加一个新节点
          </DialogFluentDescription>
        </DialogFluentHeader>
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fluent-text-primary)]">名称</label>
            <InputFluent
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="节点名称"
              variant="filled"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fluent-text-primary)]">类型</label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as Node['type'] })}
            >
              <SelectTrigger className="h-10 rounded-[var(--radius-medium)] border-[var(--fluent-stroke-rest)] bg-[var(--fluent-fill-secondary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[var(--radius-medium)]">
                {Object.entries(nodeTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fluent-text-primary)]">描述</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="节点描述..."
              rows={3}
              className="rounded-[var(--radius-medium)] border-[var(--fluent-stroke-rest)] bg-[var(--fluent-fill-secondary)]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-[var(--fluent-text-primary)]">重要性</label>
              <span className="text-sm text-[var(--fluent-text-secondary)]">{Math.round(form.importance * 100)}%</span>
            </div>
            <Slider
              value={[form.importance]}
              onValueChange={([v]) => setForm({ ...form, importance: v })}
              max={1}
              step={0.1}
              className="py-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-[var(--fluent-text-primary)]">能量水平</label>
              <span className="text-sm text-[var(--fluent-text-secondary)]">{Math.round(form.energyLevel * 100)}%</span>
            </div>
            <Slider
              value={[form.energyLevel]}
              onValueChange={([v]) => setForm({ ...form, energyLevel: v })}
              max={1}
              step={0.1}
              className="py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fluent-text-primary)]">标签（用逗号分隔）</label>
            <InputFluent
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
              variant="filled"
            />
          </div>
        </div>
        <DialogFluentFooter>
          <ButtonFluent variant="secondary" onClick={() => setIsOpen(false)}>
            取消
          </ButtonFluent>
          <ButtonFluent variant="primary" onClick={handleSubmit}>
            创建
          </ButtonFluent>
        </DialogFluentFooter>
      </DialogFluentContent>
    </DialogFluent>
  )
}
