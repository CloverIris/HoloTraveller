# HoloTraveller API 文档

## 核心算法 API

### Chaos (混沌分析)

```typescript
import { 
  calculateChaosMetrics, 
  determineCognitivePhase, 
  generateNavigationSuggestion 
} from '@/core/chaos'

// 计算混沌度量
const metrics = calculateChaosMetrics(nodes, edges)
// 返回: { orderDegree, chaosDegree, connectivity, clustering, entropy }

// 判定认知相态
const phase = determineCognitivePhase(metrics)
// 返回: 'rigid_order' | 'edge_of_chaos' | 'disordered_chaos' | 'transition'

// 生成导航建议
const navigation = generateNavigationSuggestion(phase, metrics, nodes, edges)
// 返回: { currentPhase, recommendedAction, turbulenceLevel, creativeZoneProximity }
```

### Threads (线程管理)

```typescript
import { 
  canCreateThread, 
  createThread, 
  calculateThreadMetrics,
  detectPhaseTransition 
} from '@/core/threads'

// 检查是否可以创建线程
const check = canCreateThread(threads)
// 返回: { allowed: boolean, reason?: string }

// 创建线程
const thread = createThread(name, description, type, priority)

// 计算线程指标
const metrics = calculateThreadMetrics(thread, nodes, edges)
// 返回: { threadId, activityScore, coherenceScore, emergenceScore, stagnationRisk }

// 检测相变信号
const { signal, updatedThread } = detectPhaseTransition(thread, nodes, edges)
```

### AI Service (AI 服务)

```typescript
import { aiService } from '@/core/ai/aiService'

// 配置 AI
aiService.setConfig({
  provider: 'ollama',
  model: 'llama3.2',
  baseUrl: 'http://localhost:11434',
  temperature: 0.7
})

// 生成节点洞察
const insight = await aiService.generateNodeInsight(node, connectedNodes)
// 返回: { summary, keyConcepts, potentialConnections, suggestedTags }

// 推荐连接
const recommendations = await aiService.recommendConnections(
  sourceNode, candidateNodes, existingEdges
)
// 返回: [{ sourceId, targetId, reason, strength }]

// 生成探索建议
const advice = await aiService.generateExplorationAdvice(
  nodes, edges, currentPhase
)
// 返回: { advice, suggestedNodes }

// 生成意义框架
const framework = await aiService.generateFramework(nodes)
// 返回: { title, content, coreConflict }
```

### Network Analysis (网络分析)

```typescript
import { 
  calculateAllCentrality, 
  getKeyNodes,
  detectCommunitiesLouvain,
  detectCommunitiesLabelPropagation
} from '@/core/networkAnalysis'

// 计算所有中心性指标
const centrality = calculateAllCentrality(nodes, edges)
// 返回: Map<nodeId, { degree, betweenness, closeness, eigenvector, pagerank }>

// 获取关键节点
const keyNodes = getKeyNodes(nodes, edges, topN)
// 返回: [{ node, score, metrics }]

// 社区发现 (Louvain)
const communities = detectCommunitiesLouvain(nodes, edges, resolution)
// 返回: [{ id, nodes, density, cohesion }]

// 社区发现 (标签传播)
const communities = detectCommunitiesLabelPropagation(nodes, edges)
```

### Search (搜索)

```typescript
import { searchEngine } from '@/core/search/searchEngine'

// 搜索节点
const results = searchEngine.searchNodes(nodes, {
  query: 'keyword',
  types: ['concept', 'goal'],
  tags: ['important'],
  fuzzy: true,
  threshold: 0.6
})
// 返回: [{ item, type, score, highlights }]

// 统一搜索
const results = searchEngine.searchAll(
  { nodes, edges, threads, frameworks },
  { query: 'keyword' }
)

// 获取搜索建议
const suggestions = searchEngine.getSuggestions(query, nodes, threads)

// 获取搜索历史
const history = searchEngine.getHistory()
```

### Timeline (时间线)

```typescript
import { 
  generateTimeline, 
  generateActivityHeatmap,
  snapshotManager 
} from '@/core/timeline/timelineGenerator'

// 生成时间线
const events = generateTimeline(nodes, edges, threads, frameworks, shocks)
// 返回: TimelineEvent[]

// 生成活动热力图
const heatmap = generateActivityHeatmap(events, days)
// 返回: [{ date, count, events }]

// 创建快照
const snapshot = snapshotManager.createSnapshot(label, nodes, edges, metrics)

// 获取所有快照
const snapshots = snapshotManager.getSnapshots()
```

### Shortcuts (快捷键)

```typescript
import { shortcutManager, DEFAULT_SHORTCUTS } from '@/core/keyboard/shortcutManager'

// 注册快捷键
shortcutManager.register({
  id: 'my-shortcut',
  key: 's',
  modifiers: ['ctrl'],
  description: '保存',
  action: () => console.log('saved')
})

// 注册命令
shortcutManager.registerCommand({
  id: 'save',
  title: '保存',
  description: '保存当前数据',
  shortcut: 'Ctrl+S',
  action: () => saveData(),
  category: '文件'
})

// 搜索命令
const commands = shortcutManager.searchCommands('save')

// 执行命令
shortcutManager.executeCommand('save')
```

### Import/Export (导入导出)

```typescript
import { 
  importFromMarkdown, 
  exportToMarkdown,
  exportToObsidian,
  parseObsidianVault 
} from '@/core/importExport/markdownImporter'

// 从 Markdown 导入
const imported = importFromMarkdown(content, {
  splitHeaders: true,
  tagPattern: '#(\\w+)'
})
// 返回: ImportedNode[]

// 导出为 Markdown
const markdown = exportToMarkdown(nodes)

// 导出为 Obsidian 格式
const obsidian = exportToObsidian(nodes, edges)

// 解析 Obsidian Vault
const nodes = await parseObsidianVault(fileList)
```

---

## 状态管理 API

```typescript
import { useAppStore } from '@/stores/appStore'

function MyComponent() {
  const { 
    nodes, edges, threads, frameworks,
    addNode, updateNode, removeNode,
    addEdge, removeEdge,
    addThread, updateThread,
    setNavigationState,
    loadAllData
  } = useAppStore()

  // 加载数据
  useEffect(() => {
    loadAllData()
  }, [])

  // 创建节点
  const handleCreate = async (nodeData) => {
    const node = await window.electronAPI.db.createNode(nodeData)
    addNode(node)
  }
}
```

---

## Electron IPC API

```typescript
// 节点操作
window.electronAPI.db.getNodes()
window.electronAPI.db.createNode(node)
window.electronAPI.db.updateNode(node)
window.electronAPI.db.deleteNode(id)

// 边操作
window.electronAPI.db.getEdges()
window.electronAPI.db.createEdge(edge)
window.electronAPI.db.deleteEdge(id)

// 线程操作
window.electronAPI.db.getThreads()
window.electronAPI.db.createThread(thread)
window.electronAPI.db.updateThread(thread)
window.electronAPI.db.deleteThread(id)

// 框架操作
window.electronAPI.db.getFrameworks()
window.electronAPI.db.createFramework(framework)
window.electronAPI.db.updateFramework(framework)
window.electronAPI.db.deleteFramework(id)

// 反脆弱性
window.electronAPI.db.getAntifragilityProfile()
window.electronAPI.db.createShock(shock)
window.electronAPI.db.createAdaptation(adaptation)

// 对话框
window.electronAPI.dialog.showOpen(options)
window.electronAPI.dialog.showSave(options)

// 应用信息
window.electronAPI.app.getVersion()
window.electronAPI.app.getPath(name)
```

---

## 类型定义

```typescript
import type { 
  Node, Edge, Thread, Trajectory,
  CognitiveFramework, AntifragilityProfile,
  NavigationState, CognitivePhase,
  ChaosMetrics, CentralityMetrics,
  TimelineEvent, SearchResult
} from '@/types'
```

---

文档版本: 1.0
最后更新: 2026-04-10
