import React from 'react';
import { Plus, Check, Edit2 } from 'lucide-react';

const mockPlans = [
  { id: 'pln_1', name: 'Free', price: 0, credits: 100, activeSubscribers: 42100, features: ['Basic AI Models', 'Community Support', 'Standard Speed'], status: 'Active' },
  { id: 'pln_2', name: 'Pro', price: 20, credits: 1500, activeSubscribers: 2840, features: ['Advanced Models', 'Priority Support', 'Faster Speed', 'API Access'], status: 'Active' },
  { id: 'pln_3', name: 'Premium', price: 100, credits: 10000, activeSubscribers: 250, features: ['All Models', '24/7 Phone Support', 'Highest Speed', 'Dedicated IP'], status: 'Active' },
  { id: 'pln_4', name: 'Enterprise', price: 999, credits: 100000, activeSubscribers: 15, features: ['Custom Models', 'SLA Guarantee', 'Dedicated Account Manager'], status: 'Active' },
];

export const Plans = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Subscription Plans</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage pricing tiers and features for Veytrix users.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2b52b3] transition-colors">
          <Plus size={16} />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {mockPlans.map(plan => (
          <div key={plan.id} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col relative overflow-hidden group hover:border-[#3B6CE7]/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl text-[#1D2B64]">{plan.name}</h3>
              <button className="p-1.5 text-[#64748B] hover:bg-[#F1F5F9] rounded-md opacity-0 group-hover:opacity-100 transition-all">
                <Edit2 size={16} />
              </button>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-black text-[#1D2B64]">${plan.price}</span>
              <span className="text-sm text-[#64748B]">/month</span>
            </div>
            
            <div className="bg-[#F1F5F9] rounded-lg p-3 mb-6">
              <p className="text-xs text-[#64748B] uppercase tracking-wider font-bold">Credits Included</p>
              <p className="text-lg font-black text-[#3B6CE7]">{plan.credits.toLocaleString()}</p>
            </div>

            <div className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1D2B64]">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Active Subs</p>
                <p className="text-sm font-bold text-[#1D2B64]">{plan.activeSubscribers.toLocaleString()}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">
                {plan.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
