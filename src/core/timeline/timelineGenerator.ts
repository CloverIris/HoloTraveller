/**
 * 时间线生成器
 * 记录和展示探索历史
 */

import type { Node, Edge, Thread, CognitiveFramework, ControlledShock } from '@/types'

export type TimelineEventType = 
  | 'node_created'
  | 'node_updated'
  | 'node_visited'
  | 'edge_created'
  | 'edge_deleted'
  | 'thread_created'
  | 'thread_updated'
  | 'thread_phase_transition'
  | 'framework_created'
  | 'framework_expired'
  | 'shock_completed'
  | 'trajectory_reconstructed'
  | 'milestone'

export interface TimelineEvent {
  id: string
  timestamp: Date
  type: TimelineEventType
  title: string
  description: string
  entityId: string
  entityType: 'node' | 'edge' | 'thread' | 'framework' | 'shock' | 'trajectory'
  metadata?: Record<string, any>
}

export interface ActivityDay {
  date: string
  count: number
  events: TimelineEvent[]
}

export interface NetworkSnapshot {
  id: string
  timestamp: Date
  label: string
  nodeCount: number
  edgeCount: number
  metrics: {
    orderDegree: number
    chaosDegree: number
    connectivity: number
  }
}

/**
 * 从数据生成时间线事件
 */
export function generateTimeline(
  nodes: Node[],
  edges: Edge[],
  threads: Thread[],
  frameworks: CognitiveFramework[],
  shocks?: ControlledShock[]
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // 节点事件
  for (const node of nodes) {
    events.push({
      id: `node-created-${node.id}`,
      timestamp: node.createdAt,
      type: 'node_created',
      title: `创建节点: ${node.label}`,
      description: `类型: ${node.type}`,
      entityId: node.id,
      entityType: 'node',
      metadata: { type: node.type, tags: node.tags },
    })

    // 访问事件
    if (node.metadata.lastVisited) {
      events.push({
        id: `node-visited-${node.id}-${node.metadata.lastVisited.getTime()}`,
        timestamp: node.metadata.lastVisited,
        type: 'node_visited',
        title: `访问节点: ${node.label}`,
        description: `访问次数: ${node.metadata.visitCount}`,
        entityId: node.id,
        entityType: 'node',
        metadata: { visitCount: node.metadata.visitCount },
      })
    }

    // 更新事件（如果更新时间不等于创建时间）
    if (node.updatedAt.getTime() !== node.createdAt.getTime()) {
      events.push({
        id: `node-updated-${node.id}`,
        timestamp: node.updatedAt,
        type: 'node_updated',
        title: `更新节点: ${node.label}`,
        description: '节点属性已更新',
        entityId: node.id,
        entityType: 'node',
      })
    }
  }

  // 边事件
  for (const edge of edges) {
    events.push({
      id: `edge-created-${edge.id}`,
      timestamp: edge.createdAt,
      type: 'edge_created',
      title: '创建连接',
      description: `类型: ${edge.type}`,
      entityId: edge.id,
      entityType: 'edge',
      metadata: { type: edge.type, strength: edge.strength },
    })
  }

  // 线程事件
  for (const thread of threads) {
    events.push({
      id: `thread-created-${thread.id}`,
      timestamp: thread.createdAt,
      type: 'thread_created',
      title: `创建线程: ${thread.name}`,
      description: `类型: ${thread.type}`,
      entityId: thread.id,
      entityType: 'thread',
      metadata: { type: thread.type },
    })

    // 相变信号事件
    for (const signal of thread.phaseTransitionSignals) {
      events.push({
        id: `phase-transition-${thread.id}-${signal.timestamp.getTime()}`,
        timestamp: signal.timestamp,
        type: 'thread_phase_transition',
        title: `相变信号: ${thread.name}`,
        description: signal.description,
        entityId: thread.id,
        entityType: 'thread',
        metadata: { 
          signalType: signal.type,
          intensity: signal.intensity,
        },
      })
    }
  }

  // 框架事件
  for (const framework of frameworks) {
    events.push({
      id: `framework-created-${framework.id}`,
      timestamp: framework.createdAt,
      type: 'framework_created',
      title: `创建框架: ${framework.title}`,
      description: framework.context.coreConflict || '临时意义结构',
      entityId: framework.id,
      entityType: 'framework',
      metadata: { halfLife: framework.halfLife },
    })

    // 过期事件
    if (framework.status === 'expired') {
      events.push({
        id: `framework-expired-${framework.id}`,
        timestamp: framework.expiresAt,
        type: 'framework_expired',
        title: `框架过期: ${framework.title}`,
        description: '临时意义结构已过期',
        entityId: framework.id,
        entityType: 'framework',
      })
    }
  }

  // 冲击事件
  if (shocks) {
    for (const shock of shocks) {
      events.push({
        id: `shock-${shock.id}`,
        timestamp: shock.timestamp,
        type: 'shock_completed',
        title: '完成反脆弱训练',
        description: shock.description,
        entityId: shock.id,
        entityType: 'shock',
        metadata: {
          type: shock.type,
          intensity: shock.intensity,
          adaptationScore: shock.result?.adaptationScore,
        },
      })
    }
  }

  // 按时间排序
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * 生成活动热力图数据
 */
export function generateActivityHeatmap(
  events: TimelineEvent[],
  days: number = 365
): ActivityDay[] {
  const activityMap = new Map<string, ActivityDay>()
  const today = new Date()
  
  // 初始化日期范围
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    activityMap.set(dateStr, {
      date: dateStr,
      count: 0,
      events: [],
    })
  }

  // 统计事件
  for (const event of events) {
    const dateStr = event.timestamp.toISOString().split('T')[0]
    const day = activityMap.get(dateStr)
    if (day) {
      day.count++
      day.events.push(event)
    }
  }

  return Array.from(activityMap.values()).sort((a, b) => 
    a.date.localeCompare(b.date)
  )
}

/**
 * 获取指定时间段的事件
 */
export function getEventsInRange(
  events: TimelineEvent[],
  start: Date,
  end: Date
): TimelineEvent[] {
  return events.filter(event => 
    event.timestamp >= start && event.timestamp <= end
  )
}

/**
 * 按类型分组事件
 */
export function groupEventsByType(
  events: TimelineEvent[]
): Map<TimelineEventType, TimelineEvent[]> {
  const groups = new Map<TimelineEventType, TimelineEvent[]>()
  
  for (const event of events) {
    if (!groups.has(event.type)) {
      groups.set(event.type, [])
    }
    groups.get(event.type)!.push(event)
  }
  
  return groups
}

/**
 * 生成统计摘要
 */
export function generateTimelineSummary(
  events: TimelineEvent[]
): {
  totalEvents: number
  byType: Record<string, number>
  mostActiveDay: string | null
  streakDays: number
} {
  const byType: Record<string, number> = {}
  const activityByDay = new Map<string, number>()
  
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1
    
    const dateStr = event.timestamp.toISOString().split('T')[0]
    activityByDay.set(dateStr, (activityByDay.get(dateStr) || 0) + 1)
  }

  // 找到最活跃的一天
  let mostActiveDay: string | null = null
  let maxCount = 0
  for (const [date, count] of activityByDay) {
    if (count > maxCount) {
      maxCount = count
      mostActiveDay = date
    }
  }

  // 计算连续活跃天数
  const sortedDays = [...activityByDay.keys()].sort()
  let streakDays = 0
  let currentStreak = 0
  let lastDate: Date | null = null
  
  for (const dayStr of sortedDays) {
    const date = new Date(dayStr)
    if (lastDate) {
      const diffDays = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays === 1) {
        currentStreak++
        streakDays = Math.max(streakDays, currentStreak)
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }
    lastDate = date
  }

  return {
    totalEvents: events.length,
    byType,
    mostActiveDay,
    streakDays,
  }
}

/**
 * 快照管理
 */
export class SnapshotManager {
  private snapshots: NetworkSnapshot[] = []

  /**
   * 创建快照
   */
  createSnapshot(
    label: string,
    nodes: Node[],
    edges: Edge[],
    metrics: { orderDegree: number; chaosDegree: number; connectivity: number }
  ): NetworkSnapshot {
    const snapshot: NetworkSnapshot = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      label,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      metrics,
    }
    
    this.snapshots.push(snapshot)
    return snapshot
  }

  /**
   * 获取所有快照
   */
  getSnapshots(): NetworkSnapshot[] {
    return [...this.snapshots].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    )
  }

  /**
   * 删除快照
   */
  deleteSnapshot(id: string) {
    this.snapshots = this.snapshots.filter(s => s.id !== id)
  }

  /**
   * 导出快照为 JSON
   */
  exportSnapshot(id: string): string | null {
    const snapshot = this.snapshots.find(s => s.id === id)
    return snapshot ? JSON.stringify(snapshot, null, 2) : null
  }
}

export const snapshotManager = new SnapshotManager()
