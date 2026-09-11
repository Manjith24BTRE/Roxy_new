import { EditorContext } from '../types/context';
import { GoalPlan, GoalPlanningResult, PlannedSubAction } from '../types/planner';
import { IntentNormalizer } from '../utils/IntentNormalizer';

export class GoalPlanner {
  /**
   * Deterministically plans complex user goals by analyzing timeline context
   * and applying rule-based multi-action templates without LLMs.
   */
  public static plan(prompt: string, context?: EditorContext): GoalPlanningResult {
    const { normalized } = IntentNormalizer.normalize(prompt);
    const text = normalized.toLowerCase().trim();

    // 1. "make the intro shorter" / "shorten intro" / "trim intro"
    if (
      /\b(make\s+)?(the\s+)?intro\s+(shorter|smaller)\b/i.test(text) ||
      /\b(shorten|trim|cut)\s+(the\s+)?intro\b/i.test(text) ||
      /\bclean\s+up\s+start\b/i.test(text)
    ) {
      return this.planShortenIntro(context);
    }

    // 2. "make this clip more cinematic" / "cinematic look" / "film style"
    if (
      /\b(make\s+)?(this\s+clip\s+)?(more\s+)?cinematic\b/i.test(text) ||
      /\bfilm\s+look\b/i.test(text) ||
      /\bcinematic\s+aesthetic\b/i.test(text)
    ) {
      return this.planCinematicTransformation(context);
    }

    // 3. "make the outro shorter" / "shorten outro" / "trim end"
    if (
      /\b(make\s+)?(the\s+)?outro\s+(shorter|smaller)\b/i.test(text) ||
      /\b(shorten|trim|cut)\s+(the\s+)?outro\b/i.test(text) ||
      /\bclean\s+up\s+finish\b/i.test(text)
    ) {
      return this.planShortenOutro(context);
    }

    // 4. "dramatize audio" / "dramatic sound"
    if (/\b(dramatize|dramatic)\s+sound\b/i.test(text) || /\b(make\s+)?audio\s+dramatic\b/i.test(text)) {
      return this.planDramaticAudio(context);
    }

    // 5. "make punchy teaser" / "teaser speedup"
    if (/\b(punchy|teaser)\b/i.test(text) || /\bmake\s+(a\s+)?teaser\b/i.test(text)) {
      return this.planPunchyTeaser(context);
    }

    // 6. "vlog aesthetic" / "vlog look"
    if (/\bvlog\s+(aesthetic|look|style)\b/i.test(text)) {
      return this.planVlogAesthetic(context);
    }

    // 7. "dramatic slow motion" / "slomo action"
    if (/\b(dramatic\s+)?slow\s+motion\b/i.test(text) || /\bslomo\b/i.test(text)) {
      return this.planSlowMotion(context);
    }

    return { matched: false };
  }

  private static planShortenIntro(context?: EditorContext): GoalPlanningResult {
    // Context Analysis: Find first clip at t=0 or from clipsList
    const targetClipId =
      context?.clipsList && context.clipsList.length > 0
        ? context.clipsList[0].id
        : context?.selectedClipId;

    const trimAmount = 2.5; // Default 2.5s intro trim

    const subActions: PlannedSubAction[] = [
      {
        id: 'action-1',
        actionName: 'Trim Intro',
        command: {
          action: 'trim',
          target: targetClipId,
          start: 0,
          end: trimAmount,
        },
        reasoning: `Identified intro clip at start of timeline. Trimming first ${trimAmount}s.`,
      },
    ];

    const plan: GoalPlan = {
      goalId: 'goal-intro-shorten',
      goalName: 'Shorten Intro',
      description: 'Analyze timeline, identify intro clip, and trim start duration.',
      reasoning: `Timeline Analysis: Located intro clip '${targetClipId || 'first clip'}' at start of sequence. Generated trim plan for first ${trimAmount} seconds.`,
      subActions,
      estimatedSteps: 1,
    };

    return { matched: true, plan };
  }

  private static planCinematicTransformation(context?: EditorContext): GoalPlanningResult {
    const targetClipId = context?.selectedClipId;

    const subActions: PlannedSubAction[] = [
      {
        id: 'action-1',
        actionName: 'Apply Cinematic Filter',
        command: {
          action: 'filter',
          target: targetClipId,
          filterName: 'cinematic',
        },
        reasoning: 'Applied color grade preset "cinematic".',
      },
      {
        id: 'action-2',
        actionName: 'Adjust Contrast',
        command: {
          action: 'effect',
          target: targetClipId,
          effectType: 'contrast',
          intensity: 65,
        },
        reasoning: 'Increased contrast to 65% for deeper shadows.',
      },
      {
        id: 'action-3',
        actionName: 'Adjust Saturation',
        command: {
          action: 'effect',
          target: targetClipId,
          effectType: 'saturation',
          intensity: 40,
        },
        reasoning: 'Desaturated to 40% for filmic tone.',
      },
      {
        id: 'action-4',
        actionName: 'Set Canvas Aspect Ratio',
        command: {
          action: 'aspect_ratio',
          format: '16:9',
        },
        reasoning: 'Formatted canvas to widescreen 16:9 aspect ratio.',
      },
    ];

    const plan: GoalPlan = {
      goalId: 'goal-cinematic-transform',
      goalName: 'Cinematic Transformation',
      description: 'Applies filmic filter, adjusts contrast & saturation, sets widescreen aspect ratio.',
      reasoning: `Context Analysis: Target clip '${targetClipId || 'active clip'}'. Multi-stage preset generated (Filter + Contrast + Saturation + 16:9 Aspect Ratio).`,
      subActions,
      estimatedSteps: 4,
    };

    return { matched: true, plan };
  }

  private static planShortenOutro(context?: EditorContext): GoalPlanningResult {
    const lastClip =
      context?.clipsList && context.clipsList.length > 0
        ? context.clipsList[context.clipsList.length - 1]
        : null;

    const targetClipId = lastClip ? lastClip.id : context?.selectedClipId;
    const clipEnd = lastClip ? lastClip.end : context?.clipDuration || 10;
    const trimAmount = 2.0;

    const subActions: PlannedSubAction[] = [
      {
        id: 'action-1',
        actionName: 'Trim Outro',
        command: {
          action: 'trim',
          target: targetClipId,
          start: Math.max(0, clipEnd - trimAmount),
          end: clipEnd,
        },
        reasoning: `Identified final clip on timeline. Trimming last ${trimAmount}s of outro.`,
      },
    ];

    const plan: GoalPlan = {
      goalId: 'goal-outro-shorten',
      goalName: 'Shorten Outro',
      description: 'Analyze timeline, identify final clip, and trim ending duration.',
      reasoning: `Timeline Analysis: Located final clip '${targetClipId || 'outro clip'}'. Trimming last ${trimAmount} seconds.`,
      subActions,
      estimatedSteps: 1,
    };

    return { matched: true, plan };
  }

  private static planDramaticAudio(context?: EditorContext): GoalPlanningResult {
    const targetClipId = context?.selectedClipId;

    const subActions: PlannedSubAction[] = [
      {
        id: 'action-1',
        actionName: 'Increase Volume',
        command: {
          action: 'volume',
          target: targetClipId,
          value: 1.25,
        },
        reasoning: 'Boosted audio volume to 125%.',
      },
      {
        id: 'action-2',
        actionName: 'Set Audio Fade',
        command: {
          action: 'fade_in',
          target: targetClipId,
          fadeIn: 1.5,
          fadeOut: 2.0,
        },
        reasoning: 'Applied 1.5s fade-in and 2.0s fade-out.',
      },
    ];

    const plan: GoalPlan = {
      goalId: 'goal-dramatic-audio',
      goalName: 'Dramatic Audio Polish',
      description: 'Boosts volume level and adds audio fade transitions.',
      reasoning: `Context Analysis: Applied volume gain boost and audio envelope curves to clip '${targetClipId || 'selected clip'}'.`,
      subActions,
      estimatedSteps: 2,
    };

    return { matched: true, plan };
  }

  private static planPunchyTeaser(context?: EditorContext): GoalPlanningResult {
    const targetClipId = context?.selectedClipId;

    const subActions: PlannedSubAction[] = [
      {
        id: 'action-1',
        actionName: 'Increase Playback Speed',
        command: {
          action: 'speed',
          target: targetClipId,
          speed: 1.5,
        },
        reasoning: 'Increased speed to 1.5x for fast pacing.',
      },
      {
        id: 'action-2',
        actionName: 'Apply Neon Filter',
        command: {
          action: 'filter',
          target: targetClipId,
          filterName: 'neon',
        },
        reasoning: 'Applied vibrant neon filter preset.',
      },
      {
        id: 'action-3',
        actionName: 'Add Teaser Text Overlay',
        command: {
          action: 'add_text',
          text: 'WATCH THIS',
        },
        reasoning: 'Inserted high-energy overlay text "WATCH THIS".',
      },
    ];

    const plan: GoalPlan = {
      goalId: 'goal-punchy-teaser',
      goalName: 'Punchy Teaser Sequence',
      description: 'Accelerates speed to 1.5x, applies neon filter, inserts teaser text overlay.',
      reasoning: 'Goal Planner: Generated 3-step high-energy teaser pipeline.',
      subActions,
      estimatedSteps: 3,
    };

    return { matched: true, plan };
  }

  private static planVlogAesthetic(context?: EditorContext): GoalPlanningResult {
    const targetClipId = context?.selectedClipId;

    const subActions: PlannedSubAction[] = [
      {
        id: 'action-1',
        actionName: 'Apply Nature Filter',
        command: {
          action: 'filter',
          target: targetClipId,
          filterName: 'nature',
        },
        reasoning: 'Applied warm nature color filter.',
      },
      {
        id: 'action-2',
        actionName: 'Boost Brightness',
        command: {
          action: 'effect',
          target: targetClipId,
          effectType: 'brightness',
          intensity: 55,
        },
        reasoning: 'Increased brightness to 55%.',
      },
      {
        id: 'action-3',
        actionName: 'Boost Saturation',
        command: {
          action: 'effect',
          target: targetClipId,
          effectType: 'saturation',
          intensity: 60,
        },
        reasoning: 'Increased saturation to 60% for vibrant colors.',
      },
    ];

    const plan: GoalPlan = {
      goalId: 'goal-vlog-style',
      goalName: 'Vlog Aesthetic',
      description: 'Applies nature color filter and brightens video elements.',
      reasoning: 'Goal Planner: Generated 3-step bright vlog grading pipeline.',
      subActions,
      estimatedSteps: 3,
    };

    return { matched: true, plan };
  }

  private static planSlowMotion(context?: EditorContext): GoalPlanningResult {
    const targetClipId = context?.selectedClipId;

    const subActions: PlannedSubAction[] = [
      {
        id: 'action-1',
        actionName: 'Reduce Playback Speed',
        command: {
          action: 'speed',
          target: targetClipId,
          speed: 0.5,
        },
        reasoning: 'Reduced speed to 0.5x slow motion.',
      },
      {
        id: 'action-2',
        actionName: 'Apply Motion Blur Effect',
        command: {
          action: 'effect',
          target: targetClipId,
          effectType: 'blur',
          intensity: 15,
        },
        reasoning: 'Applied subtle 15% blur effect for smooth slow motion.',
      },
    ];

    const plan: GoalPlan = {
      goalId: 'goal-slomo-action',
      goalName: 'Dramatic Slow Motion',
      description: 'Reduces speed to 0.5x and applies motion blur.',
      reasoning: 'Goal Planner: Generated 2-step slow motion action sequence.',
      subActions,
      estimatedSteps: 2,
    };

    return { matched: true, plan };
  }
}
