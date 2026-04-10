import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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

  const handleSubmit = async () => {
    if (!form.label.trim()) return

    const node: Partial<Node> = {
      id: uuidv4(),
      label: form.label,
      type: form.type,
      description: form.description,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          新建节点
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>创建新节点</DialogTitle>
          <DialogDescription>
            在认知网络中添加一个新节点
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名称</label>
            <Input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="节点名称"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">类型</label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as Node['type'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(nodeTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="节点描述..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">重要性: {Math.round(form.importance * 100)}%</label>
            <Slider
              value={[form.importance]}
              onValueChange={([v]) => setForm({ ...form, importance: v })}
              max={1}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">能量水平: {Math.round(form.energyLevel * 100)}%</label>
            <Slider
              value={[form.energyLevel]}
              onValueChange={([v]) => setForm({ ...form, energyLevel: v })}
              max={1}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">标签（用逗号分隔）</label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>创建</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
