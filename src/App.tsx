import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { NetworkGraph } from '@/components/graph/NetworkGraph'
import { ChaosNavigator } from '@/components/navigation/ChaosNavigator'
import { ThreadPanel } from '@/components/navigation/ThreadPanel'
import { FrameworkPanel } from '@/components/navigation/FrameworkPanel'
import { AntifragilityPanel } from '@/components/navigation/AntifragilityPanel'
import { NodeDetail } from '@/components/NodeDetail'
import { CreateNodeDialog } from '@/components/CreateNodeDialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Compass, Layers, Clock, Shield, Network, Menu, X } from 'lucide-react'
import './index.css'

function App() {
  const { loadAllData, isLoading, selectedNodeId, viewMode, setViewMode } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r bg-card transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h1 className="text-lg font-bold">HoloTraveller</h1>
            <p className="text-xs text-muted-foreground">涨落旅者</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="network">
                <Network className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="threads">
                <Layers className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="frameworks">
                <Clock className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="antifragility">
                <Shield className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="network" className="mt-0 space-y-4">
              <ChaosNavigator />
            </TabsContent>

            <TabsContent value="threads" className="mt-0">
              <ThreadPanel />
            </TabsContent>

            <TabsContent value="frameworks" className="mt-0">
              <FrameworkPanel />
            </TabsContent>

            <TabsContent value="antifragility" className="mt-0">
              <AntifragilityPanel />
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t p-4">
          <CreateNodeDialog />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <header className="flex items-center justify-between border-b bg-card px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <span className="text-sm text-muted-foreground">
              {viewMode === 'network' && '网络视图'}
              {viewMode === 'threads' && '线程管理'}
              {viewMode === 'frameworks' && '意义结构'}
              {viewMode === 'antifragility' && '反脆弱训练'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Compass className="mr-1 h-4 w-4" />
              导航
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            <NetworkGraph />
          </div>
          
          {selectedNodeId && (
            <div className="w-80 border-l bg-card">
              <NodeDetail />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
