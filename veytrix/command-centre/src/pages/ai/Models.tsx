import React, { useState, useEffect } from 'react';
import { modelsService } from '../../services/modelsService';
import { AIModel } from '../../types';
import { Cpu, RefreshCw } from 'lucide-react';

export const Models = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadModels = async () => {
    setIsLoading(true);
    const data = await modelsService.getModels();
    setModels(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">AI Models & Engines</h1>
          <p className="text-sm text-[#64748B] mt-1">Catalog of active rendering, audio, and motion generation engines.</p>
        </div>
        <button
          onClick={loadModels}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Models
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading AI Models Catalog...</span>
        </div>
      ) : models.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <Cpu className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">Default Motion Engine Active</h3>
          <p className="text-sm text-[#64748B] mt-1">No custom external AI model assets have been published to the catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {models.map((model) => (
            <div key={model.id} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#3B6CE7]/40 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F1F5F9] rounded-xl text-[#3B6CE7]">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1D2B64]">{model.name}</h3>
                    <p className="text-xs text-[#64748B]">{model.provider}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${model.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {model.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
