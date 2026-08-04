import React, { useState, Suspense } from 'react';
import { SettingsHeader, SettingsSidebar, SettingsLayout } from '../components';

// Lazy load category panels for premium performance and code splitting
const AccountPanel = React.lazy(() => import('../panels/AccountPanel').then(module => ({ default: module.AccountPanel })));
const ProfilePanel = React.lazy(() => import('../panels/ProfilePanel').then(module => ({ default: module.ProfilePanel })));
const WorkspacePanel = React.lazy(() => import('../panels/WorkspacePanel').then(module => ({ default: module.WorkspacePanel })));
const AppearancePanel = React.lazy(() => import('../panels/AppearancePanel').then(module => ({ default: module.AppearancePanel })));
const NotificationsPanel = React.lazy(() => import('../panels/NotificationsPanel').then(module => ({ default: module.NotificationsPanel })));
const PrivacyPanel = React.lazy(() => import('../panels/PrivacyPanel').then(module => ({ default: module.PrivacyPanel })));
const SecurityPanel = React.lazy(() => import('../panels/SecurityPanel').then(module => ({ default: module.SecurityPanel })));
const StoragePanel = React.lazy(() => import('../panels/StoragePanel').then(module => ({ default: module.StoragePanel })));
const KeyboardShortcutsPanel = React.lazy(() => import('../panels/KeyboardShortcutsPanel').then(module => ({ default: module.KeyboardShortcutsPanel })));
const AccessibilityPanel = React.lazy(() => import('../panels/AccessibilityPanel').then(module => ({ default: module.AccessibilityPanel })));
const ConnectedAppsPanel = React.lazy(() => import('../panels/ConnectedAppsPanel').then(module => ({ default: module.ConnectedAppsPanel })));
const BillingPanel = React.lazy(() => import('../panels/BillingPanel').then(module => ({ default: module.BillingPanel })));
const ExportPanel = React.lazy(() => import('../panels/ExportPanel').then(module => ({ default: module.ExportPanel })));
const AboutPanel = React.lazy(() => import('../panels/AboutPanel').then(module => ({ default: module.AboutPanel })));
const AdvancedPanel = React.lazy(() => import('../panels/AdvancedPanel').then(module => ({ default: module.AdvancedPanel })));

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('account');

  const renderActivePanel = () => {
    switch (activeCategory) {
      case 'account': return <AccountPanel />;
      case 'profile': return <ProfilePanel />;
      case 'workspace': return <WorkspacePanel />;
      case 'appearance': return <AppearancePanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'privacy': return <PrivacyPanel />;
      case 'security': return <SecurityPanel />;
      case 'storage': return <StoragePanel />;
      case 'shortcuts': return <KeyboardShortcutsPanel />;
      case 'accessibility': return <AccessibilityPanel />;
      case 'connected': return <ConnectedAppsPanel />;
      case 'billing': return <BillingPanel />;
      case 'export': return <ExportPanel />;
      case 'about': return <AboutPanel />;
      case 'advanced': return <AdvancedPanel />;
      default: return <AccountPanel />;
    }
  };

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-[1600px] mx-auto flex flex-col h-full relative">
      <SettingsHeader />

      <SettingsLayout
        sidebar={
          <div>
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2B64]/40 mb-3 pl-3 select-none">
              Preferences
            </h2>
            <SettingsSidebar 
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory} 
            />
          </div>
        }
        content={
          <Suspense fallback={
            <div className="w-full py-12 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-[#3B6CE7]/20 border-t-[#3B6CE7] animate-spin" />
            </div>
          }>
            {renderActivePanel()}
          </Suspense>
        }
      />
    </div>
  );
}

export default SettingsPage;
