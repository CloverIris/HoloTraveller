import type { 
  Node, 
  Edge, 
  ControlledShock, 
  ShockType, 
  Adaptation,
  AntifragilityProfile 
} from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * 反脆弱性训练系统
 * 引入可控的微小冲击，记录恢复与成长曲线
 */

export interface ShockConfig {
  type: ShockType
  intensity: number      // 0-1
  description: string
  targetCriteria?: (node: Node) => boolean
}

// 预定义的冲击配置
export const SHOCK_TEMPLATES: ShockConfig[] = [
  {
    type: 'random_jump',
    intensity: 0.3,
    description: '强制跳转到网络中一个随机节点，打破当前思维定势',
  },
  {
    type: 'timeline_shuffle',
    intensity: 0.4,
    description: '打乱时间线视角，用非线性的方式回顾最近的探索',
  },
  {
    type: 'perspective_flip',
    intensity: 0.5,
    description: '翻转视角：将当前关注的核心概念替换为其对立面',
  },
  {
    type: 'constraint_add',
    intensity: 0.4,
    description: '添加一个临时约束（如：只能用3个词描述当前想法）',
  },
  {
    type: 'resource_limit',
    intensity: 0.3,
    description: '限制资源：在接下来的探索中只能关注一个线程',
  },
]

/**
 * 生成可控冲击
 */
export function generateControlledShock(
  profile: AntifragilityProfile,
  nodes: Node[],
  options: { preferredType?: ShockType; customIntensity?: number } = {}
): { shock: Partial<ControlledShock>; targetNode?: Node } {
  // 根据当前弹性分数调整冲击强度
  const baseIntensity = options.customIntensity || 0.4
  const adjustedIntensity = Math.min(1, baseIntensity + (1 - profile.elasticityScore) * 0.3)

  // 选择冲击类型
  let shockType: ShockType
  if (options.preferredType) {
    shockType = options.preferredType
  } else {
    shockType = SHOCK_TEMPLATES[Math.floor(Math.random() * SHOCK_TEMPLATES.length)].type
  }

  const template = SHOCK_TEMPLATES.find(t => t.type === shockType) || SHOCK_TEMPLATES[0]

  // 选择目标节点（如适用）
  let targetNode: Node | undefined
  if (shockType === 'random_jump') {
    const eligibleNodes = nodes.filter(n => n.metadata.energyLevel > 0.2)
    targetNode = eligibleNodes[Math.floor(Math.random() * eligibleNodes.length)]
  }

  const shock: Partial<ControlledShock> = {
    id: uuidv4(),
    type: shockType,
    intensity: adjustedIntensity,
    timestamp: new Date(),
    targetNodeId: targetNode?.id,
    description: template.description,
    result: {
      discomfortLevel: 0,
      insights: [],
      newConnections: [],
      adaptationScore: 0,
    },
  }

  return { shock, targetNode }
}

/**
 * 记录冲击结果
 */
export function recordShockResult(
  shock: Partial<ControlledShock>,
  discomfortLevel: number,
  insights: string[],
  newConnections: string[]
): ControlledShock {
  // 计算适应分数
  // 高不适但产生洞察 = 高适应（反脆弱）
  // 低不适 = 低适应（可能过于舒适）
  const adaptationScore = calculateAdaptationScore(discomfortLevel, insights.length, newConnections.length)

  return {
    ...shock,
    result: {
      discomfortLevel: Math.max(0, Math.min(1, discomfortLevel)),
      insights,
      newConnections,
      adaptationScore,
    },
  } as ControlledShock
}

/**
 * 计算适应分数
 */
function calculateAdaptationScore(
  discomfortLevel: number,
  insightCount: number,
  newConnectionCount: number
): number {
  // 反脆弱公式：从冲击中成长
  // 适度的不适（0.4-0.7）+ 高产出 = 高适应
  const comfortScore = 1 - Math.abs(discomfortLevel - 0.55) * 2 // 最优不适点在0.55
  const productivityScore = Math.min(1, (insightCount + newConnectionCount) / 5)
  
  return comfortScore * 0.4 + productivityScore * 0.6
}

/**
 * 计算认知弹性系数
 */
export function calculateElasticityScore(profile: AntifragilityProfile): number {
  if (profile.shocks.length === 0) return 0.5

  const recentShocks = profile.shocks.slice(-10) // 最近10次冲击
  
  // 基于适应分数计算弹性
  const avgAdaptation = recentShocks.reduce((sum, s) => sum + (s.result?.adaptationScore || 0), 0) / recentShocks.length
  
  // 基于恢复曲线计算弹性
  const recoveryScores = profile.recoveryCurve.slice(-5).map(r => {
    const recoveryRate = (r.afterShock - r.baseline) / (r.recoveryTime + 1)
    const growthBonus = r.growth / (r.recoveryTime + 1)
    return Math.min(1, Math.max(0, recoveryRate + growthBonus))
  })
  
  const avgRecovery = recoveryScores.length > 0 
    ? recoveryScores.reduce((a, b) => a + b, 0) / recoveryScores.length 
    : 0.5

  // 综合计算
  return avgAdaptation * 0.6 + avgRecovery * 0.4
}

/**
 * 创建适应记录
 */
export function createAdaptation(
  shockId: string,
  type: string,
  description: string,
  strength: number
): Partial<Adaptation> {
  return {
    id: uuidv4(),
    triggerShockId: shockId,
    type,
    description,
    timestamp: new Date(),
    strength: Math.max(0, Math.min(1, strength)),
  }
}

/**
 * 记录恢复点
 */
export function recordRecovery(
  profile: AntifragilityProfile,
  _shockId: string,
  baseline: number,
  afterShock: number,
  recoveryTime: number, // 分钟
  growth: number
): AntifragilityProfile {
  return {
    ...profile,
    recoveryCurve: [
      ...profile.recoveryCurve,
      {
        timestamp: new Date(),
        baseline,
        afterShock,
        recoveryTime,
        growth,
      },
    ],
    updatedAt: new Date(),
  }
}

/**
 * 获取冲击建议
 */
export function getShockRecommendation(
  profile: AntifragilityProfile,
  _nodes: Node[],
  _edges: Edge[]
): { type: ShockType; reason: string; expectedIntensity: number } {
  const elasticity = profile.elasticityScore
  const recentShockTypes = new Set(profile.shocks.slice(-3).map(s => s.type))

  // 根据弹性选择冲击类型
  if (elasticity < 0.3) {
    // 低弹性：温和冲击
    const gentleShocks: ShockType[] = ['random_jump', 'resource_limit']
    const available = gentleShocks.filter(t => !recentShockTypes.has(t))
    const type = available.length > 0 ? available[0] : 'random_jump'
    return {
      type,
      reason: '当前认知弹性较低，建议从温和冲击开始训练',
      expectedIntensity: 0.3,
    }
  }

  if (elasticity < 0.6) {
    // 中等弹性：适度挑战
    const moderateShocks: ShockType[] = ['timeline_shuffle', 'constraint_add']
    const available = moderateShocks.filter(t => !recentShockTypes.has(t))
    const type = available.length > 0 ? available[0] : 'timeline_shuffle'
    return {
      type,
      reason: '认知弹性正在发展中，适度挑战有助于提升',
      expectedIntensity: 0.5,
    }
  }

  // 高弹性：强冲击
  const strongShocks: ShockType[] = ['perspective_flip', 'constraint_add']
  const available = strongShocks.filter(t => !recentShockTypes.has(t))
  const type = available.length > 0 ? available[0] : 'perspective_flip'
  return {
    type,
    reason: '认知弹性良好，可以承受更强的反脆弱训练',
    expectedIntensity: 0.7,
  }
}

/**
 * 分析成长曲线
 */
export function analyzeGrowthCurve(profile: AntifragilityProfile): {
  trend: 'improving' | 'stable' | 'declining'
  averageGrowth: number
  recommendation: string
} {
  if (profile.recoveryCurve.length < 3) {
    return {
      trend: 'stable',
      averageGrowth: 0,
      recommendation: '数据不足，继续记录更多恢复周期',
    }
  }

  const recentCurve = profile.recoveryCurve.slice(-5)
  const growthValues = recentCurve.map(r => r.growth)
  const avgGrowth = growthValues.reduce((a, b) => a + b, 0) / growthValues.length

  // 计算趋势
  const firstHalf = growthValues.slice(0, Math.floor(growthValues.length / 2))
  const secondHalf = growthValues.slice(Math.floor(growthValues.length / 2))
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  let trend: 'improving' | 'stable' | 'declining'
  if (secondAvg > firstAvg * 1.1) {
    trend = 'improving'
  } else if (secondAvg < firstAvg * 0.9) {
    trend = 'declining'
  } else {
    trend = 'stable'
  }

  let recommendation = ''
  if (trend === 'improving') {
    recommendation = '成长趋势良好，继续保持当前训练强度'
  } else if (trend === 'declining') {
    recommendation = '成长趋势下降，建议降低冲击强度，专注于质量而非数量'
  } else {
    recommendation = '成长稳定，可以尝试新的挑战类型打破平台期'
  }

  return { trend, averageGrowth: avgGrowth, recommendation }
}

/**
 * 生成冲击报告
 */
export function generateShockReport(profile: AntifragilityProfile): {
  totalShocks: number
  averageAdaptation: number
  mostEffectiveType: ShockType | null
  insights: string[]
} {
  if (profile.shocks.length === 0) {
    return {
      totalShocks: 0,
      averageAdaptation: 0,
      mostEffectiveType: null,
      insights: [],
    }
  }

  const totalShocks = profile.shocks.length
  const averageAdaptation = profile.shocks.reduce((sum, s) => 
    sum + (s.result?.adaptationScore || 0), 0
  ) / totalShocks

  // 找出最有效的冲击类型
  const typeEffectiveness = new Map<ShockType, number[]>()
  for (const shock of profile.shocks) {
    const scores = typeEffectiveness.get(shock.type) || []
    scores.push(shock.result?.adaptationScore || 0)
    typeEffectiveness.set(shock.type, scores)
  }

  let mostEffectiveType: ShockType | null = null
  let maxEffectiveness = 0
  
  for (const [type, scores] of typeEffectiveness) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avg > maxEffectiveness) {
      maxEffectiveness = avg
      mostEffectiveType = type
    }
  }

  // 收集所有洞察
  const insights = profile.shocks
    .flatMap(s => s.result?.insights || [])
    .filter((v, i, a) => a.indexOf(v) === i) // 去重

  return { totalShocks, averageAdaptation, mostEffectiveType, insights }
}
