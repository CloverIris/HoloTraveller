import type { Thread, Node, Edge, PhaseTransitionSignal } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * 多稳态并行探索管理
 * 支持同时维护 3-5 条并行探索线程
 */

export const MAX_PARALLEL_THREADS = 5
export const MIN_PARALLEL_THREADS = 1

export interface ThreadMetrics {
  threadId: string
  activityScore: number      // 活跃度 0-1
  coherenceScore: number     // 连贯性 0-1
  emergenceScore: number     // 涌现潜力 0-1
  stagnationRisk: number     // 停滞风险 0-1
}

/**
 * 检查是否可以创建新线程
 */
export function canCreateThread(threads: Thread[]): { allowed: boolean; reason?: string } {
  const activeThreads = threads.filter(t => t.status === 'active')
  
  if (activeThreads.length >= MAX_PARALLEL_THREADS) {
    return { 
      allowed: false, 
      reason: `已达到最大并行线程数 (${MAX_PARALLEL_THREADS})，请先归档或休眠部分线程` 
    }
  }
  
  return { allowed: true }
}

/**
 * 创建新线程
 */
export function createThread(
  name: string,
  description: string | undefined,
  type: Thread['type'],
  priority: number = 0.5
): Partial<Thread> {
  const now = new Date()
  
  return {
    id: uuidv4(),
    name,
    description,
    type,
    status: 'active',
    priority: Math.max(0, Math.min(1, priority)),
    emergencePotential: 0.5, // 初始潜力
    nodeIds: [],
    trajectoryIds: [],
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
    phaseTransitionSignals: [],
  }
}

/**
 * 计算线程指标
 */
export function calculateThreadMetrics(
  thread: Thread,
  nodes: Node[],
  edges: Edge[]
): ThreadMetrics {
  // 活跃度：基于最近活跃时间和更新频率
  const now = new Date().getTime()
  const lastActive = new Date(thread.lastActiveAt).getTime()
  const daysSinceActive = (now - lastActive) / (1000 * 60 * 60 * 24)
  const activityScore = Math.max(0, 1 - daysSinceActive / 7) // 一周内活跃为满分

  // 连贯性：基于节点间的连接密度
  const threadNodes = nodes.filter(n => thread.nodeIds.includes(n.id))
  const threadEdges = edges.filter(e => 
    thread.nodeIds.includes(e.source) && thread.nodeIds.includes(e.target)
  )
  
  let coherenceScore = 0
  if (threadNodes.length > 1) {
    const maxEdges = (threadNodes.length * (threadNodes.length - 1)) / 2
    coherenceScore = maxEdges > 0 ? threadEdges.length / maxEdges : 0
  }

  // 涌现潜力：基于节点能量和多样性
  let emergenceScore = thread.emergencePotential
  if (threadNodes.length > 0) {
    const avgEnergy = threadNodes.reduce((sum, n) => sum + n.metadata.energyLevel, 0) / threadNodes.length
    const nodeTypes = new Set(threadNodes.map(n => n.type)).size
    const typeDiversity = nodeTypes / 6 // 假设6种类型
    emergenceScore = (emergenceScore + avgEnergy + typeDiversity) / 3
  }

  // 停滞风险：低活跃度 + 低涌现潜力
  const stagnationRisk = (1 - activityScore) * 0.5 + (1 - emergenceScore) * 0.5

  return {
    threadId: thread.id,
    activityScore,
    coherenceScore,
    emergenceScore,
    stagnationRisk,
  }
}

// 信号冷却期配置（毫秒）
const SIGNAL_COOLDOWN = 24 * 60 * 60 * 1000 // 24小时内同一类型不重复触发
const MAX_SIGNALS = 20 // 最大保留信号数

/**
 * 检测相变信号并自动存储到线程
 */
export function detectPhaseTransition(
  thread: Thread,
  nodes: Node[],
  edges: Edge[]
): { signal: PhaseTransitionSignal | null; updatedThread: Thread } {
  const metrics = calculateThreadMetrics(thread, nodes, edges)
  let signal: PhaseTransitionSignal | null = null
  
  // 检查信号冷却期
  const now = Date.now()
  const isInCooldown = (type: string) => {
    const recentSignal = thread.phaseTransitionSignals
      .filter(s => s.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    if (!recentSignal) return false
    return now - new Date(recentSignal.timestamp).getTime() < SIGNAL_COOLDOWN
  }
  
  // 1. 连接爆发：短时间内新增大量连接
  if (!isInCooldown('connection_burst')) {
    const recentEdges = edges.filter(e => {
      if (!thread.nodeIds.includes(e.source) && !thread.nodeIds.includes(e.target)) return false
      const edgeDate = new Date(e.createdAt)
      const daysSinceCreated = (now - edgeDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceCreated < 3 // 3天内
    })
    
    if (recentEdges.length >= 3) {
      signal = {
        timestamp: new Date(),
        type: 'connection_burst',
        intensity: Math.min(1, recentEdges.length / 5),
        description: `检测到连接爆发：${recentEdges.length} 个新连接在 3 天内形成`,
      }
    }
  }

  // 2. 洞察火花：高能量节点出现（基于实际能量变化，不使用随机）
  if (!signal && !isInCooldown('insight_spark')) {
    const highEnergyNodes = nodes.filter(n => 
      thread.nodeIds.includes(n.id) && n.metadata.energyLevel > 0.8
    )
    // 检查是否是新出现的高能量节点（24小时内）
    const newHighEnergyNodes = highEnergyNodes.filter(n => {
      const recentSignal = thread.phaseTransitionSignals
        .filter(s => s.type === 'insight_spark' && s.description.includes(n.label))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      return !recentSignal || now - new Date(recentSignal.timestamp).getTime() >= SIGNAL_COOLDOWN
    })
    
    if (newHighEnergyNodes.length > 0) {
      signal = {
        timestamp: new Date(),
        type: 'insight_spark',
        intensity: newHighEnergyNodes[0].metadata.energyLevel,
        description: `洞察火花：节点「${newHighEnergyNodes[0].label}」能量激增`,
      }
    }
  }

  // 3. 能量转移：线程整体能量变化显著
  if (!signal && !isInCooldown('energy_shift')) {
    if (metrics.emergenceScore > 0.8 && thread.emergencePotential < 0.6) {
      signal = {
        timestamp: new Date(),
        type: 'energy_shift',
        intensity: metrics.emergenceScore,
        description: '能量显著转移：线程涌现潜力大幅提升',
      }
    }
  }

  // 4. 模式识别：发现新的节点类型组合（基于类型数量变化）
  if (!signal && !isInCooldown('pattern_recognition')) {
    const nodeTypes = new Set(thread.nodeIds.map(id => 
      nodes.find(n => n.id === id)?.type
    ).filter(Boolean))
    
    // 检查类型多样性是否达到新高度
    const prevTypeCount = thread.phaseTransitionSignals
      .filter(s => s.type === 'pattern_recognition')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    const prevCount = prevTypeCount ? Math.round(prevTypeCount.intensity * 6) : 0
    
    if (nodeTypes.size >= 4 && nodeTypes.size > prevCount) {
      signal = {
        timestamp: new Date(),
        type: 'pattern_recognition',
        intensity: nodeTypes.size / 6,
        description: `模式识别：发现 ${nodeTypes.size} 种节点类型的复杂交互`,
      }
    }
  }

  // 更新线程的信号列表
  let updatedThread = thread
  if (signal) {
    const newSignals = [signal, ...thread.phaseTransitionSignals].slice(0, MAX_SIGNALS)
    updatedThread = {
      ...thread,
      phaseTransitionSignals: newSignals,
      emergencePotential: signal.type === 'energy_shift' ? signal.intensity : thread.emergencePotential,
      updatedAt: new Date(),
    }
  }

  return { signal, updatedThread }
}

/**
 * 调整线程优先级建议
 */
export function suggestPriorityAdjustment(
  thread: Thread,
  _allThreads: Thread[],
  nodes: Node[],
  edges: Edge[]
): { newPriority: number; reason: string } | null {
  const metrics = calculateThreadMetrics(thread, nodes, edges)
  const currentPriority = thread.priority

  // 如果涌现潜力高但优先级低，建议提升
  if (metrics.emergenceScore > 0.7 && currentPriority < 0.6) {
    return {
      newPriority: Math.min(1, currentPriority + 0.2),
      reason: '该线程涌现潜力高，建议增加资源投入',
    }
  }

  // 如果停滞风险高且活跃度低，建议降低优先级或休眠
  if (metrics.stagnationRisk > 0.8 && metrics.activityScore < 0.3) {
    return {
      newPriority: Math.max(0, currentPriority - 0.2),
      reason: '该线程停滞风险高，建议减少资源投入或考虑休眠',
    }
  }

  // 如果活跃度极高且涌现潜力高，建议进一步提升
  if (metrics.activityScore > 0.8 && metrics.emergenceScore > 0.6 && currentPriority < 0.8) {
    return {
      newPriority: Math.min(1, currentPriority + 0.1),
      reason: '该线程表现活跃且潜力良好',
    }
  }

  return null
}

/**
 * 获取线程资源分配建议
 */
export function getResourceAllocationAdvice(
  threads: Thread[],
  nodes: Node[],
  edges: Edge[]
): Array<{ threadId: string; allocation: number; reason: string }> {
  const metrics = threads.map(t => ({
    thread: t,
    metrics: calculateThreadMetrics(t, nodes, edges),
  }))

  // 按涌现潜力和活跃度排序
  const sorted = metrics.sort((a, b) => {
    const scoreA = a.metrics.emergenceScore * 0.6 + a.metrics.activityScore * 0.4
    const scoreB = b.metrics.emergenceScore * 0.6 + b.metrics.activityScore * 0.4
    return scoreB - scoreA
  })

  // 计算分配比例
  const totalScore = sorted.reduce((sum, m) => 
    sum + m.metrics.emergenceScore * 0.6 + m.metrics.activityScore * 0.4, 0
  )

  return sorted.map(({ thread, metrics }) => {
    const score = metrics.emergenceScore * 0.6 + metrics.activityScore * 0.4
    const allocation = totalScore > 0 ? score / totalScore : 1 / sorted.length
    
    let reason = ''
    if (metrics.emergenceScore > 0.7) {
      reason = '高涌现潜力'
    } else if (metrics.activityScore > 0.7) {
      reason = '活跃度高'
    } else if (metrics.stagnationRisk > 0.6) {
      reason = '需要关注停滞风险'
    } else {
      reason = '常规维护'
    }

    return { threadId: thread.id, allocation, reason }
  })
}

/**
 * 休眠低活跃线程
 */
export function hibernateInactiveThreads(
  threads: Thread[],
  daysThreshold: number = 14
): Thread[] {
  const now = new Date().getTime()
  
  return threads.map(thread => {
    if (thread.status !== 'active') return thread
    
    const lastActive = new Date(thread.lastActiveAt).getTime()
    const daysInactive = (now - lastActive) / (1000 * 60 * 60 * 24)
    
    if (daysInactive > daysThreshold) {
      return {
        ...thread,
        status: 'hibernating',
        updatedAt: new Date(),
      }
    }
    
    return thread
  })
}

/**
 * 唤醒休眠线程
 */
export function activateThread(thread: Thread): Thread {
  return {
    ...thread,
    status: 'active',
    lastActiveAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * 合并线程
 * 当两个线程出现强关联时，可以考虑合并
 */
export function canMergeThreads(
  threadA: Thread,
  threadB: Thread,
  edges: Edge[]
): { canMerge: boolean; sharedConnections: number; reason: string } {
  // 检查两个线程间的连接数
  const crossEdges = edges.filter(e => 
    (threadA.nodeIds.includes(e.source) && threadB.nodeIds.includes(e.target)) ||
    (threadB.nodeIds.includes(e.source) && threadA.nodeIds.includes(e.target))
  )

  const sharedNodes = threadA.nodeIds.filter(id => threadB.nodeIds.includes(id))
  const totalShared = crossEdges.length + sharedNodes.length

  if (totalShared >= 3) {
    return {
      canMerge: true,
      sharedConnections: totalShared,
      reason: `两个线程有 ${totalShared} 个共享连接，建议考虑合并`,
    }
  }

  return {
    canMerge: false,
    sharedConnections: totalShared,
    reason: '共享连接不足',
  }
}
