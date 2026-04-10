import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

interface DataStore {
  nodes: any[]
  edges: any[]
  threads: any[]
  trajectories: any[]
  frameworks: any[]
  antifragilityProfile: any
}

export class DatabaseManager {
  private dbPath: string
  private data: DataStore

  constructor(userDataPath: string) {
    this.dbPath = path.join(userDataPath, 'holotraveller-data.json')
    this.data = {
      nodes: [],
      edges: [],
      threads: [],
      trajectories: [],
      frameworks: [],
      antifragilityProfile: null,
    }
  }

  async init() {
    try {
      const content = await fs.readFile(this.dbPath, 'utf-8')
      this.data = JSON.parse(content)
    } catch {
      // File doesn't exist, use default empty data
      this.data.antifragilityProfile = {
        id: uuidv4(),
        userId: 'default',
        elasticityScore: 0.5,
        shocks: [],
        adaptations: [],
        recoveryCurve: [],
        updatedAt: new Date().toISOString(),
      }
      await this.save()
    }
  }

  private async save() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2))
  }

  // Nodes
  async getNodes() {
    return this.data.nodes.map(n => ({ ...n, createdAt: new Date(n.createdAt), updatedAt: new Date(n.updatedAt) }))
  }

  async createNode(node: any) {
    const newNode = {
      ...node,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.data.nodes.unshift(newNode)
    await this.save()
    return { ...newNode, createdAt: new Date(newNode.createdAt), updatedAt: new Date(newNode.updatedAt) }
  }

  async updateNode(node: any) {
    const index = this.data.nodes.findIndex(n => n.id === node.id)
    if (index >= 0) {
      this.data.nodes[index] = { ...node, updatedAt: new Date().toISOString() }
      await this.save()
    }
    return node
  }

  async deleteNode(id: string) {
    this.data.nodes = this.data.nodes.filter(n => n.id !== id)
    this.data.edges = this.data.edges.filter(e => e.source !== id && e.target !== id)
    await this.save()
  }

  // Edges
  async getEdges() {
    return this.data.edges.map(e => ({ ...e, createdAt: new Date(e.createdAt) }))
  }

  async createEdge(edge: any) {
    const newEdge = {
      ...edge,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }
    this.data.edges.unshift(newEdge)
    await this.save()
    return { ...newEdge, createdAt: new Date(newEdge.createdAt) }
  }

  async deleteEdge(id: string) {
    this.data.edges = this.data.edges.filter(e => e.id !== id)
    await this.save()
  }

  // Threads
  async getThreads() {
    return this.data.threads.map(t => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      lastActiveAt: new Date(t.lastActiveAt),
    }))
  }

  async createThread(thread: any) {
    const now = new Date().toISOString()
    const newThread = {
      ...thread,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    }
    this.data.threads.unshift(newThread)
    await this.save()
    return {
      ...newThread,
      createdAt: new Date(newThread.createdAt),
      updatedAt: new Date(newThread.updatedAt),
      lastActiveAt: new Date(newThread.lastActiveAt),
    }
  }

  async updateThread(thread: any) {
    const index = this.data.threads.findIndex(t => t.id === thread.id)
    if (index >= 0) {
      this.data.threads[index] = { ...thread, updatedAt: new Date().toISOString() }
      await this.save()
    }
    return thread
  }

  async deleteThread(id: string) {
    this.data.threads = this.data.threads.filter(t => t.id !== id)
    await this.save()
  }

  // Trajectories
  async getTrajectories() {
    return this.data.trajectories.map(t => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }))
  }

  async createTrajectory(trajectory: any) {
    const now = new Date().toISOString()
    const newTrajectory = {
      ...trajectory,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }
    this.data.trajectories.unshift(newTrajectory)
    await this.save()
    return {
      ...newTrajectory,
      createdAt: new Date(newTrajectory.createdAt),
      updatedAt: new Date(newTrajectory.updatedAt),
    }
  }

  async updateTrajectory(trajectory: any) {
    const index = this.data.trajectories.findIndex(t => t.id === trajectory.id)
    if (index >= 0) {
      this.data.trajectories[index] = { ...trajectory, updatedAt: new Date().toISOString() }
      await this.save()
    }
    return trajectory
  }

  // Frameworks
  async getFrameworks() {
    return this.data.frameworks.map(f => ({
      ...f,
      createdAt: new Date(f.createdAt),
      expiresAt: new Date(f.expiresAt),
    }))
  }

  async createFramework(framework: any) {
    const newFramework = {
      ...framework,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      expiresAt: framework.expiresAt ? framework.expiresAt.toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    this.data.frameworks.unshift(newFramework)
    await this.save()
    return {
      ...newFramework,
      createdAt: new Date(newFramework.createdAt),
      expiresAt: new Date(newFramework.expiresAt),
    }
  }

  async updateFramework(framework: any) {
    const index = this.data.frameworks.findIndex(f => f.id === framework.id)
    if (index >= 0) {
      this.data.frameworks[index] = framework
      await this.save()
    }
    return framework
  }

  async deleteFramework(id: string) {
    this.data.frameworks = this.data.frameworks.filter(f => f.id !== id)
    await this.save()
  }

  // Antifragility
  async getAntifragilityProfile() {
    if (!this.data.antifragilityProfile) return null
    return {
      ...this.data.antifragilityProfile,
      updatedAt: new Date(this.data.antifragilityProfile.updatedAt),
      shocks: (this.data.antifragilityProfile.shocks || []).map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp),
      })),
      adaptations: (this.data.antifragilityProfile.adaptations || []).map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      })),
    }
  }

  async createShock(shock: any) {
    const newShock = {
      ...shock,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    }
    if (!this.data.antifragilityProfile) {
      this.data.antifragilityProfile = {
        id: uuidv4(),
        userId: 'default',
        elasticityScore: 0.5,
        shocks: [],
        adaptations: [],
        recoveryCurve: [],
        updatedAt: new Date().toISOString(),
      }
    }
    this.data.antifragilityProfile.shocks = [newShock, ...(this.data.antifragilityProfile.shocks || [])]
    this.data.antifragilityProfile.updatedAt = new Date().toISOString()
    await this.save()
    return { ...newShock, timestamp: new Date(newShock.timestamp) }
  }

  async createAdaptation(adaptation: any) {
    const newAdaptation = {
      ...adaptation,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    }
    if (this.data.antifragilityProfile) {
      this.data.antifragilityProfile.adaptations = [newAdaptation, ...(this.data.antifragilityProfile.adaptations || [])]
      this.data.antifragilityProfile.updatedAt = new Date().toISOString()
      await this.save()
    }
    return { ...newAdaptation, timestamp: new Date(newAdaptation.timestamp) }
  }
}
