import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Save, Trash2, Zap, Activity } from 'lucide-react'
import type { Node } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

const nodeTypeLabels: Record<Node['type'], string> = {
  concept: '概念',
  goal: '目标',
  milestone: '里程碑',
  exploration: '探索',
  insight: '洞察',
  thread: '线程',
}

export function NodeDetail() {
  const { nodes, edges, selectedNodeId, setSelectedNodeId, updateNode, removeNode } = useAppStore()
  const node = nodes.find((n) => n.id === selectedNodeId)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Node>>({})

  if (!node) return null

  const connectedEdges = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  )
  const connectedNodes = connectedEdges.map((e) => {
    const otherId = e.source === node.id ? e.target : e.source
    return nodes.find((n) => n.id === otherId)
  }).filter(Boolean)

  const handleEdit = () => {
    setEditForm({ ...node })
    setIsEditing(true)
  }

  const handleSave = async () => {
    const updated = { ...node, ...editForm, updatedAt: new Date() }
    if (window.electronAPI) {
      await window.electronAPI.db.updateNode(updated)
      updateNode(updated)
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这个节点吗？')) {
      if (window.electronAPI) {
        await window.electronAPI.db.deleteNode(node.id)
        removeNode(node.id)
        setSelectedNodeId(null)
      }
    }
  }

  const handleVisit = async () => {
    const updated: Node = {
      ...node,
      metadata: {
        ...node.metadata,
        lastVisited: new Date(),
        visitCount: node.metadata.visitCount + 1,
      },
    }
    if (window.electronAPI) {
      await window.electronAPI.db.updateNode(updated)
      updateNode(updated)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editForm.label || ''}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  placeholder="节点名称"
                />
                <Select
                  value={editForm.type}
                  onValueChange={(v) => setEditForm({ ...editForm, type: v as Node['type'] })}
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
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{nodeTypeLabels[node.type]}</Badge>
                  <CardTitle className="text-lg">{node.label}</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  更新于 {formatRelativeTime(node.updatedAt)}
                </CardDescription>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                编辑
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedNodeId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="描述..."
              rows={3}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">重要性</label>
              <Slider
                value={[editForm.metadata?.importance || 0.5]}
                onValueChange={([v]) =>
                  setEditForm({
                    ...editForm,
                    metadata: { ...editForm.metadata, importance: v } as Node['metadata'],
                  })
                }
                max={1}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">能量水平</label>
              <Slider
                value={[editForm.metadata?.energyLevel || 0.5]}
                onValueChange={([v]) =>
                  setEditForm({
                    ...editForm,
                    metadata: { ...editForm.metadata, energyLevel: v } as Node['metadata'],
                  })
                }
                max={1}
                step={0.1}
              />
            </div>
          </div>
        ) : (
          <>
            {node.description && (
              <p className="text-sm text-muted-foreground">{node.description}</p>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="重要性"
                value={node.metadata.importance}
                icon={<Zap className="h-3 w-3" />}
              />
              <MetricCard
                label="能量"
                value={node.metadata.energyLevel}
                icon={<Activity className="h-3 w-3" />}
              />
              <MetricCard
                label="稳定性"
                value={node.metadata.stability}
              />
              <MetricCard
                label="混沌亲和力"
                value={node.metadata.chaosAffinity}
              />
            </div>

            {/* Tags */}
            {node.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {node.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Visit Info */}
            <div className="text-xs text-muted-foreground">
              <p>访问次数: {node.metadata.visitCount}</p>
              {node.metadata.lastVisited && (
                <p>上次访问: {formatRelativeTime(node.metadata.lastVisited)}</p>
              )}
            </div>

            {/* Connected Nodes */}
            {connectedNodes.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">连接节点</h4>
                <div className="space-y-1">
                  {connectedNodes.slice(0, 5).map((n) => (
                    <div
                      key={n!.id}
                      className="cursor-pointer rounded bg-muted px-2 py-1 text-sm hover:bg-accent"
                    >
                      {n!.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleVisit} className="flex-1">
                <Activity className="mr-1 h-4 w-4" />
                访问节点
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border p-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs font-medium">{Math.round(value * 100)}%</p>
    </div>
  )
}
