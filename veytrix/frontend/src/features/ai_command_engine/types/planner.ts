import { AICommand } from './commands';

export interface PlannedSubAction {
  id: string;
  actionName: string;
  command: AICommand;
  reasoning: string;
}

export interface GoalPlan {
  goalId: string;
  goalName: string;
  description: string;
  reasoning: string;
  subActions: PlannedSubAction[];
  estimatedSteps: number;
}

export interface GoalPlanningResult {
  matched: boolean;
  plan?: GoalPlan;
  error?: string;
}
