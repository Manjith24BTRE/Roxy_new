import { CommandRegistry } from './CommandRegistry';
import { SplitCommand } from '../commands/timeline/SplitCommand';
import { TrimCommand } from '../commands/timeline/TrimCommand';
import { DeleteCommand } from '../commands/timeline/DeleteCommand';
import { RippleDeleteCommand } from '../commands/timeline/RippleDeleteCommand';
import { SpeedCommand } from '../commands/timeline/SpeedCommand';
import { DuplicateCommand } from '../commands/timeline/DuplicateCommand';
import { MoveClipCommand } from '../commands/timeline/MoveClipCommand';
import { MovePlayheadCommand } from '../commands/timeline/MovePlayheadCommand';
import { ExtendClipCommand } from '../commands/timeline/ExtendClipCommand';
import { ShortenClipCommand } from '../commands/timeline/ShortenClipCommand';
import { SelectCommand } from '../commands/timeline/SelectCommand';
import { MuteCommand } from '../commands/audio/MuteCommand';
import { VolumeCommand } from '../commands/audio/VolumeCommand';
import { DetachAudioCommand } from '../commands/audio/DetachAudioCommand';
import { AudioFadeCommand } from '../commands/audio/AudioFadeCommand';
import { RotateCommand } from '../commands/transform/RotateCommand';
import { ScaleCommand } from '../commands/transform/ScaleCommand';
import { AspectRatioCommand } from '../commands/transform/AspectRatioCommand';
import { TextCommand } from '../commands/text/TextCommand';

export function initializeCommandRegistry(): CommandRegistry {
  const registry = CommandRegistry.getInstance();

  // Register timeline commands
  registry.register(new SplitCommand());
  registry.register(new TrimCommand());
  registry.register(new DeleteCommand());
  registry.register(new RippleDeleteCommand());
  registry.register(new SpeedCommand());
  registry.register(new DuplicateCommand());
  registry.register(new MoveClipCommand());
  registry.register(new MovePlayheadCommand());
  registry.register(new ExtendClipCommand());
  registry.register(new ShortenClipCommand());
  registry.register(new SelectCommand());

  // Register audio commands
  registry.register(new MuteCommand());
  registry.register(new VolumeCommand());
  registry.register(new DetachAudioCommand());
  registry.register(new AudioFadeCommand());

  // Register transform commands
  registry.register(new RotateCommand());
  registry.register(new ScaleCommand());
  registry.register(new AspectRatioCommand());

  // Register text
  registry.register(new TextCommand());

  return registry;
}

export * from './CommandRegistry';
