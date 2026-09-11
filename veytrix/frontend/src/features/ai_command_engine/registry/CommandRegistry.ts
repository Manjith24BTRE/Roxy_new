import { ICommandModule } from '../commands/base/types';

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, ICommandModule> = new Map();

  public static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  public register(command: ICommandModule): void {
    this.commands.set(command.metadata.id, command);
  }

  public get(commandId: string): ICommandModule | undefined {
    return this.commands.get(commandId);
  }

  public getAll(): ICommandModule[] {
    return Array.from(this.commands.values());
  }

  public findMatchingCommand(prompt: string, context?: any): { module: ICommandModule; match: any } | null {
    let bestMatch: { module: ICommandModule; match: any } | null = null;
    let highestConfidence = 0;

    for (const mod of this.commands.values()) {
      const match = mod.parse(prompt, context);
      if (match.matched && match.confidence > highestConfidence) {
        highestConfidence = match.confidence;
        bestMatch = { module: mod, match };
      }
    }

    return bestMatch;
  }
}
