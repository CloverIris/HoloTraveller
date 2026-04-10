// Core entity types

export interface Node {
  id: string;
  label: string;
  type: NodeType;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  x?: number;
  y?: number;
  metadata: NodeMetadata;
}

export type NodeType = 
  | 'concept'      // 概念节点
  | 'goal'         // 目标节点
  | 'milestone'    // 里程碑节点
  | 'exploration'  // 探索节点
  | 'insight'      // 洞察节点
  | 'thread';      // 线程节点

export interface NodeMetadata {
  importance: number;      // 0-1
  stability: number;       // 0-1 (反脆弱相关)
  chaosAffinity: number;   // 0-1 (混沌亲和力)
  energyLevel: number;     // 0-1 (当前能量)
  lastVisited?: Date;
  visitCount: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  strength: number;        // 0-1
  createdAt: Date;
  metadata?: EdgeMetadata;
}

export type EdgeType =
  | 'association'  // 关联
  | 'dependency'   // 依赖
  | 'sequence'     // 序列
  | 'contrast'     // 对比
  | 'emergence';   // 涌现

export interface EdgeMetadata {
  activationCount: number;
  lastActivated?: Date;
  emotionalWeight?: number;
}

// Trajectory - 涨落适应性路径
export interface Trajectory {
  id: string;
  name: string;
  description?: string;
  nodes: string[];         // 节点ID序列
  expectedFluctuation: FluctuationRange;
  actualPath: PathSegment[];
  status: TrajectoryStatus;
  createdAt: Date;
  updatedAt: Date;
  threadId: string;
}

export interface FluctuationRange {
  min: number;
  max: number;
  expectedDeviation: number;
}

export interface PathSegment {
  fromNodeId: string;
  toNodeId: string;
  timestamp: Date;
  deviation: number;       // 与预期的偏差
  reconstructed: boolean;  // 是否被重构
}

export type TrajectoryStatus = 'active' | 'completed' | 'abandoned' | 'reconstructed';

// Thread - 探索线程
export interface Thread {
  id: string;
  name: string;
  description?: string;
  type: ThreadType;
  status: ThreadStatus;
  priority: number;        // 0-1
  emergencePotential: number;  // 涌现潜力 0-1
  nodeIds: string[];
  trajectoryIds: string[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  phaseTransitionSignals: PhaseTransitionSignal[];
}

export type ThreadType = 'main' | 'side' | 'experiment' | 'roaming';
export type ThreadStatus = 'active' | 'hibernating' | 'archived' | 'transformed';

export interface PhaseTransitionSignal {
  timestamp: Date;
  type: 'connection_burst' | 'insight_spark' | 'energy_shift' | 'pattern_recognition';
  intensity: number;
  description: string;
}

// Cognitive Framework - 临时意义结构
export interface CognitiveFramework {
  id: string;
  title: string;
  content: string;
  context: FrameworkContext;
  createdAt: Date;
  expiresAt: Date;
  halfLife: number;        // 半衰期（小时）
  status: FrameworkStatus;
  relatedNodeIds: string[];
  relatedThreadIds: string[];
}

export interface FrameworkContext {
  timeRange: { start: Date; end: Date };
  focusAreas: string[];
  coreConflict?: string;
  temporaryFocus?: string;
}

export type FrameworkStatus = 'active' | 'expired' | 'superseded';

// Antifragility - 反脆弱性
export interface AntifragilityProfile {
  id: string;
  userId: string;
  elasticityScore: number;     // 认知弹性系数 0-1
  recoveryCurve: RecoveryPoint[];
  shocks: ControlledShock[];
  adaptations: Adaptation[];
  updatedAt: Date;
}

export interface RecoveryPoint {
  timestamp: Date;
  baseline: number;
  afterShock: number;
  recoveryTime: number;        // 恢复时间（分钟）
  growth: number;              // 恢复后的成长值
}

export interface ControlledShock {
  id: string;
  type: ShockType;
  intensity: number;           // 0-1
  timestamp: Date;
  targetNodeId?: string;
  description: string;
  result: ShockResult;
}

export type ShockType = 
  | 'random_jump'      // 随机跳转
  | 'timeline_shuffle' // 时间线打乱
  | 'perspective_flip' // 视角翻转
  | 'constraint_add'   // 添加约束
  | 'resource_limit';  // 资源限制

export interface ShockResult {
  discomfortLevel: number;     // 0-1
  insights: string[];
  newConnections: string[];
  adaptationScore: number;     // 0-1
}

export interface Adaptation {
  id: string;
  triggerShockId: string;
  type: string;
  description: string;
  timestamp: Date;
  strength: number;
}

// Navigation State
export interface NavigationState {
  currentPhase: CognitivePhase;
  recommendedAction: RecommendedAction;
  turbulenceLevel: number;     // 0-1
  creativeZoneProximity: number; // 距离创造性湍流区的距离
}

export type CognitivePhase = 
  | 'rigid_order'      // 过于有序的僵化
  | 'edge_of_chaos'    // 混沌边缘（理想状态）
  | 'disordered_chaos' // 过于混乱的迷失
  | 'transition';      // 过渡状态

export interface RecommendedAction {
  type: ActionType;
  description: string;
  targetNodeId?: string;
  expectedOutcome: string;
  uncertaintyLevel: number;
}

export type ActionType =
  | 'explore_node'
  | 'create_connection'
  | 'start_thread'
  | 'introduce_shock'
  | 'generate_framework'
  | 'pause_reflect';

// Graph State
export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId?: string;
  viewMode: 'network' | 'trajectory' | 'threads';
  filter: GraphFilter;
}

export interface GraphFilter {
  nodeTypes: NodeType[];
  edgeTypes: EdgeType[];
  timeRange?: { start: Date; end: Date };
  tags: string[];
}

// App Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  autoSave: boolean;
  shockFrequency: 'daily' | 'weekly' | 'manual';
  frameworkHalfLife: number;   // 默认半衰期（小时）
  maxParallelThreads: number;  // 最大并行线程数
  aiEnabled: boolean;
  aiProvider?: string;
  aiApiKey?: string;
}
