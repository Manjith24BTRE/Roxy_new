import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ControlCentreAuthProvider, useControlCentreAuth } from './context/ControlCentreAuthContext';
import { Login } from './pages/Login';
import { CommandCentreLayout } from './layouts/CommandCentreLayout';

// Pages
import { Dashboard } from './pages/operations/Dashboard';
import { SystemHealth } from './pages/operations/SystemHealth';
import { Monitoring } from './pages/operations/Monitoring';
import { Logs } from './pages/operations/Logs';

import { Users } from './pages/platform/Users';
import { Activity } from './pages/platform/Activity';
import { Sessions } from './pages/platform/Sessions';
import { Roles } from './pages/platform/Roles';
import { Permissions } from './pages/platform/Permissions';
import { AuditLogs } from './pages/platform/AuditLogs';

import { Models } from './pages/ai/Models';
import { Jobs } from './pages/ai/Jobs';
import { Analytics } from './pages/ai/Analytics';

import { Plans } from './pages/billing/Plans';
import { Transactions } from './pages/billing/Transactions';
import { Credits } from './pages/billing/Credits';

import { Tickets } from './pages/support/Tickets';
import { Feedback } from './pages/support/Feedback';

import { Announcements } from './pages/settings/Announcements';
import { PlatformSettings } from './pages/settings/PlatformSettings';
import { FeatureFlags } from './pages/settings/FeatureFlags';
import { Backups } from './pages/settings/Backups';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { session, isLoading, isUnauthorizedNormalUser } = useControlCentreAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">Loading...</div>;
  }

  if (isUnauthorizedNormalUser) {
    window.location.href = '/home';
    return null;
  }

  if (!session) {
    return <Navigate to="/command-centre/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/command-centre/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/command-centre"
        element={
          <ProtectedRoute>
            <CommandCentreLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/command-centre/dashboard" replace />} />
        
        {/* Operations */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="system-health" element={<SystemHealth />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="logs" element={<Logs />} />

        {/* Platform */}
        <Route path="users" element={<Users />} />
        <Route path="activity" element={<Activity />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="roles" element={<Roles />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="audit-logs" element={<AuditLogs />} />

        {/* AI Operations */}
        <Route path="models" element={<Models />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="analytics" element={<Analytics />} />

        {/* Billing */}
        <Route path="plans" element={<Plans />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="credits" element={<Credits />} />

        {/* Support */}
        <Route path="tickets" element={<Tickets />} />
        <Route path="feedback" element={<Feedback />} />

        {/* Settings */}
        <Route path="announcements" element={<Announcements />} />
        <Route path="platform-settings" element={<PlatformSettings />} />
        <Route path="feature-flags" element={<FeatureFlags />} />
        <Route path="backups" element={<Backups />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/command-centre/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ControlCentreAuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ControlCentreAuthProvider>
  );
};

export default App;
