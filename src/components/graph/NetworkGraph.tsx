import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge as FlowEdge,
  type Node as FlowNode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAppStore } from '@/stores/appStore'
// Types are inferred from store

interface NetworkGraphProps {
  onNodeSelect?: (nodeId: string) => void
}

const nodeTypeColors: Record<string, string> = {
  concept: '#3b82f6',
  goal: '#22c55e',
  milestone: '#eab308',
  exploration: '#f97316',
  insight: '#8b5cf6',
  thread: '#ec4899',
}

export function NetworkGraph({ onNodeSelect }: NetworkGraphProps) {
  const { nodes: appNodes, edges: appEdges, selectedNodeId, setSelectedNodeId } = useAppStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isReady, setIsReady] = useState(false)

  // Convert app nodes/edges to ReactFlow format
  useEffect(() => {
    const flowNodes: FlowNode[] = appNodes.map((node) => ({
      id: node.id,
      type: 'default',
      position: { x: node.x || Math.random() * 600, y: node.y || Math.random() * 400 },
      data: { label: node.label, node },
      style: {
        background: nodeTypeColors[node.type] || '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: selectedNodeId === node.id 
          ? '0 0 0 3px rgba(59, 130, 246, 0.5)' 
          : '0 2px 4px rgba(0,0,0,0.1)',
        opacity: node.metadata.energyLevel < 0.3 ? 0.5 : 1,
      },
    }))

    const flowEdges: FlowEdge[] = appEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      style: { 
        stroke: edge.type === 'emergence' ? '#f43f5e' : '#94a3b8',
        strokeWidth: 1 + edge.strength * 2,
        opacity: 0.6,
      },
      animated: edge.type === 'emergence',
    }))

    setNodes(flowNodes)
    setEdges(flowEdges)
    setIsReady(true)
  }, [appNodes, appEdges, selectedNodeId, setNodes, setEdges])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      setSelectedNodeId(node.id)
      onNodeSelect?.(node.id)
    },
    [setSelectedNodeId, onNodeSelect]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">加载网络图中...</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#94a3b8" gap={16} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeColor={(node) => nodeTypeColors[node.data?.node?.type] || '#3b82f6'}
        />
      </ReactFlow>
    </div>
  )
}
