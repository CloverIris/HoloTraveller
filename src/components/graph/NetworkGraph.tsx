import { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node as FlowNode,
  type Edge as FlowEdge,
  Panel,
} from 'reactflow'
import { motion } from 'framer-motion'
import 'reactflow/dist/style.css'

import { useAppStore } from '@/stores/appStore'


// Node type color mapping
const nodeTypeColors: Record<string, string> = {
  concept: '#3b82f6',
  goal: '#22c55e',
  milestone: '#8b5cf6',
  insight: '#f59e0b',
  resource: '#6b7280',
  default: '#64748b',
}



// Sample data for initial display
const sampleNodes: FlowNode[] = [
  { 
    id: '1', 
    position: { x: 100, y: 100 }, 
    data: { label: '认知网络理论', type: 'concept' },
    style: { background: '#3b82f6' },
  },
  { 
    id: '2', 
    position: { x: 400, y: 200 }, 
    data: { label: '完成论文写作', type: 'goal' },
    style: { background: '#22c55e' },
  },
  { 
    id: '3', 
    position: { x: 700, y: 150 }, 
    data: { label: '灵感涌现', type: 'insight' },
    style: { background: '#f59e0b' },
  },
  { 
    id: '4', 
    position: { x: 250, y: 400 }, 
    data: { label: '第一阶段完成', type: 'milestone' },
    style: { background: '#8b5cf6' },
  },
  { 
    id: '5', 
    position: { x: 550, y: 450 }, 
    data: { label: '参考资料库', type: 'resource' },
    style: { background: '#6b7280' },
  },
]

const sampleEdges: FlowEdge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep' },
  { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', animated: true },
]

export function NetworkGraph() {
  const { nodes: appNodes, edges: appEdges, selectedNodeId, setSelectedNodeId } = useAppStore()

  const hasData = appNodes.length > 0
  
  const initialNodes = useMemo<FlowNode[]>(() => {
    if (hasData) {
      return appNodes.map((n, i) => ({
        id: n.id,
        position: { x: n.x ?? i * 100, y: n.y ?? i * 50 },
        data: { label: n.label, type: n.type },
        style: { 
          background: nodeTypeColors[n.type as string] || nodeTypeColors.default,
        },
        selected: n.id === selectedNodeId,
      }))
    }
    return sampleNodes
  }, [appNodes, hasData, selectedNodeId])

  const initialEdges = useMemo<FlowEdge[]>(() => {
    if (hasData) {
      return appEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
      }))
    }
    return sampleEdges
  }, [appEdges, hasData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      selected: n.id === selectedNodeId,
    })))
  }, [selectedNodeId, setNodes])

  const onNodeClick = useCallback((_: React.MouseEvent, node: FlowNode) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id)
  }, [selectedNodeId, setSelectedNodeId])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="var(--ht-border-default)" 
          gap={24} 
          size={1}
          className="opacity-50"
        />
        
        <Controls 
          className="!bg-[var(--ht-bg-elevated)] !border-[var(--ht-border-default)] !rounded-xl !shadow-lg"
        />
        
        <MiniMap 
          className="!bg-[var(--ht-bg-secondary)] !border-[var(--ht-border-default)] !rounded-xl !shadow-lg"
          nodeColor={(node) => node.style?.background as string || '#64748b'}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Empty state hint */}
        {!hasData && (
          <Panel position="top-center" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 bg-[var(--ht-bg-elevated)] border border-[var(--ht-border-default)] rounded-full shadow-lg text-sm text-[var(--ht-text-secondary)]"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--ht-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                这是示例数据。按 ⌘N 创建你的第一个节点
              </span>
            </motion.div>
          </Panel>
        )}

        {/* Quick stats panel */}
        <Panel position="top-right" className="mt-4 mr-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-3 py-2 bg-[var(--ht-bg-elevated)]/90 backdrop-blur-sm border border-[var(--ht-border-default)] rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[var(--ht-text-secondary)]">概念</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[var(--ht-text-secondary)]">目标</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[var(--ht-text-secondary)]">里程碑</span>
              </div>
            </div>
          </motion.div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
