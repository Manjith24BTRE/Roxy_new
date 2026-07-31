import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { ProjectMediaProvider } from '../contexts/ProjectMediaContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { HomePage } from '../features/home/pages/HomePage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { UploadPage } from '../features/upload/pages/UploadPage';
import { ProcessingPage } from '../features/processing/pages/ProcessingPage';
import { EditorMainScreen } from '../components/editor-main-screen/EditorMainScreen';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { HelpCenterPage } from '../features/help/pages/HelpCenterPage';
import { ReportProblemPage } from '../features/report/pages/ReportProblemPage';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { ProtectedRoute, PublicOnlyRoute } from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: 'signin', element: <SignInPage /> },
          { path: 'signup', element: <SignUpPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
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
              { path: 'home', element: <HomePage /> },
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'projects', element: <ProjectsPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'help', element: <HelpCenterPage /> },
              { path: 'report-problem', element: <ReportProblemPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return (
    <AuthProvider>
      <ProjectMediaProvider>
        <RouterProvider router={router} />
      </ProjectMediaProvider>
    </AuthProvider>
  );
}
