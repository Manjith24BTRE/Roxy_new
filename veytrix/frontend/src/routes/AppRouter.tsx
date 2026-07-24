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
import {
  TemplatesPage,
  LearningPage,
  SupportPage,
  CompanyPage,
  SettingsPage,
} from '../pages/FeaturePages.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'signin', element: <SignInPage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'processing', element: <ProcessingPage /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'learning', element: <LearningPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'company', element: <CompanyPage /> },
      { path: 'settings', element: <SettingsPage /> },
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
