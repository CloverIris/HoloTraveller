# HoloTraveller 架构文档

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Database    │  │  IPC Handlers │  │  File System │       │
│  │  Manager     │  │              │  │  Operations  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC
┌──────────────────────────▼──────────────────────────────────┐
│                  Electron Renderer Process                   │
│                    (React + TypeScript)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                     UI Layer                           │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │
│  │  │   Network   │ │   Thread    │ │  Framework  │       │ │
│  │  │    Graph    │ │   Panel     │ │   Panel     │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   State Management                     │ │
│  │                      (Zustand)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Core Algorithms                     │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │  Chaos   │ │  Pathing │ │  Threads │ │Antifragile│  │ │
│  │  │ Analysis │ │          │ │          │ │          │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │    AI    │ │ Network  │ │  Search  │ │ Timeline │  │ │
│  │  │  Service │ │ Analysis │ │  Engine  │ │          │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 核心模块详解

### 1. 混沌分析引擎 (chaos.ts)

**职责**: 计算网络混沌度量，判定认知相态

**算法**:
- 连通度计算: `edges / maxPossibleEdges`
- 聚类系数: 三角形计数 / 可能三角形
- 网络熵: Shannon 熵基于度分布
- 秩序度/混乱度: 加权组合指标

**输出**: ChaosMetrics, CognitivePhase, NavigationState

---

### 2. 路径规划引擎 (pathing.ts)

**职责**: 生成概率化轨迹，支持轨迹重构

**算法**:
- 加权 DFS 路径探索
- 边权重计算: 基于能量、类型
- 涨落区间: 基于混沌亲和力方差
- 轨迹重构: 偏差检测 + 路径再生

---

### 3. 线程管理引擎 (threads.ts)

**职责**: 多稳态并行探索管理

**核心逻辑**:
```
活跃度 = 1 - (daysSinceActive / 7)
连贯性 = internalEdges / maxPossibleEdges
涌现潜力 = 能量均值 + 类型多样性
停滞风险 = (1-活跃度)*0.5 + (1-涌现潜力)*0.5
```

**相变检测**: 连接爆发、洞察火花、能量转移、模式识别

---

### 4. 反脆弱性引擎 (antifragile.ts)

**职责**: 可控冲击训练，认知弹性计算

**适应分数公式**:
```
舒适分数 = 1 - |不适度 - 0.55| * 2
生产力分数 = min(1, (洞察数 + 连接数) / 5)
适应分数 = 舒适分数 * 0.4 + 生产力分数 * 0.6
```

---

### 5. AI 服务 (ai/)

**架构**: 提供者模式，支持多后端

**默认**: Ollama 本地模型
```
端点: http://localhost:11434/api/chat
模型: llama3.2
参数: temperature=0.7, maxTokens=2048
```

**功能**:
- generateNodeInsight: 节点智能分析
- recommendConnections: 连接推荐
- generateExplorationAdvice: 探索建议
- generateFramework: 意义框架生成

---

### 6. 网络分析 (networkAnalysis/)

#### 中心性分析 (centrality.ts)

| 算法 | 复杂度 | 实现方法 |
|------|--------|----------|
| Degree | O(N) | 直接计数 |
| Closeness | O(N*(N+E)) | Dijkstra |
| Betweenness | O(N*(N+E)) | 最短路径累积 |
| Eigenvector | O(N^2 * iterations) | 幂迭代 |
| PageRank | O(N * iterations) | 迭代收敛 |

#### 社区发现 (communityDetection.ts)

| 算法 | 特点 | 复杂度 |
|------|------|--------|
| Louvain | 模块度优化 | O(N log N) |
| Label Propagation | 快速近似 | O(N + E) |

---

### 7. 搜索引擎 (search/)

**实现**: 倒排索引 + 模糊匹配

**模糊算法**: Levenshtein 距离
```typescript
function levenshteinDistance(str1, str2):
  动态规划矩阵
  返回编辑距离
```

**评分系统**:
- 精确匹配 > 模糊匹配
- 名称 > 标签 > 描述 > 类型
- 历史搜索加权

---

## 数据流

```
User Action
    │
    ▼
┌─────────────┐
│   UI Layer  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Zustand   │
│    Store    │
└──────┬──────┘
       │
       ├──► Core Algorithms
       │
       ▼
┌─────────────┐
│  Electron   │
│     IPC     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   JSON DB   │
│   (Local)   │
└─────────────┘
```

---

## 存储架构

### 本地存储
```
%APPDATA%/HoloTraveller/
└── holotraveller-data.json
```

### 数据结构
```json
{
  "nodes": [...],
  "edges": [...],
  "threads": [...],
  "trajectories": [...],
  "frameworks": [...],
  "antifragilityProfile": {...}
}
```

---

## 性能优化策略

### 1. 计算优化
- 使用 Map/Set 替代数组查找: O(N) → O(1)
- 异步保存: 避免阻塞 UI
- 幂迭代: 特征向量计算的收敛优化

### 2. 渲染优化
- React Flow 虚拟化: 只渲染可见节点
- Zustand 选择器: 精确状态订阅
- useMemo/useCallback: 避免不必要重渲染

### 3. 存储优化
- 增量保存: 只修改变更的数据
- 防抖: 频繁操作的合并

---

## 扩展点

### 1. AI 提供者
```typescript
interface AIProvider {
  chat(messages: Message[]): Promise<AIResponse>
  generateEmbedding(text: string): Promise<number[]>
}
```

### 2. 布局算法
```typescript
interface LayoutAlgorithm {
  layout(nodes: Node[], edges: Edge[]): PositionMap
}
```

### 3. 导入/导出格式
```typescript
interface ImportFormat {
  parse(content: string): ImportedNode[]
  export(nodes: Node[]): string
}
```

---

## 安全考虑

1. **数据安全**: 本地存储，不上传云端
2. **AI 隐私**: 默认本地模型，数据不离开本机
3. **输入验证**: 所有 IPC 调用参数校验
4. **XSS 防护**: React 自动转义

---

## 测试策略

### 单元测试
- 算法模块: 核心计算逻辑
- 工具函数: 纯函数测试

### 集成测试
- 数据流: 操作 → 状态 → 存储
- IPC: 主进程 ↔ 渲染进程

### E2E 测试
- 用户场景: 创建节点 → 建立连接 → 分析

---

文档版本: 1.0
最后更新: 2026-04-10
