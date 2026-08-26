import React from 'react';
import { StatCard } from '../src/components/ui/StatCard';
import { DataTable } from '../src/components/ui/DataTable';
import { StatusBadge } from '../src/components/ui/StatusBadge';
import { TestTube, Bug, CheckCircle2, ShieldAlert } from 'lucide-react';

export const TesterDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">QA & Tester Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">Quality assurance metrics, test runs, and open bugs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Tests Executed (24h)" value="1,204" icon={TestTube} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Passed Tests" value="1,192" icon={CheckCircle2} trend={{ value: 1.5, isPositive: true }} />
        <StatCard title="Open Bugs" value="15" icon={Bug} trend={{ value: 2, isPositive: false }} />
        <StatCard title="Critical Regressions" value="0" icon={ShieldAlert} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable 
          title="Recent Test Runs"
          data={[
            { id: 'tr_1', suite: 'Authentication E2E', status: 'Completed', duration: '45s', passed: 42, failed: 0 },
            { id: 'tr_2', suite: 'AI Job Processing', status: 'Completed', duration: '2m 15s', passed: 115, failed: 2 },
            { id: 'tr_3', suite: 'Billing Webhooks', status: 'Processing', duration: '12s', passed: 8, failed: 0 },
          ]}
          columns={[
            { header: 'Suite', key: 'suite', className: 'font-semibold' },
            { header: 'Status', key: 'status', render: (t) => <StatusBadge status={t.status} /> },
            { header: 'Duration', key: 'duration' },
            { header: 'Passed', key: 'passed', render: (t) => <span className="text-green-600 font-bold">{t.passed}</span> },
            { header: 'Failed', key: 'failed', render: (t) => <span className="text-red-600 font-bold">{t.failed}</span> },
          ]}
        />

        <DataTable 
          title="Open Bugs"
          data={[
            { id: 'bug_1', title: 'Sidebar overlaps on small tablets', priority: 'Medium', status: 'Open', reportedBy: 'QA Team' },
            { id: 'bug_2', title: 'Stripe webhook occasionally times out', priority: 'High', status: 'Pending', reportedBy: 'System' },
            { id: 'bug_3', title: 'GPT-4 fallback model not triggering', priority: 'Critical', status: 'Processing', reportedBy: 'Dev Team' },
          ]}
          columns={[
            { header: 'Bug ID', key: 'id', className: 'font-mono text-[10px]' },
            { header: 'Title', key: 'title', className: 'font-semibold max-w-[200px] truncate' },
            { header: 'Priority', key: 'priority' },
            { header: 'Status', key: 'status', render: (b) => <StatusBadge status={b.status} /> },
          ]}
        />
      </div>
    </div>
  );
};
