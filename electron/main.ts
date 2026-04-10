import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { DatabaseManager } from './dbManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let dbManager: DatabaseManager | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const initDatabase = () => {
  const userDataPath = app.getPath('userData')
  dbManager = new DatabaseManager(userDataPath)
  dbManager.init()
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('db:getNodes', async () => {
  return dbManager?.getNodes() || []
})

ipcMain.handle('db:createNode', async (_, node) => {
  return dbManager?.createNode(node)
})

ipcMain.handle('db:updateNode', async (_, node) => {
  return dbManager?.updateNode(node)
})

ipcMain.handle('db:deleteNode', async (_, id) => {
  return dbManager?.deleteNode(id)
})

ipcMain.handle('db:getEdges', async () => {
  return dbManager?.getEdges() || []
})

ipcMain.handle('db:createEdge', async (_, edge) => {
  return dbManager?.createEdge(edge)
})

ipcMain.handle('db:deleteEdge', async (_, id) => {
  return dbManager?.deleteEdge(id)
})

ipcMain.handle('db:getThreads', async () => {
  return dbManager?.getThreads() || []
})

ipcMain.handle('db:createThread', async (_, thread) => {
  return dbManager?.createThread(thread)
})

ipcMain.handle('db:updateThread', async (_, thread) => {
  return dbManager?.updateThread(thread)
})

ipcMain.handle('db:deleteThread', async (_, id) => {
  return dbManager?.deleteThread(id)
})

ipcMain.handle('db:getTrajectories', async () => {
  return dbManager?.getTrajectories() || []
})

ipcMain.handle('db:createTrajectory', async (_, trajectory) => {
  return dbManager?.createTrajectory(trajectory)
})

ipcMain.handle('db:updateTrajectory', async (_, trajectory) => {
  return dbManager?.updateTrajectory(trajectory)
})

ipcMain.handle('db:getFrameworks', async () => {
  return dbManager?.getFrameworks() || []
})

ipcMain.handle('db:createFramework', async (_, framework) => {
  return dbManager?.createFramework(framework)
})

ipcMain.handle('db:updateFramework', async (_, framework) => {
  return dbManager?.updateFramework(framework)
})

ipcMain.handle('db:deleteFramework', async (_, id) => {
  return dbManager?.deleteFramework(id)
})

ipcMain.handle('db:getAntifragilityProfile', async () => {
  return dbManager?.getAntifragilityProfile()
})

ipcMain.handle('db:createShock', async (_, shock) => {
  return dbManager?.createShock(shock)
})

ipcMain.handle('db:createAdaptation', async (_, adaptation) => {
  return dbManager?.createAdaptation(adaptation)
})

ipcMain.handle('dialog:showOpen', async (_, options) => {
  if (!mainWindow) return { canceled: true, filePaths: [] }
  const result = await dialog.showOpenDialog(mainWindow, options)
  return result
})

ipcMain.handle('dialog:showSave', async (_, options) => {
  if (!mainWindow) return { canceled: true, filePath: '' }
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

ipcMain.handle('app:getPath', (_, name) => {
  return app.getPath(name as any)
})
