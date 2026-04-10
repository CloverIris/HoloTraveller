import type { Node, Edge, Trajectory, PathSegment, FluctuationRange } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * 涨落适应性路径规划
 * 生成多条概率化轨迹，支持轨迹重构
 */

export interface PathOption {
  nodes: string[]
  probability: number
  expectedValue: number
  fluctuationRange: FluctuationRange
  description: string
}

/**
 * 生成多条概率化轨迹选项
 */
export function generateProbabilisticPaths(
  startNodeId: string,
  endNodeId: string | null,
  nodes: Node[],
  edges: Edge[],
  options: { maxPaths?: number; maxSteps?: number } = {}
): PathOption[] {
  const { maxPaths = 3, maxSteps = 10 } = options
  
  const paths: PathOption[] = []
  const adjacencyMap = buildWeightedAdjacencyMap(nodes, edges)

  // 使用改进的DFS探索多条路径
  const visited = new Set<string>()
  const currentPath: string[] = [startNodeId]
  
  explorePaths(
    startNodeId,
    endNodeId,
    adjacencyMap,
    nodes,
    visited,
    currentPath,
    paths,
    maxPaths,
    maxSteps,
    0
  )

  // 为每条路径计算概率和涨落区间
  return paths.map(path => ({
    ...path,
    probability: calculatePathProbability(path.nodes, edges),
    fluctuationRange: calculateFluctuationRange(path.nodes, nodes),
  })).sort((a, b) => b.probability - a.probability)
}

/**
 * 递归探索路径
 */
function explorePaths(
  currentId: string,
  targetId: string | null,
  adjacencyMap: Map<string, Array<{ id: string; weight: number }>>,
  nodes: Node[],
  visited: Set<string>,
  currentPath: string[],
  paths: PathOption[],
  maxPaths: number,
  maxSteps: number,
  depth: number
): void {
  if (paths.length >= maxPaths) return
  if (depth >= maxSteps) return
  
  // 找到目标
  if (targetId && currentId === targetId) {
    paths.push({
      nodes: [...currentPath],
      probability: 0,
      expectedValue: calculateExpectedValue(currentPath, nodes),
      fluctuationRange: { min: 0, max: 1, expectedDeviation: 0.2 },
      description: generatePathDescription(currentPath, nodes),
    })
    return
  }

  // 探索式结束（无目标时达到一定深度）
  if (!targetId && depth >= maxSteps / 2 && Math.random() < 0.3) {
    paths.push({
      nodes: [...currentPath],
      probability: 0,
      expectedValue: calculateExpectedValue(currentPath, nodes),
      fluctuationRange: { min: 0, max: 1, expectedDeviation: 0.3 },
      description: generatePathDescription(currentPath, nodes),
    })
    return
  }

  const neighbors = adjacencyMap.get(currentId) || []
  
  // 按权重排序邻居
  const sortedNeighbors = [...neighbors].sort((a, b) => b.weight - a.weight)
  
  for (const neighbor of sortedNeighbors) {
    if (visited.has(neighbor.id)) continue
    
    visited.add(neighbor.id)
    currentPath.push(neighbor.id)
    
    explorePaths(
      neighbor.id,
      targetId,
      adjacencyMap,
      nodes,
      visited,
      currentPath,
      paths,
      maxPaths,
      maxSteps,
      depth + 1
    )
    
    currentPath.pop()
    visited.delete(neighbor.id)
  }
}

/**
 * 构建带权重的邻接表
 */
function buildWeightedAdjacencyMap(
  nodes: Node[],
  edges: Edge[]
): Map<string, Array<{ id: string; weight: number }>> {
  const map = new Map<string, Array<{ id: string; weight: number }>>()

  for (const edge of edges) {
    const weight = calculateEdgeWeight(edge, nodes)
    
    if (!map.has(edge.source)) map.set(edge.source, [])
    if (!map.has(edge.target)) map.set(edge.target, [])
    
    map.get(edge.source)!.push({ id: edge.target, weight })
    map.get(edge.target)!.push({ id: edge.source, weight })
  }

  return map
}

/**
 * 计算边的权重
 */
function calculateEdgeWeight(edge: Edge, nodes: Node[]): number {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)
  
  let weight = edge.strength

  // 能量高的节点更有吸引力
  if (sourceNode) weight *= (0.5 + sourceNode.metadata.energyLevel * 0.5)
  if (targetNode) weight *= (0.5 + targetNode.metadata.energyLevel * 0.5)

  // 基于边类型的调整
  const typeMultiplier: Record<string, number> = {
    association: 1.0,
    dependency: 0.8,
    sequence: 0.9,
    contrast: 1.2,  // 对比边更有探索价值
    emergence: 1.5, // 涌现边权重最高
  }
  weight *= typeMultiplier[edge.type] || 1.0

  return weight
}

/**
 * 计算路径概率
 */
function calculatePathProbability(nodeIds: string[], edges: Edge[]): number {
  let probability = 1.0

  for (let i = 0; i < nodeIds.length - 1; i++) {
    const edge = edges.find(e => 
      (e.source === nodeIds[i] && e.target === nodeIds[i + 1]) ||
      (e.source === nodeIds[i + 1] && e.target === nodeIds[i])
    )
    if (edge) {
      probability *= edge.strength
    } else {
      probability *= 0.1 // 无边连接时概率降低
    }
  }

  return probability
}

/**
 * 计算路径的期望值
 */
function calculateExpectedValue(nodeIds: string[], nodes: Node[]): number {
  let value = 0
  for (const nodeId of nodeIds) {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      value += node.metadata.importance * node.metadata.energyLevel
    }
  }
  return value / nodeIds.length
}

/**
 * 计算涨落区间
 */
function calculateFluctuationRange(nodeIds: string[], nodes: Node[]): FluctuationRange {
  const chaosAffinities = nodeIds
    .map(id => nodes.find(n => n.id === id)?.metadata.chaosAffinity || 0.5)
  
  const avgChaos = chaosAffinities.reduce((a, b) => a + b, 0) / chaosAffinities.length
  const variance = chaosAffinities.reduce((sum, c) => sum + Math.pow(c - avgChaos, 2), 0) / chaosAffinities.length

  return {
    min: Math.max(0, avgChaos - Math.sqrt(variance) * 2),
    max: Math.min(1, avgChaos + Math.sqrt(variance) * 2),
    expectedDeviation: Math.sqrt(variance),
  }
}

/**
 * 生成路径描述
 */
function generatePathDescription(nodeIds: string[], nodes: Node[]): string {
  const nodeNames = nodeIds
    .map(id => nodes.find(n => n.id === id)?.label)
    .filter(Boolean)
  
  if (nodeNames.length <= 3) {
    return `经由 ${nodeNames.join(' → ')}`
  }
  return `经由 ${nodeNames.slice(0, 2).join(' → ')} ... → ${nodeNames[nodeNames.length - 1]}`
}

/**
 * 轨迹重构
 * 当现实偏离预期时，吸收偏差为新的导航信息
 */
export function reconstructTrajectory(
  trajectory: Trajectory,
  deviation: number,
  currentNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Trajectory {
  // 记录偏差
  const newSegment: PathSegment = {
    fromNodeId: trajectory.nodes[trajectory.nodes.length - 1] || currentNodeId,
    toNodeId: currentNodeId,
    timestamp: new Date(),
    deviation,
    reconstructed: true,
  }

  // 检查偏差是否在可接受范围内
  const isWithinRange = deviation >= trajectory.expectedFluctuation.min && 
                        deviation <= trajectory.expectedFluctuation.max

  if (!isWithinRange) {
    // 偏差过大，需要重构路径
    const currentIndex = trajectory.nodes.indexOf(currentNodeId)
    let newNodes: string[]

    if (currentIndex >= 0) {
      // 如果当前节点在路径中，从该节点继续
      newNodes = trajectory.nodes.slice(0, currentIndex + 1)
    } else {
      // 否则添加新节点到路径
      newNodes = [...trajectory.nodes, currentNodeId]
    }

    // 生成新的备选路径
    const options = generateProbabilisticPaths(
      currentNodeId,
      null,
      nodes,
      edges,
      { maxPaths: 2, maxSteps: 5 }
    )

    if (options.length > 0) {
      const bestOption = options[0]
      newNodes = [...newNodes, ...bestOption.nodes.slice(1)]
    }

    return {
      ...trajectory,
      nodes: newNodes,
      actualPath: [...trajectory.actualPath, newSegment],
      status: 'reconstructed',
      updatedAt: new Date(),
    }
  }

  // 偏差在范围内，正常记录
  return {
    ...trajectory,
    actualPath: [...trajectory.actualPath, newSegment],
    updatedAt: new Date(),
  }
}

/**
 * 创建新轨迹
 */
export function createTrajectory(
  name: string,
  description: string | undefined,
  startNodeId: string,
  endNodeId: string | null,
  threadId: string,
  nodes: Node[],
  edges: Edge[]
): Partial<Trajectory> {
  const pathOptions = generateProbabilisticPaths(startNodeId, endNodeId, nodes, edges)
  
  if (pathOptions.length === 0) {
    throw new Error('无法生成有效路径')
  }

  const bestPath = pathOptions[0]

  return {
    id: uuidv4(),
    name,
    description,
    nodes: bestPath.nodes,
    expectedFluctuation: bestPath.fluctuationRange,
    actualPath: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    threadId,
  }
}

/**
 * 分析轨迹的涌现潜力
 * 基于路径上节点的能量变化和连接特性
 */
export function analyzeEmergencePotential(trajectory: Trajectory, nodes: Node[], edges: Edge[]): number {
  let potential = 0

  for (let i = 0; i < trajectory.nodes.length; i++) {
    const nodeId = trajectory.nodes[i]
    const node = nodes.find(n => n.id === nodeId)
    if (!node) continue

    // 节点自身的能量
    potential += node.metadata.energyLevel * 0.3

    // 节点的连接多样性
    const nodeEdges = edges.filter(e => e.source === nodeId || e.target === nodeId)
    const edgeTypes = new Set(nodeEdges.map(e => e.type)).size
    potential += (edgeTypes / 5) * 0.3

    // 与路径中其他节点的潜在连接
    for (let j = i + 1; j < trajectory.nodes.length; j++) {
      const otherId = trajectory.nodes[j]
      const hasDirectConnection = edges.some(e => 
        (e.source === nodeId && e.target === otherId) ||
        (e.source === otherId && e.target === nodeId)
      )
      if (!hasDirectConnection) {
        // 间接连接潜力
        potential += 0.1
      }
    }
  }

  return Math.min(1, potential / trajectory.nodes.length)
}
