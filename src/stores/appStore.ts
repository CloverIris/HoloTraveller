import { create } from 'zustand'
import type { Node, Edge, Thread, Trajectory, CognitiveFramework, AntifragilityProfile, AppSettings, NavigationState, GraphFilter } from '@/types'

export type ViewMode = 'network' | 'trajectory' | 'threads' | 'frameworks' | 'antifragility'

export interface AppState {
  // Data
  nodes: Node[]
  edges: Edge[]
  threads: Thread[]
  trajectories: Trajectory[]
  frameworks: CognitiveFramework[]
  antifragilityProfile: AntifragilityProfile | null
  
  // UI State
  selectedNodeId: string | null
  selectedThreadId: string | null
  selectedTrajectoryId: string | null
  viewMode: ViewMode
  navigationState: NavigationState | null
  graphFilter: GraphFilter
  
  // Settings
  settings: AppSettings
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Actions
  setNodes: (nodes: Node[]) => void
  addNode: (node: Node) => void
  updateNode: (node: Node) => void
  removeNode: (id: string) => void
  
  setEdges: (edges: Edge[]) => void
  addEdge: (edge: Edge) => void
  removeEdge: (id: string) => void
  
  setThreads: (threads: Thread[]) => void
  addThread: (thread: Thread) => void
  updateThread: (thread: Thread) => void
  removeThread: (id: string) => void
  
  setTrajectories: (trajectories: Trajectory[]) => void
  addTrajectory: (trajectory: Trajectory) => void
  updateTrajectory: (trajectory: Trajectory) => void
  
  setFrameworks: (frameworks: CognitiveFramework[]) => void
  addFramework: (framework: CognitiveFramework) => void
  updateFramework: (framework: CognitiveFramework) => void
  removeFramework: (id: string) => void
  
  setAntifragilityProfile: (profile: AntifragilityProfile) => void
  
  setSelectedNodeId: (id: string | null) => void
  setSelectedThreadId: (id: string | null) => void
  setSelectedTrajectoryId: (id: string | null) => void
  setViewMode: (mode: AppState['viewMode']) => void
  setNavigationState: (state: NavigationState | null) => void
  setGraphFilter: (filter: GraphFilter) => void
  
  setSettings: (settings: Partial<AppSettings>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Data operations
  loadAllData: () => Promise<void>
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'zh',
  autoSave: true,
  shockFrequency: 'weekly',
  frameworkHalfLife: 168, // 7 days
  maxParallelThreads: 5,
  aiEnabled: false,
}

const defaultGraphFilter: GraphFilter = {
  nodeTypes: ['concept', 'goal', 'milestone', 'exploration', 'insight', 'thread'],
  edgeTypes: ['association', 'dependency', 'sequence', 'contrast', 'emergence'],
  tags: [],
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  threads: [],
  trajectories: [],
  frameworks: [],
  antifragilityProfile: null,
  
  selectedNodeId: null,
  selectedThreadId: null,
  selectedTrajectoryId: null,
  viewMode: 'network',
  navigationState: null,
  graphFilter: defaultGraphFilter,
  
  settings: defaultSettings,
  
  isLoading: false,
  error: null,
  
  // Actions
  setNodes: (nodes) => set({ nodes }),
  addNode: (node) => set((state) => ({ nodes: [node, ...state.nodes] })),
  updateNode: (node) => set((state) => ({
    nodes: state.nodes.map((n) => (n.id === node.id ? node : n)),
  })),
  removeNode: (id) => set((state) => {
    // 级联删除：清理所有引用该节点的数据
    const updatedThreads = state.threads.map(t => ({
      ...t,
      nodeIds: t.nodeIds.filter(nodeId => nodeId !== id),
      updatedAt: new Date(),
    }))
    
    const updatedFrameworks = state.frameworks.map(f => ({
      ...f,
      relatedNodeIds: f.relatedNodeIds.filter(nodeId => nodeId !== id),
    }))
    
    return {
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      threads: updatedThreads,
      frameworks: updatedFrameworks,
    }
  }),
  
  setEdges: (edges) => set({ edges }),
  addEdge: (edge) => set((state) => ({ edges: [edge, ...state.edges] })),
  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((e) => e.id !== id),
  })),
  
  setThreads: (threads) => set({ threads }),
  addThread: (thread) => set((state) => ({ threads: [thread, ...state.threads] })),
  updateThread: (thread) => set((state) => ({
    threads: state.threads.map((t) => (t.id === thread.id ? {
      ...thread,
      lastActiveAt: new Date(), // 更新时自动刷新活跃时间
    } : t)),
  })),
  removeThread: (id) => set((state) => ({
    threads: state.threads.filter((t) => t.id !== id),
  })),
  
  setTrajectories: (trajectories) => set({ trajectories }),
  addTrajectory: (trajectory) => set((state) => ({
    trajectories: [trajectory, ...state.trajectories],
  })),
  updateTrajectory: (trajectory) => set((state) => ({
    trajectories: state.trajectories.map((t) =>
      t.id === trajectory.id ? trajectory : t
    ),
  })),
  
  setFrameworks: (frameworks) => set({ 
    frameworks: frameworks.map(f => ({
      ...f,
      // 自动检查过期状态
      status: f.expiresAt < new Date() ? 'expired' : f.status,
    }))
  }),
  addFramework: (framework) => set((state) => ({
    frameworks: [framework, ...state.frameworks],
  })),
  updateFramework: (framework) => set((state) => ({
    frameworks: state.frameworks.map((f) =>
      f.id === framework.id ? framework : f
    ),
  })),
  removeFramework: (id) => set((state) => ({
    frameworks: state.frameworks.filter((f) => f.id !== id),
  })),
  
  setAntifragilityProfile: (profile) => set({ antifragilityProfile: profile }),
  
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedThreadId: (id) => set({ selectedThreadId: id }),
  setSelectedTrajectoryId: (id) => set({ selectedTrajectoryId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setNavigationState: (state) => set({ navigationState: state }),
  setGraphFilter: (filter) => set({ graphFilter: filter }),
  
  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Data operations
  loadAllData: async () => {
    set({ isLoading: true, error: null })
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available')
      }
      
      const [nodes, edges, threads, trajectories, frameworks, profile] = await Promise.all([
        window.electronAPI.db.getNodes(),
        window.electronAPI.db.getEdges(),
        window.electronAPI.db.getThreads(),
        window.electronAPI.db.getTrajectories(),
        window.electronAPI.db.getFrameworks(),
        window.electronAPI.db.getAntifragilityProfile(),
      ])
      
      set({
        nodes,
        edges,
        threads,
        trajectories,
        frameworks,
        antifragilityProfile: profile,
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load data',
        isLoading: false,
      })
    }
  },
}))
