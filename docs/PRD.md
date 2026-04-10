# HoloTraveller | 涨落旅者 - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位
HoloTraveller 是一款融合复杂系统理论与不确定性管理的个人探索导航系统，旨在为用户提供一种全新的存在方式，帮助用户在不确定的海洋中建立临时的锚点，在信息的湍流中保持航向。

### 1.2 核心哲学
- **涨落中学习**: 真正的探索不是沿着最优路径滑行，而是在涨落中学习
- **混沌边缘**: 复杂系统在秩序与混沌的边界展现最大的演化潜力
- **临时锚点**: 对抗后现代虚无的关键是建立可撤回的坚定
- **情境化导航**: 提供局部、情境化、可操作的下一步
- **主动秩序**: 帮你在特定时刻生成临时的意义结构

### 1.3 目标用户
- 知识工作者
- 复杂问题研究者
- 终身学习者
- 创意工作者
- 面临信息过载的专业人士

---

## 2. 核心功能需求

### 2.1 混沌边缘导航 (Edge-of-Chaos Navigation)

**功能描述**: 基于网络结构识别当前认知相态，推荐行动。

**算法需求**:
- 秩序度计算 (Order Degree): 基于聚类系数、连通度、网络熵
- 混乱度计算 (Chaos Degree): 基于连通缺失、高熵值
- 认知相态判定: rigid_order, edge_of_chaos, disordered_chaos, transition
- 创造性湍流区距离计算
- 湍流级别计算

**输出**:
- 当前相态标签
- 距离创造性湍流区百分比
- 推荐行动 (类型、描述、预期结果、不确定性级别)

---

### 2.2 涨落适应性路径 (Fluctuation-Adaptive Pathing)

**功能描述**: 生成多条概率化轨迹，支持轨迹重构。

**算法需求**:
- 带权重的路径探索 (DFS 改进)
- 涨落区间计算 (基于混沌亲和力)
- 路径概率计算 (基于边强度)
- 轨迹重构算法 (偏差吸收)

**输出**:
- 多条可选路径
- 每条路径的概率、期望值、涨落区间
- 实际偏离时的重构建议

---

### 2.3 多稳态并行探索 (Multi-Stable Parallel Exploration)

**功能描述**: 同时维护 3-5 条并行探索线程。

**功能需求**:
- 线程创建、激活、休眠、归档
- 线程指标计算: 活跃度、连贯性、涌现潜力、停滞风险
- 相变信号检测: 连接爆发、洞察火花、能量转移、模式识别
- 资源分配建议
- 自动休眠 (14天无活动)

**约束**:
- 最大并行线程数: 5
- 信号冷却期: 24小时
- 最大信号保留数: 20

---

### 2.4 临时意义结构 (Temporary Meaning Structure)

**功能描述**: 生成临时的认知框架。

**功能需求**:
- 框架创建 (标题、内容、核心冲突、暂时关注)
- 半衰期机制 (默认7天)
- 自动过期检测
- 过期提醒

**字段**:
- title, content
- context: { timeRange, focusAreas, coreConflict, temporaryFocus }
- halfLife, expiresAt, status

---

### 2.5 反脆弱性训练 (Antifragility Training)

**功能描述**: 引入可控冲击，记录恢复与成长。

**功能需求**:
- 5种冲击类型: random_jump, timeline_shuffle, perspective_flip, constraint_add, resource_limit
- 冲击强度自适应 (基于认知弹性)
- 适应分数计算
- 认知弹性系数计算
- 成长曲线分析

**输出**:
- 冲击推荐 (基于弹性水平)
- 成长趋势报告
- 最有效的冲击类型统计

---

## 3. 高级功能需求

### 3.1 AI 集成系统

**技术方案**: 本地 LLM (Ollama) + 可选云端

**功能需求**:
- 节点智能摘要
- 连接推荐
- 探索建议生成
- 意义框架自动生成
- 对话式探索界面

**配置**:
- 默认模型: llama3.2
- 服务端点: http://localhost:11434
- 参数: temperature, maxTokens

---

### 3.2 高级网络分析

**中心性分析 (5种)**:
- 度中心性 (Degree)
- 介数中心性 (Betweenness) - 使用 Dijkstra + 累积依赖
- 接近中心性 (Closeness)
- 特征向量中心性 (Eigenvector) - 幂迭代法
- PageRank

**社区发现 (2种)**:
- Louvain 算法 - 模块度优化
- 标签传播算法

**附加分析**:
- 结构洞检测
- 桥梁节点识别
- 模块度计算

---

### 3.3 智能搜索系统

**搜索能力**:
- 全文搜索 (名称、描述、标签)
- 模糊搜索 (Levenshtein 距离)
- 高级过滤 (类型、时间、能量、混沌亲和力)
- 搜索建议 (标签、历史、节点名)
- 搜索历史 (保存20条)

**评分权重**:
- 名称匹配: 20分
- 标签匹配: 15分/个
- 描述匹配: 10分
- 类型匹配: 5分

---

### 3.4 时间线与历史回溯

**事件类型 (12种)**:
- node_created, node_updated, node_visited
- edge_created, edge_deleted
- thread_created, thread_updated, thread_phase_transition
- framework_created, framework_expired
- shock_completed, trajectory_reconstructed

**功能**:
- 探索时间线
- 活动热力图 (GitHub风格)
- 历史快照管理
- 统计摘要 (最活跃日、连续活跃天数)

---

### 3.5 快捷键系统

**快捷键 (17个)**:
| 快捷键 | 功能 |
|--------|------|
| Ctrl+K | 命令面板 |
| Ctrl+P | 快速打开 |
| Ctrl+N | 新建节点 |
| Ctrl+F | 搜索 |
| Ctrl+G | 跳转到节点 |
| Ctrl+B | 切换侧边栏 |
| Ctrl+1/2/3/4 | 切换视图 |
| Ctrl+Shift+I | 生成洞察 |
| Ctrl+S | 保存快照 |
| Ctrl+Shift+E | 导出数据 |
| Ctrl+O | 导入数据 |
| Escape | 取消/关闭 |

---

### 3.6 数据导入导出

**导入支持**:
- Markdown (基础)
- Obsidian Vault (双向链接、YAML frontmatter、标签)
- 智能类型推断

**导出支持**:
- Markdown
- Obsidian 格式
- JSON (完整备份)

---

## 4. 技术架构

### 4.1 技术栈
- **前端**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **可视化**: React Flow
- **桌面**: Electron 28
- **存储**: JSON 文件 (本地)

### 4.2 项目结构
```
src/
├── components/          # UI 组件
├── core/               # 核心算法
│   ├── ai/            # AI 服务
│   ├── networkAnalysis/ # 网络分析
│   ├── search/        # 搜索引擎
│   ├── timeline/      # 时间线
│   ├── keyboard/      # 快捷键
│   ├── importExport/  # 导入导出
│   ├── chaos.ts       # 混沌分析
│   ├── pathing.ts     # 路径规划
│   ├── threads.ts     # 线程管理
│   └── antifragile.ts # 反脆弱性
├── stores/            # 状态管理
├── types/             # 类型定义
└── lib/               # 工具函数
```

### 4.3 性能要求
- 首次加载 < 3秒
- 节点操作响应 < 100ms
- 支持 1000+ 节点流畅运行
- 搜索响应 < 200ms

---

## 5. 数据模型

### 5.1 节点 (Node)
```typescript
interface Node {
  id: string
  label: string
  type: 'concept' | 'goal' | 'milestone' | 'exploration' | 'insight' | 'thread'
  description?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  x?: number
  y?: number
  metadata: {
    importance: number      // 0-1
    stability: number       // 0-1
    chaosAffinity: number   // 0-1
    energyLevel: number     // 0-1
    lastVisited?: Date
    visitCount: number
  }
}
```

### 5.2 边 (Edge)
```typescript
interface Edge {
  id: string
  source: string
  target: string
  type: 'association' | 'dependency' | 'sequence' | 'contrast' | 'emergence'
  strength: number  // 0-1
  createdAt: Date
  metadata?: {
    activationCount: number
    lastActivated?: Date
    emotionalWeight?: number
  }
}
```

### 5.3 线程 (Thread)
```typescript
interface Thread {
  id: string
  name: string
  description?: string
  type: 'main' | 'side' | 'experiment' | 'roaming'
  status: 'active' | 'hibernating' | 'archived' | 'transformed'
  priority: number  // 0-1
  emergencePotential: number
  nodeIds: string[]
  trajectoryIds: string[]
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date
  phaseTransitionSignals: PhaseTransitionSignal[]
}
```

---

## 6. 验收标准

### 6.1 功能验收
- [ ] 所有核心功能可用
- [ ] AI 服务可配置
- [ ] 网络分析提供 5 种中心性
- [ ] 搜索支持模糊匹配
- [ ] 时间线记录 12 种事件
- [ ] 快捷键响应正常
- [ ] 导入导出功能完整

### 6.2 性能验收
- [ ] 应用启动 < 3秒
- [ ] 基本操作响应 < 100ms
- [ ] 搜索响应 < 200ms
- [ ] 1000节点不卡顿

### 6.3 质量验收
- [ ] TypeScript 无错误
- [ ] 无运行时错误
- [ ] 数据一致性保证
- [ ] 边界情况处理

---

## 7. 发布计划

### v0.1.0 (基础版)
- 核心功能完整
- 基础 UI
- 数据持久化

### v0.2.0 (高级版) ✅ 当前
- AI 集成
- 网络分析
- 智能搜索
- 时间线
- 快捷键
- 导入导出

### v0.3.0 (未来)
- 3D 可视化
- 意图预测
- 插件系统
- 实时协作

---

## 8. 附录

### 8.1 相关概念
- **复杂系统**: 由大量相互作用的组件组成的系统
- **混沌边缘**: 秩序与混沌的边界，创新最活跃的区域
- **反脆弱性**: 从冲击中受益的特性
- **涌现**: 整体大于部分之和的现象

### 8.2 参考资源
- 《复杂》梅拉妮·米歇尔
- 《反脆弱》纳西姆·塔勒布
- 《思考，快与慢》丹尼尔·卡尼曼

---

文档版本: 1.0
最后更新: 2026-04-10
