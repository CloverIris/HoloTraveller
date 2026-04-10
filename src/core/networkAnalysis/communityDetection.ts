/**
 * 社区发现算法
 * 实现 Louvain 算法和标签传播算法
 */

import type { Node, Edge } from '@/types'

export interface Community {
  id: string
  nodes: string[]
  density: number
  cohesion: number
}

/**
 * Louvain 社区发现算法
 * 基于模块度优化的贪心算法
 */
export function detectCommunitiesLouvain(
  nodes: Node[],
  edges: Edge[],
  resolution: number = 1.0
): Community[] {
  if (nodes.length === 0) return []
  
  // 初始化：每个节点是一个社区
  let nodeToCommunity = new Map<string, string>()
  for (const node of nodes) {
    nodeToCommunity.set(node.id, node.id)
  }
  
  // 计算总边权重
  const totalWeight = edges.reduce((sum, e) => sum + e.strength, 0)
  if (totalWeight === 0) {
    return nodes.map(n => ({
      id: n.id,
      nodes: [n.id],
      density: 0,
      cohesion: 0,
    }))
  }
  
  // 构建邻接表和权重映射
  const adjacency = buildWeightedAdjacency(nodes, edges)
  const nodeWeights = calculateNodeWeights(adjacency)
  
  let improved = true
  let iterations = 0
  const maxIterations = 100
  
  while (improved && iterations < maxIterations) {
    improved = false
    iterations++
    
    for (const node of nodes) {
      const currentCommunity = nodeToCommunity.get(node.id)!
      const neighborCommunities = getNeighborCommunities(node.id, adjacency, nodeToCommunity)
      
      let bestCommunity = currentCommunity
      let bestGain = 0
      
      for (const [community] of neighborCommunities) {
        if (community === currentCommunity) continue
        
        const gain = calculateModularityGain(
          node.id,
          community,
          adjacency,
          nodeToCommunity,
          nodeWeights,
          totalWeight,
          resolution
        )
        
        if (gain > bestGain) {
          bestGain = gain
          bestCommunity = community
        }
      }
      
      if (bestCommunity !== currentCommunity) {
        nodeToCommunity.set(node.id, bestCommunity)
        improved = true
      }
    }
  }
  
  // 构建社区结果
  const communities = new Map<string, string[]>()
  for (const [nodeId, communityId] of nodeToCommunity) {
    if (!communities.has(communityId)) {
      communities.set(communityId, [])
    }
    communities.get(communityId)!.push(nodeId)
  }
  
  // 计算社区指标
  return Array.from(communities.entries()).map(([id, nodeIds]) => {
    const communityEdges = edges.filter(e => 
      nodeIds.includes(e.source) && nodeIds.includes(e.target)
    )
    const possibleEdges = (nodeIds.length * (nodeIds.length - 1)) / 2
    const density = possibleEdges > 0 ? communityEdges.length / possibleEdges : 0
    
    const internalWeight = communityEdges.reduce((sum, e) => sum + e.strength, 0)
    const totalNodeWeight = nodeIds.reduce((sum, id) => sum + (nodeWeights.get(id) || 0), 0)
    const cohesion = totalNodeWeight > 0 ? internalWeight / totalNodeWeight : 0
    
    return {
      id,
      nodes: nodeIds,
      density,
      cohesion,
    }
  })
}

/**
 * 标签传播算法 (Label Propagation)
 * 基于邻居标签 majority voting
 */
export function detectCommunitiesLabelPropagation(
  nodes: Node[],
  edges: Edge[]
): Community[] {
  if (nodes.length === 0) return []
  
  // 初始化：每个节点有唯一标签
  let labels = new Map<string, string>()
  for (const node of nodes) {
    labels.set(node.id, node.id)
  }
  
  const adjacency = buildWeightedAdjacency(nodes, edges)
  const nodeIds = nodes.map(n => n.id)
  
  let changed = true
  let iterations = 0
  const maxIterations = 100
  
  while (changed && iterations < maxIterations) {
    changed = false
    iterations++
    
    // 随机顺序遍历节点
    const shuffled = [...nodeIds].sort(() => Math.random() - 0.5)
    
    for (const nodeId of shuffled) {
      const neighbors = adjacency.get(nodeId)
      if (!neighbors || neighbors.size === 0) continue
      
      // 统计邻居标签
      const labelCounts = new Map<string, number>()
      for (const [neighborId, weight] of neighbors) {
        const label = labels.get(neighborId)!
        labelCounts.set(label, (labelCounts.get(label) || 0) + weight)
      }
      
      // 选择权重最高的标签
      let bestLabel = labels.get(nodeId)!
      let maxWeight = 0
      
      for (const [label, weight] of labelCounts) {
        if (weight > maxWeight || (weight === maxWeight && Math.random() < 0.5)) {
          maxWeight = weight
          bestLabel = label
        }
      }
      
      if (bestLabel !== labels.get(nodeId)) {
        labels.set(nodeId, bestLabel)
        changed = true
      }
    }
  }
  
  // 构建社区结果
  const communities = new Map<string, string[]>()
  for (const [nodeId, label] of labels) {
    if (!communities.has(label)) {
      communities.set(label, [])
    }
    communities.get(label)!.push(nodeId)
  }
  
  return Array.from(communities.entries()).map(([id, nodeIds]) => ({
    id,
    nodes: nodeIds,
    density: 0,
    cohesion: 0,
  }))
}

/**
 * 计算社区之间的连接强度
 */
export function calculateInterCommunityConnections(
  communities: Community[],
  edges: Edge[]
): Map<string, Map<string, number>> {
  const nodeToCommunity = new Map<string, string>()
  for (const community of communities) {
    for (const nodeId of community.nodes) {
      nodeToCommunity.set(nodeId, community.id)
    }
  }
  
  const connections = new Map<string, Map<string, number>>()
  
  for (const community of communities) {
    connections.set(community.id, new Map())
  }
  
  for (const edge of edges) {
    const sourceCommunity = nodeToCommunity.get(edge.source)
    const targetCommunity = nodeToCommunity.get(edge.target)
    
    if (sourceCommunity && targetCommunity && sourceCommunity !== targetCommunity) {
      const current = connections.get(sourceCommunity)?.get(targetCommunity) || 0
      connections.get(sourceCommunity)?.set(targetCommunity, current + edge.strength)
    }
  }
  
  return connections
}

/**
 * 计算网络的模块度 (Modularity)
 */
export function calculateModularity(
  nodes: Node[],
  edges: Edge[],
  communities: Community[]
): number {
  const nodeToCommunity = new Map<string, string>()
  for (const community of communities) {
    for (const nodeId of community.nodes) {
      nodeToCommunity.set(nodeId, community.id)
    }
  }
  
  const adjacency = buildWeightedAdjacency(nodes, edges)
  const nodeWeights = calculateNodeWeights(adjacency)
  const totalWeight = edges.reduce((sum, e) => sum + e.strength, 0) * 2
  
  if (totalWeight === 0) return 0
  
  let modularity = 0
  
  for (const community of communities) {
    for (const i of community.nodes) {
      for (const j of community.nodes) {
        const Aij = adjacency.get(i)?.get(j) || 0
        const ki = nodeWeights.get(i) || 0
        const kj = nodeWeights.get(j) || 0
        
        modularity += Aij - (ki * kj) / totalWeight
      }
    }
  }
  
  return modularity / totalWeight
}

// 辅助函数

function buildWeightedAdjacency(
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

function calculateNodeWeights(
  adjacency: Map<string, Map<string, number>>
): Map<string, number> {
  const weights = new Map<string, number>()
  
  for (const [nodeId, neighbors] of adjacency) {
    weights.set(nodeId, [...neighbors.values()].reduce((a, b) => a + b, 0))
  }
  
  return weights
}

function getNeighborCommunities(
  nodeId: string,
  adjacency: Map<string, Map<string, number>>,
  nodeToCommunity: Map<string, string>
): Map<string, number> {
  const communities = new Map<string, number>()
  const neighbors = adjacency.get(nodeId)
  
  if (neighbors) {
    for (const [neighborId, weight] of neighbors) {
      const community = nodeToCommunity.get(neighborId)!
      communities.set(community, (communities.get(community) || 0) + weight)
    }
  }
  
  return communities
}

function calculateModularityGain(
  nodeId: string,
  targetCommunity: string,
  adjacency: Map<string, Map<string, number>>,
  nodeToCommunity: Map<string, string>,
  nodeWeights: Map<string, number>,
  totalWeight: number,
  resolution: number
): number {
  const ki = nodeWeights.get(nodeId) || 0
  const ki_in = [...(adjacency.get(nodeId) || [])]
    .filter(([neighbor]) => nodeToCommunity.get(neighbor) === targetCommunity)
    .reduce((sum, [, weight]) => sum + weight, 0)
  
  const sumTot = [...nodeToCommunity.entries()]
    .filter(([, community]) => community === targetCommunity)
    .reduce((sum, [id]) => sum + (nodeWeights.get(id) || 0), 0)
  
  return ki_in - resolution * ki * sumTot / totalWeight
}

/**
 * 识别社区间的桥梁节点
 */
export function findBridgeNodes(
  nodes: Node[],
  edges: Edge[],
  communities: Community[]
): Array<{ node: Node; communities: string[]; betweenness: number }> {
  const nodeToCommunities = new Map<string, Set<string>>()
  
  for (const community of communities) {
    for (const nodeId of community.nodes) {
      if (!nodeToCommunities.has(nodeId)) {
        nodeToCommunities.set(nodeId, new Set())
      }
      nodeToCommunities.get(nodeId)!.add(community.id)
    }
  }
  
  const bridges: Array<{ node: Node; communities: string[]; betweenness: number }> = []
  
  for (const node of nodes) {
    const communities = nodeToCommunities.get(node.id)
    if (communities && communities.size > 1) {
      // 计算该节点的连接数作为简单的中介度估计
      const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id)
      bridges.push({
        node,
        communities: [...communities],
        betweenness: connectedEdges.length,
      })
    }
  }
  
  return bridges.sort((a, b) => b.betweenness - a.betweenness)
}
