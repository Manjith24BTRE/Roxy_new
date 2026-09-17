import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { ProjectMediaProvider } from '../contexts/ProjectMediaContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../themes/themeProvider';
import { LegalModalProvider } from '../components/company/legal/LegalModalProvider';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { CompanyPage } from '../pages/company/CompanyPage';
import { Homepage } from '../features/homepage/pages/Homepage';
import { UploadPage } from '../components/upload/UploadPage';
import { ProcessingPage } from '../components/processing/ProcessingPage';
import { EditorMainScreen } from '../components/editor-main-screen/EditorMainScreen';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { HelpCenterPage } from '../features/help/pages/HelpCenterPage';
import { HelpArticlePage } from '../features/help/pages/HelpArticlePage';
import { ReportProblemPage } from '../features/report/pages/ReportProblemPage';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { ControllerRoute } from './ControllerRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { FooterModalProvider } from '../context/FooterModalContext';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// Command Centre imports — lazy loaded
const CommandCentreLayout = React.lazy(() => import('@command-centre/src/layouts/CommandCentreLayout').then(m => ({ default: m.CommandCentreLayout })));
const CCDashboard = React.lazy(() => import('@command-centre/src/pages/operations/Dashboard').then(m => ({ default: m.Dashboard })));
const SystemHealth = React.lazy(() => import('@command-centre/src/pages/operations/SystemHealth').then(m => ({ default: m.SystemHealth })));
const Monitoring = React.lazy(() => import('@command-centre/src/pages/operations/Monitoring').then(m => ({ default: m.Monitoring })));
const Logs = React.lazy(() => import('@command-centre/src/pages/operations/Logs').then(m => ({ default: m.Logs })));
const CCUsers = React.lazy(() => import('@command-centre/src/pages/platform/Users').then(m => ({ default: m.Users })));
const CCActivity = React.lazy(() => import('@command-centre/src/pages/platform/Activity').then(m => ({ default: m.Activity })));
const Sessions = React.lazy(() => import('@command-centre/src/pages/platform/Sessions').then(m => ({ default: m.Sessions })));
const Roles = React.lazy(() => import('@command-centre/src/pages/platform/Roles').then(m => ({ default: m.Roles })));
const Permissions = React.lazy(() => import('@command-centre/src/pages/platform/Permissions').then(m => ({ default: m.Permissions })));
const AuditLogs = React.lazy(() => import('@command-centre/src/pages/platform/AuditLogs').then(m => ({ default: m.AuditLogs })));
const Models = React.lazy(() => import('@command-centre/src/pages/ai/Models').then(m => ({ default: m.Models })));
const Jobs = React.lazy(() => import('@command-centre/src/pages/ai/Jobs').then(m => ({ default: m.Jobs })));
const Analytics = React.lazy(() => import('@command-centre/src/pages/ai/Analytics').then(m => ({ default: m.Analytics })));
const Plans = React.lazy(() => import('@command-centre/src/pages/billing/Plans').then(m => ({ default: m.Plans })));
const Transactions = React.lazy(() => import('@command-centre/src/pages/billing/Transactions').then(m => ({ default: m.Transactions })));
const Credits = React.lazy(() => import('@command-centre/src/pages/billing/Credits').then(m => ({ default: m.Credits })));
const Tickets = React.lazy(() => import('@command-centre/src/pages/support/Tickets').then(m => ({ default: m.Tickets })));
const Feedback = React.lazy(() => import('@command-centre/src/pages/support/Feedback').then(m => ({ default: m.Feedback })));
const Announcements = React.lazy(() => import('@command-centre/src/pages/settings/Announcements').then(m => ({ default: m.Announcements })));
const PlatformSettings = React.lazy(() => import('@command-centre/src/pages/settings/PlatformSettings').then(m => ({ default: m.PlatformSettings })));
const FeatureFlags = React.lazy(() => import('@command-centre/src/pages/settings/FeatureFlags').then(m => ({ default: m.FeatureFlags })));
const Backups = React.lazy(() => import('@command-centre/src/pages/settings/Backups').then(m => ({ default: m.Backups })));

const SuspenseLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
    <Loader2 className="h-6 w-6 text-[#3B6CE7] animate-spin" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'company', element: <CompanyPage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'upload', element: <UploadPage /> },
          { path: 'processing', element: <ProcessingPage /> },
          { path: 'editor', element: <EditorMainScreen /> },
          {
            element: <WorkspaceLayout />,
            children: [
              { path: 'home', element: <Homepage /> },
              { path: 'projects', element: <ProjectsPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'help', element: <HelpCenterPage /> },
              { path: 'help/:articleId', element: <HelpArticlePage /> },
              { path: 'report-problem', element: <ReportProblemPage /> },
            ],
          },
        ],
      },
      // Command Centre — protected by ControllerRoute
      {
        path: 'command-centre',
        element: (
          <ControllerRoute>
            <Suspense fallback={<SuspenseLoader />}>
              <CommandCentreLayout />
            </Suspense>
          </ControllerRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/command-centre/dashboard" replace /> },
          // Operations
          { path: 'dashboard', element: <CCDashboard /> },
          { path: 'system-health', element: <SystemHealth /> },
          { path: 'monitoring', element: <Monitoring /> },
          { path: 'logs', element: <Logs /> },
          // Platform
          { path: 'users', element: <CCUsers /> },
          { path: 'activity', element: <CCActivity /> },
          { path: 'sessions', element: <Sessions /> },
          { path: 'roles', element: <Roles /> },
          { path: 'permissions', element: <Permissions /> },
          { path: 'audit-logs', element: <AuditLogs /> },
          // AI Operations
          { path: 'models', element: <Models /> },
          { path: 'jobs', element: <Jobs /> },
          { path: 'analytics', element: <Analytics /> },
          // Billing
          { path: 'plans', element: <Plans /> },
          { path: 'transactions', element: <Transactions /> },
          { path: 'credits', element: <Credits /> },
          // Support
          { path: 'tickets', element: <Tickets /> },
          { path: 'feedback', element: <Feedback /> },
          // Settings
          { path: 'announcements', element: <Announcements /> },
          { path: 'platform-settings', element: <PlatformSettings /> },
          { path: 'feature-flags', element: <FeatureFlags /> },
          { path: 'backups', element: <Backups /> },
          // Command Centre Fallback
          { path: '*', element: <Navigate to="/command-centre/dashboard" replace /> },
        ],
      },
      // Root Fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function AppRouter() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectMediaProvider>
          <LegalModalProvider>
            <FooterModalProvider>
              <RouterProvider router={router} />
            </FooterModalProvider>
          </LegalModalProvider>
        </ProjectMediaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
