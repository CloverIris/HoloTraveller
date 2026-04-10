import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { canCreateThread, createThread, calculateThreadMetrics } from '@/core/threads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Activity, Snowflake, Layers } from 'lucide-react'
import type { Thread } from '@/types'

const threadTypeLabels: Record<Thread['type'], string> = {
  main: '主线',
  side: '支线',
  experiment: '实验',
  roaming: '漫游',
}

const threadTypeColors: Record<Thread['type'], string> = {
  main: 'bg-blue-500',
  side: 'bg-green-500',
  experiment: 'bg-orange-500',
  roaming: 'bg-purple-500',
}

export function ThreadPanel() {
  const { nodes, edges, threads, addThread, updateThread, setSelectedThreadId } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newThread, setNewThread] = useState<{
    name: string
    description: string
    type: Thread['type']
    priority: number
  }>({
    name: '',
    description: '',
    type: 'roaming',
    priority: 0.5,
  })

  const handleCreateThread = async () => {
    const check = canCreateThread(threads)
    if (!check.allowed) {
      alert(check.reason)
      return
    }

    const thread = createThread(
      newThread.name,
      newThread.description,
      newThread.type,
      newThread.priority
    )

    if (window.electronAPI) {
      const created = await window.electronAPI.db.createThread(thread)
      addThread(created)
    }

    setIsDialogOpen(false)
    setNewThread({ name: '', description: '', type: 'roaming', priority: 0.5 })
  }

  const handleHibernate = async (thread: Thread) => {
    const updated = { ...thread, status: 'hibernating' as const, updatedAt: new Date() }
    if (window.electronAPI) {
      await window.electronAPI.db.updateThread(updated)
      updateThread(updated)
    }
  }

  const handleActivate = async (thread: Thread) => {
    const updated = { ...thread, status: 'active' as const, lastActiveAt: new Date(), updatedAt: new Date() }
    if (window.electronAPI) {
      await window.electronAPI.db.updateThread(updated)
      updateThread(updated)
    }
  }

  const activeThreads = threads.filter(t => t.status === 'active')
  const hibernatingThreads = threads.filter(t => t.status === 'hibernating')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              探索线程
            </CardTitle>
            <CardDescription>
              多稳态并行探索管理 ({activeThreads.length}/5 活跃)
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                新建
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新线程</DialogTitle>
                <DialogDescription>
                  启动一条新的探索线程，与现有线程并行发展
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">名称</label>
                  <Input
                    value={newThread.name}
                    onChange={(e) => setNewThread({ ...newThread, name: e.target.value })}
                    placeholder="例如：副业探索"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">描述</label>
                  <Textarea
                    value={newThread.description}
                    onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                    placeholder="描述这个线程的探索目标..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">类型</label>
                  <Select
                    value={newThread.type}
                    onValueChange={(v) => setNewThread({ ...newThread, type: v as Thread['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">主线</SelectItem>
                      <SelectItem value="side">支线</SelectItem>
                      <SelectItem value="experiment">实验</SelectItem>
                      <SelectItem value="roaming">漫游</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateThread}>创建线程</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Threads */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">活跃线程</h4>
          {activeThreads.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无活跃线程</p>
          ) : (
            activeThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                nodes={nodes}
                edges={edges}
                onSelect={() => setSelectedThreadId(thread.id)}
                onHibernate={() => handleHibernate(thread)}
              />
            ))
          )}
        </div>

        {/* Hibernating Threads */}
        {hibernatingThreads.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">休眠线程</h4>
            {hibernatingThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                nodes={nodes}
                edges={edges}
                onSelect={() => setSelectedThreadId(thread.id)}
                onActivate={() => handleActivate(thread)}
                isHibernating
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ThreadItemProps {
  thread: Thread
  nodes: any[]
  edges: any[]
  onSelect: () => void
  onHibernate?: () => void
  onActivate?: () => void
  isHibernating?: boolean
}

function ThreadItem({ thread, nodes, edges, onSelect, onHibernate, onActivate, isHibernating }: ThreadItemProps) {
  const metrics = calculateThreadMetrics(thread, nodes, edges)

  return (
    <div
      className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent ${
        isHibernating ? 'opacity-60' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge className={`${threadTypeColors[thread.type]} text-white text-xs`}>
            {threadTypeLabels[thread.type]}
          </Badge>
          <span className="font-medium">{thread.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isHibernating ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onHibernate?.()
              }}
            >
              <Snowflake className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onActivate?.()
              }}
            >
              <Activity className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      {thread.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {thread.description}
        </p>
      )}
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span>活跃度: {Math.round(metrics.activityScore * 100)}%</span>
        <span>潜力: {Math.round(metrics.emergenceScore * 100)}%</span>
        {metrics.stagnationRisk > 0.6 && (
          <Badge variant="destructive" className="text-xs">停滞风险</Badge>
        )}
      </div>
    </div>
  )
}
