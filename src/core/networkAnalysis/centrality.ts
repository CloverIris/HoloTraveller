/**
 * 网络中心性分析
 * 实现多种中心性指标计算
 */

import type { Node, Edge } from '@/types'

export interface CentralityMetrics {
  degree: number        // 度中心性
  betweenness: number   // 介数中心性
  closeness: number     // 接近中心性
  eigenvector: number   // 特征向量中心性
  pagerank: number      // PageRank
}

/**
 * 计算所有节点的中心性指标
 */
export function calculateAllCentrality(
  nodes: Node[],
  edges: Edge[]
): Map<string, CentralityMetrics> {
  const metrics = new Map<string, CentralityMetrics>()
  
  const degree = calculateDegreeCentrality(nodes, edges)
  const betweenness = calculateBetweennessCentrality(nodes, edges)
  const closeness = calculateClosenessCentrality(nodes, edges)
  const eigenvector = calculateEigenvectorCentrality(nodes, edges)
  const pagerank = calculatePageRank(nodes, edges)

  for (const node of nodes) {
    metrics.set(node.id, {
      degree: degree.get(node.id) || 0,
      betweenness: betweenness.get(node.id) || 0,
      closeness: closeness.get(node.id) || 0,
      eigenvector: eigenvector.get(node.id) || 0,
      pagerank: pagerank.get(node.id) || 0,
    })
  }

  return metrics
}

/**
 * 度中心性 (Degree Centrality)
 * 直接连接的数量，归一化到 0-1
 */
function calculateDegreeCentrality(
  nodes: Node[],
  edges: Edge[]
): Map<string, number> {
  const centrality = new Map<string, number>()
  const degreeCount = new Map<string, number>()

  // 初始化
  for (const node of nodes) {
    degreeCount.set(node.id, 0)
  }

  // 计算度数
  for (const edge of edges) {
    degreeCount.set(edge.source, (degreeCount.get(edge.source) || 0) + 1)
    degreeCount.set(edge.target, (degreeCount.get(edge.target) || 0) + 1)
  }

  // 归一化
  const maxDegree = Math.max(...degreeCount.values(), 1)
  for (const [nodeId, count] of degreeCount) {
    centrality.set(nodeId, count / maxDegree)
  }

  return centrality
}

/**
 * 介数中心性 (Betweenness Centrality)
 * 节点作为最短路径桥梁的重要性
 */
function calculateBetweennessCentrality(
  nodes: Node[],
  edges: Edge[]
): Map<string, number> {
  const centrality = new Map<string, number>()
  const nodeIds = nodes.map(n => n.id)
  
  // 初始化
  for (const nodeId of nodeIds) {
    centrality.set(nodeId, 0)
  }

  if (nodes.length <= 2) {
    return centrality
  }

  // 构建邻接表
  const adjacency = buildAdjacencyList(nodes, edges)

  // 对每个节点计算最短路径
  for (const sourceId of nodeIds) {
    const { paths, sigma } = shortestPaths(sourceId, adjacency, nodeIds)
    
    // 累积依赖值
    const dependency = new Map<string, number>()
    for (const nodeId of nodeIds) {
      dependency.set(nodeId, 0)
    }

    const sortedNodes = [...nodeIds].sort((a, b) => 
      (paths.get(b)?.distance || 0) - (paths.get(a)?.distance || 0)
    )

    for (const nodeId of sortedNodes) {
      if (sourceId === nodeId) continue
      
      const pathInfo = paths.get(nodeId)
      if (!pathInfo || pathInfo.predecessors.length === 0) continue

      for (const pred of pathInfo.predecessors) {
        const coeff = (sigma.get(pred) || 0) / (sigma.get(nodeId) || 1) * (1 + (dependency.get(nodeId) || 0))
        dependency.set(pred, (dependency.get(pred) || 0) + coeff)
      }
    }

    // 累加到全局中心性（排除源节点）
    for (const [nodeId, dep] of dependency) {
      if (nodeId !== sourceId) {
        centrality.set(nodeId, (centrality.get(nodeId) || 0) + dep)
      }
    }
  }

  // 归一化
  const maxValue = Math.max(...centrality.values(), 1)
  for (const [nodeId, value] of centrality) {
    centrality.set(nodeId, value / maxValue)
  }

  return centrality
}

/**
 * 接近中心性 (Closeness Centrality)
 * 节点到所有其他节点的平均最短路径的倒数
 */
function calculateClosenessCentrality(
  nodes: Node[],
  edges: Edge[]
): Map<string, number> {
  const centrality = new Map<string, number>()
  const adjacency = buildAdjacencyList(nodes, edges)
  const nodeIds = nodes.map(n => n.id)

  for (const sourceId of nodeIds) {
    const distances = dijkstra(sourceId, adjacency, nodeIds)
    const reachableDistances = [...distances.values()].filter(d => d !== Infinity && d > 0)
    
    if (reachableDistances.length === 0) {
      centrality.set(sourceId, 0)
    } else {
      const avgDistance = reachableDistances.reduce((a, b) => a + b, 0) / reachableDistances.length
      centrality.set(sourceId, 1 / avgDistance)
    }
  }

  // 归一化
  const maxValue = Math.max(...centrality.values(), 1)
  for (const [nodeId, value] of centrality) {
    centrality.set(nodeId, value / maxValue)
  }

  return centrality
}

/**
 * 特征向量中心性 (Eigenvector Centrality)
 * 连接到重要节点的节点更重要
 */
function calculateEigenvectorCentrality(
  nodes: Node[],
  edges: Edge[]
): Map<string, number> {
  const centrality = new Map<string, number>()
  const nodeIds = nodes.map(n => n.id)
  const nodeIndex = new Map(nodeIds.map((id, i) => [id, i]))
  
  // 构建邻接矩阵
  const n = nodes.length
  const adjacencyMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))
  
  for (const edge of edges) {
    const i = nodeIndex.get(edge.source)
    const j = nodeIndex.get(edge.target)
    if (i !== undefined && j !== undefined) {
      adjacencyMatrix[i][j] = edge.strength
      adjacencyMatrix[j][i] = edge.strength
    }
  }

  // 幂迭代法计算特征向量
  let eigenvector = Array(n).fill(1 / n)
  const iterations = 100
  const tolerance = 1e-6

  for (let iter = 0; iter < iterations; iter++) {
    const newVector = Array(n).fill(0)
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        newVector[i] += adjacencyMatrix[i][j] * eigenvector[j]
      }
    }

    // 归一化
    const norm = Math.sqrt(newVector.reduce((sum, x) => sum + x * x, 0))
    if (norm === 0) break
    
    for (let i = 0; i < n; i++) {
      newVector[i] /= norm
    }

    // 检查收敛
    const diff = newVector.reduce((sum, x, i) => sum + Math.abs(x - eigenvector[i]), 0)
    eigenvector = newVector
    
    if (diff < tolerance) break
  }

  // 映射回节点ID
  for (let i = 0; i < n; i++) {
    centrality.set(nodeIds[i], eigenvector[i])
  }

  return centrality
}

/**
 * PageRank 算法
 */
function calculatePageRank(
  nodes: Node[],
  edges: Edge[]
): Map<string, number> {
  const damping = 0.85
  const iterations = 100
  const tolerance = 1e-6
  
  const nodeIds = nodes.map(n => n.id)
  const n = nodes.length
  
  if (n === 0) return new Map()
  
  // 构建出边和入边
  const outEdges = new Map<string, string[]>()
  const inEdges = new Map<string, string[]>()
  
  for (const nodeId of nodeIds) {
    outEdges.set(nodeId, [])
    inEdges.set(nodeId, [])
  }
  
  for (const edge of edges) {
    outEdges.get(edge.source)?.push(edge.target)
    inEdges.get(edge.target)?.push(edge.source)
  }

  // 初始化
  let pagerank = new Map<string, number>()
  for (const nodeId of nodeIds) {
    pagerank.set(nodeId, 1 / n)
  }

  // 迭代
  for (let iter = 0; iter < iterations; iter++) {
    const newRank = new Map<string, number>()
    
    for (const nodeId of nodeIds) {
      let rank = (1 - damping) / n
      
      for (const incoming of inEdges.get(nodeId) || []) {
        const outCount = outEdges.get(incoming)?.length || 1
        rank += damping * (pagerank.get(incoming) || 0) / outCount
      }
      
      newRank.set(nodeId, rank)
    }

    // 检查收敛
    let diff = 0
    for (const nodeId of nodeIds) {
      diff += Math.abs((newRank.get(nodeId) || 0) - (pagerank.get(nodeId) || 0))
    }
    
    pagerank = newRank
    if (diff < tolerance) break
  }

  // 归一化
  const maxValue = Math.max(...pagerank.values(), 1)
  for (const [nodeId, value] of pagerank) {
    pagerank.set(nodeId, value / maxValue)
  }

  return pagerank
}

// 辅助函数

function buildAdjacencyList(
  nodes: Node[],
  edges: Edge[]
): Map<string, Map<string, number>> {
  const adjacency = new Map<string, Map<string, number>>()
  
  for (const node of nodes) {
    adjacency.set(node.id, new Map())
  }
  
  for (const edge of edges) {
    adjacency.get(edge.source)?.set(edge.target, edge.strength)
    adjacency.get(edge.target)?.set(edge.source, edge.strength)
  }
  
  return adjacency
}

function dijkstra(
  source: string,
  adjacency: Map<string, Map<string, number>>,
  nodeIds: string[]
): Map<string, number> {
  const distances = new Map<string, number>()
  const visited = new Set<string>()
  
  for (const nodeId of nodeIds) {
    distances.set(nodeId, Infinity)
  }
  distances.set(source, 0)
  
  while (visited.size < nodeIds.length) {
    // 找到未访问的最小距离节点
    let minNode: string | null = null
    let minDistance = Infinity
    
    for (const [nodeId, distance] of distances) {
      if (!visited.has(nodeId) && distance < minDistance) {
        minNode = nodeId
        minDistance = distance
      }
    }
    
    if (minNode === null || minDistance === Infinity) break
    
    visited.add(minNode)
    
    // 更新邻居距离
    const neighbors = adjacency.get(minNode)
    if (neighbors) {
      for (const [neighbor, weight] of neighbors) {
        if (!visited.has(neighbor)) {
          const newDistance = minDistance + (1 / weight) // 权重越大距离越小
          if (newDistance < (distances.get(neighbor) || Infinity)) {
            distances.set(neighbor, newDistance)
          }
        }
      }
    }
  }
  
  return distances
}

interface PathInfo {
  distance: number
  predecessors: string[]
}

function shortestPaths(
  source: string,
  adjacency: Map<string, Map<string, number>>,
  nodeIds: string[]
): { paths: Map<string, PathInfo>; sigma: Map<string, number> } {
  const paths = new Map<string, PathInfo>()
  const sigma = new Map<string, number>()
  const visited = new Set<string>()
  const queue: string[] = [source]
  
  for (const nodeId of nodeIds) {
    paths.set(nodeId, { distance: nodeId === source ? 0 : Infinity, predecessors: [] })
    sigma.set(nodeId, nodeId === source ? 1 : 0)
  }
  
  while (queue.length > 0) {
    const current = queue.shift()!
    
    if (visited.has(current)) continue
    visited.add(current)
    
    const currentInfo = paths.get(current)!
    const neighbors = adjacency.get(current)
    
    if (neighbors) {
      for (const [neighbor, weight] of neighbors) {
        const newDistance = currentInfo.distance + (1 / weight)
        const neighborInfo = paths.get(neighbor)!
        
        if (newDistance < neighborInfo.distance) {
          paths.set(neighbor, { distance: newDistance, predecessors: [current] })
          sigma.set(neighbor, sigma.get(current) || 0)
          queue.push(neighbor)
        } else if (Math.abs(newDistance - neighborInfo.distance) < 1e-10) {
          neighborInfo.predecessors.push(current)
          sigma.set(neighbor, (sigma.get(neighbor) || 0) + (sigma.get(current) || 0))
        }
      }
    }
  }
  
  return { paths, sigma }
}

/**
 * 获取网络中的关键节点（综合中心性）
 */
export function getKeyNodes(
  nodes: Node[],
  edges: Edge[],
  topN: number = 5
): Array<{ node: Node; score: number; metrics: CentralityMetrics }> {
  const centrality = calculateAllCentrality(nodes, edges)
  
  const scoredNodes = nodes.map(node => {
    const metrics = centrality.get(node.id)!
    // 综合得分（加权平均）
    const score = (
      metrics.degree * 0.2 +
      metrics.betweenness * 0.3 +
      metrics.closeness * 0.2 +
      metrics.eigenvector * 0.15 +
      metrics.pagerank * 0.15
    )
    return { node, score, metrics }
  })
  
  return scoredNodes
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
