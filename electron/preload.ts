import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  db: {
    getNodes: () => ipcRenderer.invoke('db:getNodes'),
    createNode: (node: any) => ipcRenderer.invoke('db:createNode', node),
    updateNode: (node: any) => ipcRenderer.invoke('db:updateNode', node),
    deleteNode: (id: string) => ipcRenderer.invoke('db:deleteNode', id),
    getEdges: () => ipcRenderer.invoke('db:getEdges'),
    createEdge: (edge: any) => ipcRenderer.invoke('db:createEdge', edge),
    deleteEdge: (id: string) => ipcRenderer.invoke('db:deleteEdge', id),
    getThreads: () => ipcRenderer.invoke('db:getThreads'),
    createThread: (thread: any) => ipcRenderer.invoke('db:createThread', thread),
    updateThread: (thread: any) => ipcRenderer.invoke('db:updateThread', thread),
    deleteThread: (id: string) => ipcRenderer.invoke('db:deleteThread', id),
    getTrajectories: () => ipcRenderer.invoke('db:getTrajectories'),
    createTrajectory: (trajectory: any) => ipcRenderer.invoke('db:createTrajectory', trajectory),
    updateTrajectory: (trajectory: any) => ipcRenderer.invoke('db:updateTrajectory', trajectory),
    getFrameworks: () => ipcRenderer.invoke('db:getFrameworks'),
    createFramework: (framework: any) => ipcRenderer.invoke('db:createFramework', framework),
    updateFramework: (framework: any) => ipcRenderer.invoke('db:updateFramework', framework),
    deleteFramework: (id: string) => ipcRenderer.invoke('db:deleteFramework', id),
    getAntifragilityProfile: () => ipcRenderer.invoke('db:getAntifragilityProfile'),
    createShock: (shock: any) => ipcRenderer.invoke('db:createShock', shock),
    createAdaptation: (adaptation: any) => ipcRenderer.invoke('db:createAdaptation', adaptation),
  },
  dialog: {
    showOpen: (options: any) => ipcRenderer.invoke('dialog:showOpen', options),
    showSave: (options: any) => ipcRenderer.invoke('dialog:showSave', options),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
  },
})

declare global {
  interface Window {
    electronAPI: {
      db: {
        getNodes: () => Promise<any[]>
        createNode: (node: any) => Promise<any>
        updateNode: (node: any) => Promise<any>
        deleteNode: (id: string) => Promise<void>
        getEdges: () => Promise<any[]>
        createEdge: (edge: any) => Promise<any>
        deleteEdge: (id: string) => Promise<void>
        getThreads: () => Promise<any[]>
        createThread: (thread: any) => Promise<any>
        updateThread: (thread: any) => Promise<any>
        deleteThread: (id: string) => Promise<void>
        getTrajectories: () => Promise<any[]>
        createTrajectory: (trajectory: any) => Promise<any>
        updateTrajectory: (trajectory: any) => Promise<any>
        getFrameworks: () => Promise<any[]>
        createFramework: (framework: any) => Promise<any>
        updateFramework: (framework: any) => Promise<any>
        deleteFramework: (id: string) => Promise<void>
        getAntifragilityProfile: () => Promise<any>
        createShock: (shock: any) => Promise<any>
        createAdaptation: (adaptation: any) => Promise<any>
      }
      dialog: {
        showOpen: (options: any) => Promise<any>
        showSave: (options: any) => Promise<any>
      }
      app: {
        getVersion: () => Promise<string>
        getPath: (name: string) => Promise<string>
      }
    }
  }
}
