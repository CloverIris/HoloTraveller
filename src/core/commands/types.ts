import type { LucideIcon } from 'lucide-react'

export type CommandCategory = 
  | 'navigation' 
  | 'creation' 
  | 'search' 
  | 'action' 
  | 'recent' 
  | 'favorite'

export interface Command {
  id: string
  title: string
  subtitle?: string
  icon?: LucideIcon
  shortcut?: string
  keywords: string[]
  category: CommandCategory
  badge?: string
  disabled?: boolean
  execute: () => void
}

export interface CommandGroup {
  category: CommandCategory
  label: string
  commands: Command[]
}

export interface CommandHistory {
  id: string
  commandId: string
  timestamp: number
}
