import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { generateControlledShock, getShockRecommendation, calculateElasticityScore, generateShockReport } from '@/core/antifragile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Zap, TrendingUp, Activity, Shield, AlertTriangle } from 'lucide-react'
import type { ShockType } from '@/types'

const shockTypeLabels: Record<ShockType, string> = {
  random_jump: '随机跳转',
  timeline_shuffle: '时间线打乱',
  perspective_flip: '视角翻转',
  constraint_add: '添加约束',
  resource_limit: '资源限制',
}

export function AntifragilityPanel() {
  const { nodes, antifragilityProfile, setAntifragilityProfile } = useAppStore()
  const [isShockDialogOpen, setIsShockDialogOpen] = useState(false)
  const [currentShock, setCurrentShock] = useState<{
    type: ShockType
    description: string
    targetNode?: { id: string; label: string }
  } | null>(null)
  const [discomfortLevel, setDiscomfortLevel] = useState([5])
  const [insights, setInsights] = useState('')

  const elasticityScore = antifragilityProfile ? calculateElasticityScore(antifragilityProfile) : 0.5
  const shockReport = antifragilityProfile ? generateShockReport(antifragilityProfile) : null
  const recommendation = antifragilityProfile ? getShockRecommendation(antifragilityProfile, nodes, []) : null

  const handleGenerateShock = () => {
    if (!antifragilityProfile) return

    const { shock, targetNode } = generateControlledShock(antifragilityProfile, nodes)
    setCurrentShock({
      type: shock.type as ShockType,
      description: shock.description || '',
      targetNode: targetNode ? { id: targetNode.id, label: targetNode.label } : undefined,
    })
    setIsShockDialogOpen(true)
  }

  const handleCompleteShock = async () => {
    if (!currentShock || !antifragilityProfile) return

    const shockData = {
      type: currentShock.type,
      intensity: discomfortLevel[0] / 10,
      description: currentShock.description,
      targetNodeId: currentShock.targetNode?.id,
      result: {
        discomfortLevel: discomfortLevel[0] / 10,
        insights: insights.split('\n').filter(Boolean),
        newConnections: [],
        adaptationScore: 0,
      },
    }

    if (window.electronAPI) {
      await window.electronAPI.db.createShock(shockData)
      const updatedProfile = await window.electronAPI.db.getAntifragilityProfile()
      if (updatedProfile) {
        setAntifragilityProfile(updatedProfile)
      }
    }

    setIsShockDialogOpen(false)
    setCurrentShock(null)
    setDiscomfortLevel([5])
    setInsights('')
  }

  const getElasticityLabel = (score: number) => {
    if (score < 0.3) return { label: '低弹性', color: 'text-red-500' }
    if (score < 0.6) return { label: '中等弹性', color: 'text-yellow-500' }
    return { label: '高弹性', color: 'text-green-500' }
  }

  const elasticityInfo = getElasticityLabel(elasticityScore)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                反脆弱性训练
              </CardTitle>
              <CardDescription>
                通过可控冲击提升认知弹性
              </CardDescription>
            </div>
            <Button onClick={handleGenerateShock} size="sm">
              <Zap className="mr-1 h-4 w-4" />
              引入冲击
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Elasticity Score */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">认知弹性系数</span>
              <span className={`text-lg font-bold ${elasticityInfo.color}`}>
                {Math.round(elasticityScore * 100)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {elasticityInfo.label} - {elasticityScore < 0.3 
                ? '建议从温和冲击开始训练' 
                : elasticityScore < 0.6 
                ? '继续训练以提升弹性' 
                : '保持良好的反脆弱状态'}
            </p>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  elasticityScore < 0.3 ? 'bg-red-500' : elasticityScore < 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${elasticityScore * 100}%` }}
              />
            </div>
          </div>

          {/* Recommendation */}
          {recommendation && (
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">推荐训练</span>
              </div>
              <p className="mt-1 text-sm">{shockTypeLabels[recommendation.type]}</p>
              <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
            </div>
          )}

          {/* Stats */}
          {shockReport && shockReport.totalShocks > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <Activity className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="mt-1 text-2xl font-bold">{shockReport.totalShocks}</p>
                <p className="text-xs text-muted-foreground">总冲击次数</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <TrendingUp className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="mt-1 text-2xl font-bold">
                  {Math.round(shockReport.averageAdaptation * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">平均适应分数</p>
              </div>
            </div>
          )}

          {/* Recent Insights */}
          {shockReport && shockReport.insights.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium">近期洞察</h4>
              <div className="space-y-2">
                {shockReport.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shock Dialog */}
      <Dialog open={isShockDialogOpen} onOpenChange={setIsShockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              可控冲击
            </DialogTitle>
            <DialogDescription>
              完成这个挑战来提升你的认知弹性
            </DialogDescription>
          </DialogHeader>
          {currentShock && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <Badge className="mb-2">{shockTypeLabels[currentShock.type]}</Badge>
                <p className="text-sm">{currentShock.description}</p>
                {currentShock.targetNode && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    目标节点: {currentShock.targetNode.label}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  不适程度: {discomfortLevel[0]}/10
                </label>
                <Slider
                  value={discomfortLevel}
                  onValueChange={setDiscomfortLevel}
                  max={10}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">产生的洞察（可选）</label>
                <textarea
                  value={insights}
                  onChange={(e) => setInsights(e.target.value)}
                  placeholder="记录这次冲击带给你的新想法..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShockDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCompleteShock}>完成冲击</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
