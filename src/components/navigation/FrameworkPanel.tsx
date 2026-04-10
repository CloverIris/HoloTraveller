import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Clock, AlertCircle } from 'lucide-react'
import { calculateTimeRemaining, formatRelativeTime } from '@/lib/utils'
import type { CognitiveFramework } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export function FrameworkPanel() {
  const { frameworks, addFramework } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newFramework, setNewFramework] = useState({
    title: '',
    content: '',
    coreConflict: '',
    temporaryFocus: '',
    halfLife: 168, // 7 days
  })

  const handleCreate = async () => {
    const framework: Partial<CognitiveFramework> = {
      id: uuidv4(),
      title: newFramework.title,
      content: newFramework.content,
      context: {
        timeRange: {
          start: new Date(),
          end: new Date(Date.now() + newFramework.halfLife * 60 * 60 * 1000),
        },
        focusAreas: [],
        coreConflict: newFramework.coreConflict,
        temporaryFocus: newFramework.temporaryFocus,
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + newFramework.halfLife * 60 * 60 * 1000),
      halfLife: newFramework.halfLife,
      status: 'active',
      relatedNodeIds: [],
      relatedThreadIds: [],
    }

    if (window.electronAPI) {
      const created = await window.electronAPI.db.createFramework(framework)
      addFramework(created)
    }

    setIsDialogOpen(false)
    setNewFramework({ title: '', content: '', coreConflict: '', temporaryFocus: '', halfLife: 168 })
  }

  const activeFrameworks = frameworks.filter(f => f.status === 'active')
  const expiredFrameworks = frameworks.filter(f => f.status === 'expired')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              临时意义结构
            </CardTitle>
            <CardDescription>
              生成临时的认知框架，对抗信息过载
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                新建
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>创建临时意义结构</DialogTitle>
                <DialogDescription>
                  建立一个有半衰期的临时认知框架
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">标题</label>
                  <Input
                    value={newFramework.title}
                    onChange={(e) => setNewFramework({ ...newFramework, title: e.target.value })}
                    placeholder="例如：本季度的核心冲突"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">内容</label>
                  <Textarea
                    value={newFramework.content}
                    onChange={(e) => setNewFramework({ ...newFramework, content: e.target.value })}
                    placeholder="描述当前情境下的认知框架..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">核心冲突</label>
                  <Input
                    value={newFramework.coreConflict}
                    onChange={(e) => setNewFramework({ ...newFramework, coreConflict: e.target.value })}
                    placeholder="例如：效率与创新的张力"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">暂时关注</label>
                  <Input
                    value={newFramework.temporaryFocus}
                    onChange={(e) => setNewFramework({ ...newFramework, temporaryFocus: e.target.value })}
                    placeholder="例如：探索新的工作流"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">半衰期（小时）</label>
                  <Input
                    type="number"
                    value={newFramework.halfLife}
                    onChange={(e) => setNewFramework({ ...newFramework, halfLife: parseInt(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>创建框架</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeFrameworks.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无活跃的临时意义结构</p>
        ) : (
          activeFrameworks.map((framework) => (
            <FrameworkItem
              key={framework.id}
              framework={framework}
            />
          ))
        )}

        {expiredFrameworks.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">已过期</h4>
            <div className="space-y-2 opacity-60">
              {expiredFrameworks.slice(0, 3).map((framework) => (
                <div key={framework.id} className="rounded border p-2">
                  <span className="text-sm">{framework.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FrameworkItem({ framework }: { framework: CognitiveFramework }) {
  const timeRemaining = calculateTimeRemaining(framework.createdAt, framework.expiresAt)
  const isExpiringSoon = timeRemaining < 20

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <h4 className="font-medium">{framework.title}</h4>
        {isExpiringSoon && (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="mr-1 h-3 w-3" />
            即将过期
          </Badge>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
        {framework.content}
      </p>
      {framework.context.coreConflict && (
        <div className="mt-2 text-xs">
          <span className="text-muted-foreground">核心冲突: </span>
          <span>{framework.context.coreConflict}</span>
        </div>
      )}
      {framework.context.temporaryFocus && (
        <div className="mt-1 text-xs">
          <span className="text-muted-foreground">暂时关注: </span>
          <span>{framework.context.temporaryFocus}</span>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                isExpiringSoon ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${timeRemaining}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(framework.expiresAt)}
        </span>
      </div>
    </div>
  )
}
