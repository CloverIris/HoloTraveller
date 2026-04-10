import type { Node, Edge, CognitivePhase, NavigationState, RecommendedAction } from '@/types'

/**
 * 混沌边缘导航 - 混沌相态分析
 * 基于图网络结构计算当前认知相态
 */

export interface ChaosMetrics {
  orderDegree: number      // 秩序度 0-1
  chaosDegree: number      // 混乱度 0-1
  connectivity: number     // 连通度 0-1
  clustering: number       // 聚类系数 0-1
  entropy: number          // 网络熵
}

/**
 * 计算网络的混沌度量指标
 */
export function calculateChaosMetrics(nodes: Node[], edges: Edge[]): ChaosMetrics {
  if (nodes.length === 0) {
    return { orderDegree: 0.5, chaosDegree: 0.5, connectivity: 0, clustering: 0, entropy: 1 }
  }

  // 计算连通度
  const connectivity = calculateConnectivity(nodes, edges)
  
  // 计算聚类系数
  const clustering = calculateClusteringCoefficient(nodes, edges)
  
  // 计算网络熵（基于节点度分布）
  const entropy = calculateNetworkEntropy(nodes, edges)
  
  // 秩序度：高聚类 + 高连通 + 低熵 = 高秩序
  const orderDegree = Math.min(1, (clustering * 0.4 + connectivity * 0.4 + (1 - entropy) * 0.2))
  
  // 混乱度：低聚类 + 低连通 + 高熵 = 高混乱
  const chaosDegree = Math.min(1, ((1 - clustering) * 0.3 + (1 - connectivity) * 0.3 + entropy * 0.4))

  return { orderDegree, chaosDegree, connectivity, clustering, entropy }
}

/**
 * 计算网络连通度
 */
function calculateConnectivity(nodes: Node[], edges: Edge[]): number {
  if (nodes.length <= 1) return 0
  
  const maxEdges = (nodes.length * (nodes.length - 1)) / 2
  if (maxEdges === 0) return 0
  
  return Math.min(1, edges.length / maxEdges)
}

/**
 * 计算平均聚类系数
 */
function calculateClusteringCoefficient(nodes: Node[], edges: Edge[]): number {
  if (nodes.length < 3) return 0
  
  const adjacencyMap = buildAdjacencyMap(edges)
  let totalClustering = 0
  let count = 0

  for (const node of nodes) {
    const neighbors = adjacencyMap.get(node.id) || new Set()
    if (neighbors.size < 2) continue

    let triangles = 0
    const neighborArray = Array.from(neighbors)
    
    for (let i = 0; i < neighborArray.length; i++) {
      for (let j = i + 1; j < neighborArray.length; j++) {
        if (hasEdgeBetween(neighborArray[i], neighborArray[j], edges)) {
          triangles++
        }
      }
    }

    const possibleTriangles = (neighbors.size * (neighbors.size - 1)) / 2
    if (possibleTriangles > 0) {
      totalClustering += triangles / possibleTriangles
      count++
    }
  }

  return count > 0 ? totalClustering / count : 0
}

/**
 * 计算网络熵（基于度分布的香农熵）
 */
function calculateNetworkEntropy(nodes: Node[], edges: Edge[]): number {
  if (nodes.length === 0) return 1

  const degreeMap = new Map<string, number>()
  nodes.forEach(n => degreeMap.set(n.id, 0))
  
  edges.forEach(edge => {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1)
    degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1)
  })

  const degrees = Array.from(degreeMap.values())
  const maxDegree = Math.max(...degrees, 1)
  
  // 归一化度分布
  const distribution = degrees.map(d => d / maxDegree)
  
  // 计算香农熵
  let entropy = 0
  for (const p of distribution) {
    if (p > 0) {
      entropy -= p * Math.log2(p + 0.001)
    }
  }

  // 归一化到 0-1
  return Math.min(1, entropy / Math.log2(nodes.length + 1))
}

/**
 * 判断当前认知相态
 */
export function determineCognitivePhase(metrics: ChaosMetrics): CognitivePhase {
  const { orderDegree, chaosDegree, entropy } = metrics
  
  // 理想创造性湍流区：适度的秩序 + 适度的混乱
  const isEdgeOfChaos = orderDegree > 0.3 && orderDegree < 0.7 && 
                        chaosDegree > 0.3 && chaosDegree < 0.7 &&
                        entropy > 0.4 && entropy < 0.8

  if (isEdgeOfChaos) return 'edge_of_chaos'
  if (orderDegree > 0.8 || chaosDegree < 0.2) return 'rigid_order'
  if (chaosDegree > 0.8 || orderDegree < 0.2) return 'disordered_chaos'
  return 'transition'
}

/**
 * 计算距离创造性湍流区的距离
 * 0 = 在中心，1 = 远离
 */
export function calculateDistanceToCreativeZone(metrics: ChaosMetrics): number {
  const idealOrder = 0.5
  const idealChaos = 0.5
  const idealEntropy = 0.6

  const distance = Math.sqrt(
    Math.pow(metrics.orderDegree - idealOrder, 2) +
    Math.pow(metrics.chaosDegree - idealChaos, 2) +
    Math.pow(metrics.entropy - idealEntropy, 2)
  )

  return Math.min(1, distance / Math.sqrt(3))
}

/**
 * 生成导航建议
 */
export function generateNavigationSuggestion(
  phase: CognitivePhase,
  metrics: ChaosMetrics,
  nodes: Node[],
  _edges: Edge[]
): NavigationState {
  const distanceToZone = calculateDistanceToCreativeZone(metrics)
  const turbulenceLevel = calculateTurbulenceLevel(metrics)

  let recommendedAction: RecommendedAction

  switch (phase) {
    case 'rigid_order':
      recommendedAction = {
        type: 'introduce_shock',
        description: '当前系统过于有序，建议引入微小冲击打破僵化',
        expectedOutcome: '增加系统灵活性，激发新的连接可能',
        uncertaintyLevel: 0.4,
      }
      break
    case 'disordered_chaos':
      recommendedAction = {
        type: 'generate_framework',
        description: '当前系统过于混乱，建议生成临时意义结构建立锚点',
        expectedOutcome: '在混沌中建立暂时的秩序，找到方向',
        uncertaintyLevel: 0.3,
      }
      break
    case 'edge_of_chaos':
      // 在理想区域，推荐探索
      const unexploredNode = findUnexploredNode(nodes)
      recommendedAction = unexploredNode ? {
        type: 'explore_node',
        description: `你正处于创造性湍流区，建议探索节点「${unexploredNode.label}」`,
        targetNodeId: unexploredNode.id,
        expectedOutcome: '在混沌边缘发现新的涌现模式',
        uncertaintyLevel: 0.6,
      } : {
        type: 'create_connection',
        description: '尝试在看似无关的节点间建立新连接',
        expectedOutcome: '产生意想不到的洞察',
        uncertaintyLevel: 0.5,
      }
      break
    case 'transition':
    default:
      recommendedAction = {
        type: 'pause_reflect',
        description: '系统处于过渡期，建议暂停观察当前模式',
        expectedOutcome: '理解当前相态变化趋势',
        uncertaintyLevel: 0.5,
      }
  }

  return {
    currentPhase: phase,
    recommendedAction,
    turbulenceLevel,
    creativeZoneProximity: 1 - distanceToZone,
  }
}

/**
 * 计算湍流级别
 */
function calculateTurbulenceLevel(metrics: ChaosMetrics): number {
  // 湍流 = 秩序和混乱都较高（张力状态）
  return (metrics.orderDegree * metrics.chaosDegree) * 2
}

/**
 * 找到未充分探索的节点
 */
function findUnexploredNode(nodes: Node[]): Node | undefined {
  const unexplored = nodes
    .filter(n => n.metadata.visitCount < 3 && n.metadata.energyLevel > 0.3)
    .sort((a, b) => a.metadata.visitCount - b.metadata.visitCount)
  return unexplored[0]
}

/**
 * 构建邻接表
 */
function buildAdjacencyMap(edges: Edge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  
  for (const edge of edges) {
    if (!map.has(edge.source)) map.set(edge.source, new Set())
    if (!map.has(edge.target)) map.set(edge.target, new Set())
    map.get(edge.source)!.add(edge.target)
    map.get(edge.target)!.add(edge.source)
  }
  
  return map
}

/**
 * 检查两个节点间是否有边
 */
function hasEdgeBetween(nodeA: string, nodeB: string, edges: Edge[]): boolean {
  return edges.some(e => 
    (e.source === nodeA && e.target === nodeB) ||
    (e.source === nodeB && e.target === nodeA)
  )
}

/**
 * 计算节点的混沌亲和力
 * 基于节点在网络中的位置和连接特性
 */
export function calculateNodeChaosAffinity(nodeId: string, nodes: Node[], edges: Edge[]): number {
  const node = nodes.find(n => n.id === nodeId)
  if (!node) return 0.5

  const adjacencyMap = buildAdjacencyMap(edges)
  const neighbors = adjacencyMap.get(nodeId) || new Set()

  // 连接数适中 = 高混沌亲和力（既不过于孤立也不过于中心）
  const degree = neighbors.size
  const avgDegree = edges.length * 2 / (nodes.length || 1)
  const degreeScore = 1 - Math.abs(degree - avgDegree) / (avgDegree + 1)

  // 连接类型的多样性
  const neighborEdges = edges.filter(e => e.source === nodeId || e.target === nodeId)
  const edgeTypeVariety = new Set(neighborEdges.map(e => e.type)).size / 5 // 假设5种类型

  // 节点自身类型的混沌倾向
  const typeChaosMap: Record<string, number> = {
    concept: 0.6,
    goal: 0.3,
    milestone: 0.2,
    exploration: 0.9,
    insight: 0.7,
    thread: 0.5,
  }
  const typeScore = typeChaosMap[node.type] || 0.5

  return (degreeScore * 0.3 + edgeTypeVariety * 0.3 + typeScore * 0.4)
}
