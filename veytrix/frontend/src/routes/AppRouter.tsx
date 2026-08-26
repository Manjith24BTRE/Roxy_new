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

// Command Centre imports — pages
import { CommandCentreLayout } from '@command-centre/src/layouts/CommandCentreLayout';
import { Dashboard as CCDashboard } from '@command-centre/src/pages/operations/Dashboard';
import { SystemHealth } from '@command-centre/src/pages/operations/SystemHealth';
import { Monitoring } from '@command-centre/src/pages/operations/Monitoring';
import { Logs } from '@command-centre/src/pages/operations/Logs';
import { Users as CCUsers } from '@command-centre/src/pages/platform/Users';
import { Activity as CCActivity } from '@command-centre/src/pages/platform/Activity';
import { Sessions } from '@command-centre/src/pages/platform/Sessions';
import { Roles } from '@command-centre/src/pages/platform/Roles';
import { Permissions } from '@command-centre/src/pages/platform/Permissions';
import { AuditLogs } from '@command-centre/src/pages/platform/AuditLogs';
import { Models } from '@command-centre/src/pages/ai/Models';
import { Jobs } from '@command-centre/src/pages/ai/Jobs';
import { Analytics } from '@command-centre/src/pages/ai/Analytics';
import { Plans } from '@command-centre/src/pages/billing/Plans';
import { Transactions } from '@command-centre/src/pages/billing/Transactions';
import { Credits } from '@command-centre/src/pages/billing/Credits';
import { Tickets } from '@command-centre/src/pages/support/Tickets';
import { Feedback } from '@command-centre/src/pages/support/Feedback';
import { Announcements } from '@command-centre/src/pages/settings/Announcements';
import { PlatformSettings } from '@command-centre/src/pages/settings/PlatformSettings';
import { FeatureFlags } from '@command-centre/src/pages/settings/FeatureFlags';
import { Backups } from '@command-centre/src/pages/settings/Backups';
import { TesterDashboard } from '@command-centre/tester/TesterDashboard';
import { DeveloperDashboard } from '@command-centre/developer/DeveloperDashboard';
import { Navigate } from 'react-router-dom';

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
            <CommandCentreLayout />
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
          // Zones
          { path: 'tester/dashboard', element: <TesterDashboard /> },
          { path: 'developer/dashboard', element: <DeveloperDashboard /> },
        ],
      },
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
