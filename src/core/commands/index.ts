import { createNavigationCommands } from './navigationCommands'
import { createCreationCommands } from './creationCommands'
import { createActionCommands } from './actionCommands'
import type { Command, CommandGroup, CommandHistory } from './types'

class CommandRegistry {
  private commands: Command[] = []
  private history: CommandHistory[] = []
  private maxHistory = 20

  register(commands: Command[]) {
    this.commands.push(...commands)
  }

  getAllCommands(): Command[] {
    return this.commands
  }

  getCommandsByCategory(category: string): Command[] {
    return this.commands.filter(cmd => cmd.category === category)
  }

  executeCommand(commandId: string) {
    const command = this.commands.find(cmd => cmd.id === commandId)
    if (command && !command.disabled) {
      command.execute()
      this.addToHistory(commandId)
      return true
    }
    return false
  }

  private addToHistory(commandId: string) {
    // Remove if already exists
    this.history = this.history.filter(h => h.commandId !== commandId)
    
    this.history.unshift({
      id: Math.random().toString(36).substr(2, 9),
      commandId,
      timestamp: Date.now(),
    })

    // Keep only recent history
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory)
    }
  }

  getRecentCommands(): Command[] {
    return this.history
      .map(h => this.commands.find(cmd => cmd.id === h.commandId))
      .filter((cmd): cmd is Command => cmd !== undefined)
  }

  clearHistory() {
    this.history = []
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry()

// Initialize commands
export function initializeCommands() {
  commandRegistry.register(createNavigationCommands())
  commandRegistry.register(createCreationCommands())
  commandRegistry.register(createActionCommands())
}

export type { Command, CommandGroup, CommandHistory }
export { createNavigationCommands, createCreationCommands, createActionCommands }
