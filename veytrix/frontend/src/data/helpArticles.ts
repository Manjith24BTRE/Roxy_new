export interface HelpSection {
  title: string;
  content: string | string[];
  type?: 'text' | 'list' | 'ordered-list';
}

export interface FAQItem {
  question: string;
  answer: string | string[];
}

export interface HelpArticle {
  id: string;
  title: string;
  subtitle: string;
  sections?: HelpSection[];
  faqs?: FAQItem[];
}

export const helpArticles: HelpArticle[] = [
  {
    id: "getting-started",
    title: "Getting Started with VEYTRIX",
    subtitle: "Learn the basics of VEYTRIX and start creating your first project.",
    sections: [
      {
        title: "Welcome to VEYTRIX",
        type: "text",
        content: "VEYTRIX is an AI-assisted professional video editing workspace designed directly for modern browsers. It blends precise manual control with smart AI integrations, allowing creative agencies and individual creators to speed up their editing loops without leaving their web browser."
      },
      {
        title: "Create Your First Project",
        type: "ordered-list",
        content: [
          "Log in to your VEYTRIX account to access your workspace.",
          "Open the Homepage dashboard.",
          "Click the 'New Project' or 'Start Editing' actions.",
          "Import your video, audio, or image files.",
          "Begin arranging and editing inside the VEYTRIX timeline editor."
        ]
      },
      {
        title: "Understanding the Editor Layout",
        type: "list",
        content: [
          "Media/Import Area: Houses all your source media tracks, clips, and visual assets.",
          "Preview Player: High-performance playback monitor to preview edits in real time.",
          "Timeline: Multi-track workspace separating video, audio, text, and transition layers.",
          "Editing Tools: Selection, Razor, Snapping, Ripple Editing, and Aspect Ratio tools.",
          "Effects & VFX: Access presets, filters, keyframe interpolations, and animations.",
          "Audio Controls: Mute, detach audio, and track volume adjustments.",
          "AI Command Console: Quick natural-language controls to edit via text commands.",
          "Export Controls: High-quality rendering settings to download final cuts."
        ]
      },
      {
        title: "AI Command Console",
        type: "text",
        content: "Use the AI Command Console at the bottom of the landing page or editor to write commands in natural language. For instance, try commands like: 'Trim the first 5 seconds', 'Increase video speed to 1.5x', 'Add a smooth zoom', 'Remove background noise', or 'Create a cinematic intro'."
      },
      {
        title: "Exporting Your Video",
        type: "ordered-list",
        content: [
          "Click the 'Export' button in the upper right of the editor toolbar.",
          "Select your target resolution (e.g., 720p, 1080p, 4K).",
          "Choose your export format or codec settings.",
          "Review export size and click to render.",
          "Download the processed video once background compiling finishes."
        ]
      }
    ]
  },
  {
    id: "importing-media",
    title: "Importing Media into VEYTRIX",
    subtitle: "Learn how to upload videos, images and other supported media into your project.",
    sections: [
      {
        title: "Upload Media Options",
        type: "text",
        content: "VEYTRIX offers flexible ways to ingest files into your active workspace. You can start by clicking 'New Project' or 'Import Media' on the home dashboard, use the dedicated 'Upload' button on the project upload screen, or simply drag and drop media files directly into the active editor upload zones."
      },
      {
        title: "Supported Media Formats",
        type: "list",
        content: [
          "Video Files: MP4, MOV, WebM, and standard browser-supported raw containers.",
          "Image Files: PNG, JPG, JPEG, SVG, WebP, and GIF.",
          "Audio Files: MP3, WAV, M4A, and AAC."
        ]
      },
      {
        title: "Adding Media to the Timeline",
        type: "ordered-list",
        content: [
          "Import your files into the local project media library.",
          "Select the required file from the media list.",
          "Add it to the project or timeline tracks.",
          "Drag clips horizontally to reorder or place them on different layers.",
          "Adjust clip boundaries and start editing."
        ]
      },
      {
        title: "Managing Imported Files",
        type: "list",
        content: [
          "Preview media items by hovering over them in the asset panel.",
          "Remove unwanted files to keep the browser memory footprint low.",
          "Reorder clips to structure your creative timeline efficiently.",
          "Add additional media files at any point during your editing session."
        ]
      },
      {
        title: "Import Troubleshooting",
        type: "list",
        content: [
          "Check File Size: Large files can take longer to ingest; ensure files do not exceed browser capabilities.",
          "Check Supported Format: Confirm files match supported formats (MP4, MOV, WAV, PNG, etc.).",
          "Check Connection: Ensure active internet connection if files are syncing with cloud storage.",
          "Retry Failed Uploads: Cancel and re-upload if a packet drop occurs.",
          "Refresh Project: Reopen or refresh the tab if a browser file handle becomes unresponsive."
        ]
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting VEYTRIX",
    subtitle: "Find solutions to common editing, upload, login and export problems.",
    faqs: [
      {
        question: "Video is not uploading",
        answer: "Verify that the file format is supported (like MP4, MOV, PNG, JPG, or MP3) and the file size is within limits. Check your network connection. If uploading fails, clear any stuck queue items and retry the file upload."
      },
      {
        question: "Editor is not loading",
        answer: "Refresh the page. If the issue persists, check your internet connection, reopen the project from the home dashboard, or clear your browser cache to reload fresh scripts."
      },
      {
        question: "Video preview is not playing",
        answer: "Ensure that all media tracks are loaded correctly on the timeline. Reload the project, or check browser system performance (GPU acceleration is highly recommended for VEYTRIX)."
      },
      {
        question: "Export is failing",
        answer: "Verify that all source media files are still online and have not been removed from your local assets. Check export settings, try a slightly lower resolution, and verify your device has enough free disk space before retrying."
      },
      {
        question: "Login is not working",
        answer: "Double-check your credentials. Try refreshing the page, signing in again, and verifying that your browser accepts session cookies for authentication state preservation."
      },
      {
        question: "AI Command is not executing",
        answer: "Make sure your command is clearly written in English with standard terms. Verify that the media files you want to edit actually exist in your project timeline, then retry execution."
      },
      {
        question: "Changes are not appearing",
        answer: "Check that the progress indicator has completed for the action. Refresh the project state, or save and reopen the project if any state synchronization issues arise."
      }
    ]
  }
];
