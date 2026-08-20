export interface LegalSection {
  id: number;
  title: string;
  content?: string;
  bullets?: string[];
}

export const TERMS_CONTENT: LegalSection[] = [
  {
    id: 1,
    title: "1. Acceptance",
    content: "Using VEYTRIX means you agree to these Terms of Service."
  },
  {
    id: 2,
    title: "2. Account Responsibilities",
    bullets: [
      "Keep your account secure.",
      "Do not share credentials.",
      "You are responsible for all activity."
    ]
  },
  {
    id: 3,
    title: "3. Acceptable Use",
    content: "Users must NOT:",
    bullets: [
      "Upload illegal content",
      "Upload copyrighted content without permission",
      "Reverse engineer the platform",
      "Attempt unauthorized access",
      "Abuse AI resources",
      "Upload malware"
    ]
  },
  {
    id: 4,
    title: "4. AI Usage",
    content: "AI-generated content should be reviewed before commercial use."
  },
  {
    id: 5,
    title: "5. Intellectual Property",
    content: "VEYTRIX and its technologies remain property of Mavros Tech Pvt Ltd."
  },
  {
    id: 6,
    title: "6. Account Suspension",
    content: "Accounts violating policies may be suspended or terminated."
  },
  {
    id: 7,
    title: "7. Service Availability",
    content: "Features may evolve, improve or change over time."
  }
];

export const PRIVACY_CONTENT: LegalSection[] = [
  {
    id: 1,
    title: "1. Information We Collect",
    bullets: [
      "Email",
      "Name",
      "Authentication tokens",
      "Preferences",
      "Workspace settings"
    ]
  },
  {
    id: 2,
    title: "2. What We Do NOT Collect",
    bullets: [
      "Passwords in plain text",
      "Personal editing files without permission",
      "Device camera or microphone without consent"
    ]
  },
  {
    id: 3,
    title: "3. Data Security",
    bullets: [
      "Encrypted authentication",
      "Secure API communication",
      "Protected cloud storage",
      "Industry standard security practices"
    ]
  },
  {
    id: 4,
    title: "4. Cookies",
    content: "Cookies improve authentication and user experience."
  },
  {
    id: 5,
    title: "5. AI Processing",
    content: "Uploaded media is processed only for requested editing features."
  },
  {
    id: 6,
    title: "6. User Rights",
    content: "Users can:",
    bullets: [
      "Update profile",
      "Delete account",
      "Request data removal",
      "Download their information"
    ]
  }
];
