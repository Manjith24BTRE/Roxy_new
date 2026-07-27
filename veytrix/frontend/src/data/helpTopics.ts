export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  content: React.ReactNode;
}

export const helpTopics: HelpTopic[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of the VEYTRIX editor and workspace.",
    keywords: ["basics", "workspace", "new", "begin"],
    content: "Welcome to VEYTRIX! To begin editing, create a new project from your dashboard. The workspace is divided into your media pool, the timeline, and the preview monitor. Drag media onto your timeline to start."
  },
  {
    id: "importing-media",
    title: "Importing Media",
    description: "How to bring your footage into the editor.",
    keywords: ["upload", "import", "video", "audio", "files"],
    content: "Click the 'Upload' button in your media pool or simply drag and drop files from your computer. VEYTRIX supports standard formats like MP4, MOV, WAV, and MP3."
  },
  {
    id: "editing-basics",
    title: "Editing Basics",
    description: "Learn how to use fundamental editing tools.",
    keywords: ["cut", "trim", "split", "move", "basic"],
    content: "Use the Razor tool (C) to split clips, and the Selection tool (V) to move or trim the edges. You can also right-click a clip for more options like detaching audio."
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "Navigating and organizing your timeline.",
    keywords: ["tracks", "layers", "navigate", "zoom"],
    content: "Your timeline consists of video tracks on top and audio tracks on the bottom. Add new tracks by right-clicking the track header. Use the zoom slider to see more detail."
  },
  {
    id: "effects-transitions",
    title: "Effects & Transitions",
    description: "Adding polish to your project.",
    keywords: ["fade", "crossfade", "blur", "color", "vfx"],
    content: "Open the Effects panel to drag and drop transitions between clips on your timeline. Select a clip to adjust its properties like scale, position, and opacity in the Inspector."
  },
  {
    id: "exporting",
    title: "Exporting",
    description: "Rendering your final video.",
    keywords: ["render", "export", "download", "save", "mp4"],
    content: "When you're finished, click the Export button. Choose your resolution (e.g., 1080p, 4K) and format. VEYTRIX will process the video in the background."
  },
  {
    id: "templates",
    title: "Templates",
    description: "Using pre-built project templates.",
    keywords: ["template", "quick", "social", "start"],
    content: "Templates provide a quick starting point with predefined tracks and effects. Access them from the Templates tab on your dashboard."
  },
  {
    id: "account",
    title: "Account",
    description: "Managing your profile and settings.",
    keywords: ["password", "email", "profile", "settings"],
    content: "You can update your profile details, change your password, and manage your preferences in the Settings page of your workspace."
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Find solutions to common issues and export errors.",
    keywords: ["error", "crash", "bug", "help", "fix", "stuck"],
    content: "If you experience playback lag, try lowering the preview resolution. For export failures, ensure you have sufficient storage space or try a different browser."
  }
];
