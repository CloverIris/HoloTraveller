import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { calculateChaosMetrics, determineCognitivePhase, generateNavigationSuggestion } from '@/core/chaos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Compass, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react'
import type { CognitivePhase } from '@/types'

const phaseLabels: Record<CognitivePhase, { label: string; color: string; icon: React.ReactNode }> = {
  rigid_order: { 
    label: '过于有序', 
    color: 'bg-blue-500',
    icon: <CheckCircle className="h-4 w-4" />
  },
  edge_of_chaos: { 
    label: '混沌边缘', 
    color: 'bg-green-500',
    icon: <Zap className="h-4 w-4" />
  },
  disordered_chaos: { 
    label: '过于混乱', 
    color: 'bg-red-500',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  transition: { 
    label: '过渡期', 
    color: 'bg-yellow-500',
    icon: <RefreshCw className="h-4 w-4" />
  },
}

export function ChaosNavigator() {
  const { nodes, edges, navigationState, setNavigationState } = useAppStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeState = () => {
    setIsAnalyzing(true)
    
    // Calculate metrics
    const metrics = calculateChaosMetrics(nodes, edges)
    const phase = determineCognitivePhase(metrics)
    const navigation = generateNavigationSuggestion(phase, metrics, nodes, edges)
    
    setNavigationState(navigation)
    setIsAnalyzing(false)
  }

  useEffect(() => {
    if (nodes.length > 0 && !navigationState) {
      analyzeState()
    }
  }, [nodes.length])

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            混沌边缘导航
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            添加一些节点后开始导航分析
          </p>
        </CardContent>
      </Card>
    )
  }

  const phase = navigationState?.currentPhase
  const phaseInfo = phase ? phaseLabels[phase] : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            混沌边缘导航
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={analyzeState}
            disabled={isAnalyzing}
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          基于复杂系统理论的认知相态分析
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {phaseInfo && (
          <div className="flex items-center gap-3">
            <Badge className={`${phaseInfo.color} text-white`}>
              {phaseInfo.icon}
              <span className="ml-1">{phaseInfo.label}</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              湍流级别: {Math.round((navigationState?.turbulenceLevel || 0) * 100)}%
            </span>
          </div>
        )}

        {navigationState?.creativeZoneProximity !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>距离创造性湍流区</span>
              <span>{Math.round(navigationState.creativeZoneProximity * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${navigationState.creativeZoneProximity * 100}%` }}
              />
            </div>
          </div>
        )}

        {navigationState?.recommendedAction && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">推荐行动</h4>
            <p className="mb-2 text-sm">{navigationState.recommendedAction.description}</p>
            <p className="text-xs text-muted-foreground">
              预期结果: {navigationState.recommendedAction.expectedOutcome}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">
                不确定性: {Math.round(navigationState.recommendedAction.uncertaintyLevel * 100)}%
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
