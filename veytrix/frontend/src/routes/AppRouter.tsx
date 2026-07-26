import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout.tsx';
import { ProjectMediaProvider } from '../contexts/ProjectMediaContext.tsx';
import { AuthProvider } from '../contexts/AuthContext.tsx';
import { LandingPage } from '../features/landing/pages/LandingPage.tsx';
import { SignInPage } from '../features/auth/pages/SignInPage.tsx';
import { HomePage } from '../features/home/pages/HomePage.tsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.tsx';
import { UploadPage } from '../features/upload/pages/UploadPage.tsx';
import { ProcessingPage } from '../features/processing/pages/ProcessingPage.tsx';
import { EditorPage } from '../features/editor/pages/EditorPage.tsx';
import { SettingsPage } from '../features/settings/pages/SettingsPage.tsx';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage.tsx';
import { ProfilePage } from '../features/profile/pages/ProfilePage.tsx';
import { HelpCenterPage } from '../features/help/pages/HelpCenterPage.tsx';
import { ReportProblemPage } from '../features/report/pages/ReportProblemPage.tsx';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'signin', element: <SignInPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'processing', element: <ProcessingPage /> },
      { path: 'editor', element: <EditorPage /> },
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
        ]
      }
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
