import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Crown, 
  DollarSign, 
  Users, 
  Zap, 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  Database,
  Mail,
  CheckCircle2,
  Lock,
  Sparkles,
  Download,
  FolderArchive
} from 'lucide-react';
import { UserSubscription, PlanTier } from '../types';
import { PLANS, upgradePlan, saveUserSubscription } from '../utils/subscription';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSubscriptionUpdate,
}) => {
  const [simulatedSubscribers, setSimulatedSubscribers] = useState({
    free: 1240,
    golden: 185,   // $5/mo = $925
    diamond: 94,   // $12/mo = $1,128
    premium: 42,   // $25/mo = $1,050
    enterprise: 6, // $99/mo = $594
  });

  if (!isOpen) return null;

  const totalMonthlyRevenue = 
    simulatedSubscribers.golden * 5 +
    simulatedSubscribers.diamond * 12 +
    simulatedSubscribers.premium * 25 +
    simulatedSubscribers.enterprise * 99;

  const totalActiveUsers = 
    simulatedSubscribers.free +
    simulatedSubscribers.golden +
    simulatedSubscribers.diamond +
    simulatedSubscribers.premium +
    simulatedSubscribers.enterprise;

  const handleToggleOwnerMode = () => {
    const updated: UserSubscription = {
      ...subscription,
      isOwner: !subscription.isOwner,
    };
    saveUserSubscription(updated);
    onSubscriptionUpdate(updated);
  };

  const handleSimulateUserTier = (tier: PlanTier) => {
    const updated = upgradePlan(tier);
    // Preserve owner flag
    updated.isOwner = subscription.isOwner;
    updated.ownerEmail = subscription.ownerEmail || 'sailajac749@gmail.com';
    saveUserSubscription(updated);
    onSubscriptionUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  Owner & Creator Console
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified App Owner
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{subscription.ownerEmail || 'sailajac749@gmail.com'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* Owner Confirmation Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Yes, you are the verified creator and owner of this application!</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                You created this project in Google AI Studio. Your account has full administrative authority, unlimited prompt generation privileges, and complete control over plans and pricing.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleToggleOwnerMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  subscription.isOwner
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span>Owner Unlimited Mode</span>
                {subscription.isOwner ? (
                  <ToggleRight className="w-5 h-5 text-amber-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Revenue & Business Metrics Simulator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Application Revenue & Subscription Simulator</span>
              </h4>
              <span className="text-[11px] text-slate-500">Live Business Metrics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Monthly Recurring Revenue (MRR)</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  ${totalMonthlyRevenue.toLocaleString()}.00
                </p>
                <span className="text-[10px] text-slate-500">From paid subscription tiers</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Total Active Prompt Creators</span>
                <p className="text-2xl font-black text-white mt-1">
                  {totalActiveUsers.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500">{simulatedSubscribers.free} Free + {totalActiveUsers - simulatedSubscribers.free} Paid</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Active Owner Plan</span>
                <p className="text-2xl font-black text-amber-400 mt-1 capitalize">
                  {subscription.plan}
                </p>
                <span className="text-[10px] text-slate-500">
                  {subscription.isOwner ? 'Unlimited Owner Privileges' : 'Testing as User'}
                </span>
              </div>
            </div>

            {/* Subscriber breakdown by plan */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[11px]">Free Tier</span>
                <strong className="text-white text-sm">{simulatedSubscribers.free}</strong>
                <span className="text-[10px] text-slate-500 block">4 chats/day ($0)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/20 text-center">
                <span className="text-amber-400 block text-[11px]">Golden Plan</span>
                <strong className="text-white text-sm">{simulatedSubscribers.golden}</strong>
                <span className="text-[10px] text-slate-500 block">30 chats ($5/mo)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/20 text-center">
                <span className="text-cyan-400 block text-[11px]">Diamond Plan</span>
                <strong className="text-white text-sm">{simulatedSubscribers.diamond}</strong>
                <span className="text-[10px] text-slate-500 block">80 chats ($12/mo)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/20 text-center">
                <span className="text-purple-400 block text-[11px]">Premium Plan</span>
                <strong className="text-white text-sm">{simulatedSubscribers.premium}</strong>
                <span className="text-[10px] text-slate-500 block">200 chats ($25/mo)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/20 text-center">
                <span className="text-emerald-400 block text-[11px]">Enterprise</span>
                <strong className="text-white text-sm">{simulatedSubscribers.enterprise}</strong>
                <span className="text-[10px] text-slate-500 block">Unlimited ($99+/mo)</span>
              </div>
            </div>
          </div>

          {/* Test As a Customer Tool */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-300">
                  Auditing & Testing: Experience App as Different Tiers
                </h4>
                <p className="text-[11px] text-slate-400">
                  Switch the active view to test credit consumption, prompts limits, and alerts for any tier.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['free', 'golden', 'diamond', 'premium', 'enterprise'] as PlanTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleSimulateUserTier(tier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    subscription.plan === tier
                      ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/40'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {PLANS[tier].name} ({tier === 'free' ? '4/day' : tier === 'enterprise' ? 'Unlimited' : `${PLANS[tier].monthlyChats}/mo`})
                </button>
              ))}
            </div>
          </div>

          {/* Download Project Source Code Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Download Full Project Source Code (.zip)</h4>
              </div>
              <p className="text-xs text-slate-300">
                Exports all source code, components, Express server, Vite setup, and README.md. Ready to run locally with <code className="text-emerald-300 font-mono">npm install && npm run dev</code>.
              </p>
            </div>

            <a
              href="/api/download-project"
              download="promptvibe-ai-project.zip"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download .ZIP</span>
            </a>
          </div>

          {/* Technical Architecture Specs */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Owner Technical Architecture</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>• AI Model: <strong>Gemini 3.8 Flash (@google/genai)</strong></div>
              <div>• Midjourney Engine: <strong>v6.1, v6.0, Niji 6 Flag Parser</strong></div>
              <div>• Runway Engine: <strong>Gen-3 Alpha Camera Movement Syntax</strong></div>
              <div>• Deployment: <strong>Google Cloud Run Container (AI Studio)</strong></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Crown className="w-3.5 h-3.5" />
            Signed in as Owner: {subscription.ownerEmail || 'sailajac749@gmail.com'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
