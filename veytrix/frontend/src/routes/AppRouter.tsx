import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { ProjectMediaProvider } from '../contexts/ProjectMediaContext';
import { AuthProvider } from '../context/AuthContext';
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
import { ReportProblemPage } from '../features/report/pages/ReportProblemPage';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { ProtectedRoute } from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'company', element: <CompanyPage /> },
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
        <LegalModalProvider>
          <RouterProvider router={router} />
        </LegalModalProvider>
      </ProjectMediaProvider>
    </AuthProvider>
  );
}
