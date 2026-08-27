import React, { useState, useEffect } from 'react';
import { featureFlagsService } from '../../services/featureFlagsService';
import { FeatureFlag } from '../../types';
import { ToggleLeft, RefreshCw } from 'lucide-react';

export const FeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFlags = async () => {
    setIsLoading(true);
    const data = await featureFlagsService.getFeatureFlags();
    setFlags(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFlags();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Feature Flags</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage runtime system toggles and gradual feature rollouts.</p>
        </div>
        <button
          onClick={loadFlags}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Flags
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading Feature Flags...</span>
        </div>
      ) : flags.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <ToggleLeft className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No Feature Flags Defined</h3>
          <p className="text-sm text-[#64748B] mt-1">All core system features are operating on default production configurations.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="space-y-4">
            {flags.map((flag) => (
              <div key={flag.id} className="p-4 border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1D2B64]">{flag.name}</h4>
                  <p className="text-xs font-mono text-[#64748B]">{flag.key}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${flag.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {flag.status ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
