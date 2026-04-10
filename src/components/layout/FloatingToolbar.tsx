'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Maximize,
  MousePointer2,
  Hand,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Layout,
  Share2,
  Download,
  Undo2,
  Redo2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonFluent } from '@/components/ui/button-fluent'
import { Acrylic } from '@/components/ui/acrylic'

interface FloatingToolbarProps {
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
  onFitView?: () => void
  showGrid?: boolean
  onToggleGrid?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
}

export function FloatingToolbar({
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitView,
  showGrid = true,
  onToggleGrid,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}: FloatingToolbarProps) {
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'create'>('select')
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
      {/* Main Toolbar */}
      <Acrylic
        intensity="heavy"
        className="flex items-center gap-1 rounded-xl p-1.5 shadow-depth-16 border border-[var(--fluent-stroke-rest)]"
      >
        {/* Tools Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-[var(--fluent-stroke-rest)]">
          <ButtonFluent
            variant={activeTool === 'select' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setActiveTool('select')}
          >
            <MousePointer2 className="h-4 w-4" />
          </ButtonFluent>
          
          <ButtonFluent
            variant={activeTool === 'pan' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setActiveTool('pan')}
          >
            <Hand className="h-4 w-4" />
          </ButtonFluent>

          <ButtonFluent
            variant="ghost"
            size="icon-sm"
            onClick={() => window.dispatchEvent(new CustomEvent('openCreateNodeDialog'))}
            className="text-[var(--fluent-accent-rest)]"
          >
            <Plus className="h-4 w-4" />
          </ButtonFluent>
        </div>

        {/* Zoom Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-[var(--fluent-stroke-rest)]">
          <ButtonFluent variant="ghost" size="icon-sm" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </ButtonFluent>
          
          <button
            onClick={onZoomReset}
            className="min-w-[50px] px-2 py-1 text-xs font-medium text-[var(--fluent-text-secondary)] hover:text-[var(--fluent-text-primary)] rounded-md hover:bg-[var(--fluent-fill-hover)] transition-colors"
          >
            {zoom.toFixed(0)}%
          </button>
          
          <ButtonFluent variant="ghost" size="icon-sm" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </ButtonFluent>

          <ButtonFluent variant="ghost" size="icon-sm" onClick={onFitView}>
            <Maximize className="h-4 w-4" />
          </ButtonFluent>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-0.5 pl-1">
          <ButtonFluent
            variant={showGrid ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={onToggleGrid}
          >
            <Grid3X3 className="h-4 w-4" />
          </ButtonFluent>

          <ButtonFluent
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(isExpanded && "bg-[var(--fluent-fill-hover)]")}
          >
            <Layout className="h-4 w-4" />
          </ButtonFluent>
        </div>
      </Acrylic>

      {/* Expanded Tools */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Acrylic
              intensity="heavy"
              className="flex items-center gap-1 rounded-xl p-1.5 shadow-depth-16 border border-[var(--fluent-stroke-rest)]"
            >
              {/* History */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-[var(--fluent-stroke-rest)]">
                <ButtonFluent
                  variant="ghost"
                  size="icon-sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={cn(!canUndo && "opacity-50")}
                >
                  <Undo2 className="h-4 w-4" />
                </ButtonFluent>
                <ButtonFluent
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className={cn(!canRedo && "opacity-50")}
                >
                  <Redo2 className="h-4 w-4" />
                </ButtonFluent>
              </div>

              {/* Share & Export */}
              <div className="flex items-center gap-0.5 pl-1">
                <ButtonFluent variant="ghost" size="icon-sm">
                  <Share2 className="h-4 w-4" />
                </ButtonFluent>
                <ButtonFluent variant="ghost" size="icon-sm">
                  <Download className="h-4 w-4" />
                </ButtonFluent>
              </div>
            </Acrylic>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
