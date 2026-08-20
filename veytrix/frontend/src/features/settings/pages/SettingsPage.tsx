import React, { useState, Suspense } from 'react';
import { SettingsHeader, SettingsSidebar, SettingsLayout } from '../components';

// Professional settings panel error boundary for dynamic import failures
class SettingsErrorBoundary extends React.Component<
  { children: React.ReactNode; sectionName: string },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: any) {
    // Automatically reset error state when user switches settings sections
    if (prevProps.sectionName !== this.props.sectionName) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(`[SettingsErrorBoundary] Failed to load settings panel: ${this.props.sectionName}`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-3 select-none dark:bg-red-950/20 dark:border-red-900/30">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-bold text-sm">
            <span>⚠️ Failed to load settings section</span>
          </div>
          <p className="text-xs text-red-700/80 dark:text-red-400/70 leading-relaxed font-medium">
            Could not fetch this module. This usually occurs during active development builds or temporary network drops.
          </p>
          <div>
            <button
              onClick={this.handleRetry}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition cursor-pointer dark:bg-red-800 dark:hover:bg-red-700"
            >
              Retry Load
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load category panels for premium performance and code splitting
const AccountPanel = React.lazy(() => import('../panels/AccountPanel').then(module => ({ default: module.AccountPanel })));
const WorkspacePanel = React.lazy(() => import('../panels/WorkspacePanel').then(module => ({ default: module.WorkspacePanel })));
const AppearancePanel = React.lazy(() => import('../panels/AppearancePanel').then(module => ({ default: module.AppearancePanel })));
const NotificationsPanel = React.lazy(() => import('../panels/NotificationsPanel').then(module => ({ default: module.NotificationsPanel })));
const SecurityPanel = React.lazy(() => import('../panels/SecurityPanel').then(module => ({ default: module.SecurityPanel })));
const StoragePanel = React.lazy(() => import('../panels/StoragePanel').then(module => ({ default: module.StoragePanel })));
const KeyboardShortcutsPanel = React.lazy(() => import('../panels/KeyboardShortcutsPanel').then(module => ({ default: module.KeyboardShortcutsPanel })));
const BillingPanel = React.lazy(() => import('../panels/BillingPanel').then(module => ({ default: module.BillingPanel })));
const ExportPanel = React.lazy(() => import('../panels/ExportPanel').then(module => ({ default: module.ExportPanel })));
const AboutPanel = React.lazy(() => import('../panels/AboutPanel').then(module => ({ default: module.AboutPanel })));

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('account');

  const renderActivePanel = () => {
    switch (activeCategory) {
      case 'account': return <AccountPanel />;
      case 'workspace': return <WorkspacePanel />;
      case 'appearance': return <AppearancePanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'security': return <SecurityPanel />;
      case 'storage': return <StoragePanel />;
      case 'shortcuts': return <KeyboardShortcutsPanel />;
      case 'billing': return <BillingPanel />;
      case 'export': return <ExportPanel />;
      case 'about': return <AboutPanel />;
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
          <SettingsErrorBoundary sectionName={activeCategory}>
            <Suspense fallback={
              <div className="w-full py-12 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-[#3B6CE7]/20 border-t-[#3B6CE7] animate-spin" />
              </div>
            }>
              {renderActivePanel()}
            </Suspense>
          </SettingsErrorBoundary>
        }
      />
    </div>
  );
}

export default SettingsPage;
