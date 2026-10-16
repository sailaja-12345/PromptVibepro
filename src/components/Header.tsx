import React from 'react';
import { 
  Sparkles, 
  Crown, 
  History, 
  RotateCcw, 
  Film, 
  Camera, 
  Layers, 
  Check, 
  Zap,
  Users,
  ShieldCheck,
  Download
} from 'lucide-react';
import { UserSubscription, PlanTier } from '../types';
import { PLANS, resetDemoDailyCredits } from '../utils/subscription';

interface HeaderProps {
  subscription: UserSubscription;
  onOpenPricing: () => void;
  onOpenHistory: () => void;
  onOpenOwner?: () => void;
  savedCount: number;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
}

export const Header: React.FC<HeaderProps> = ({
  subscription,
  onOpenPricing,
  onOpenHistory,
  onOpenOwner,
  savedCount,
  onSubscriptionUpdate,
}) => {
  const currentPlan = PLANS[subscription.plan];

  const handleResetDemo = () => {
    const updated = resetDemoDailyCredits();
    onSubscriptionUpdate(updated);
  };

  const getCreditDisplay = () => {
    if (subscription.isOwner) {
      return (
        <button
          onClick={onOpenOwner}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition"
          title="App Owner Controls"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Owner (Unlimited)</span>
        </button>
      );
    }

    if (subscription.plan === 'enterprise') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Enterprise Unlimited</span>
        </div>
      );
    }

    if (subscription.plan === 'free') {
      const remaining = subscription.dailyChatsRemaining;
      const isLow = remaining <= 1;
      return (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
            isLow 
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}>
            <Zap className={`w-3.5 h-3.5 ${isLow ? 'text-amber-400' : 'text-indigo-400'}`} />
            <span>
              <strong className="font-bold text-white">{remaining}</strong> / 4 Daily Chats
            </span>
          </div>
          <button
            onClick={handleResetDemo}
            title="Demo helper: Reset 4 free daily chats"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Daily</span>
          </button>
        </div>
      );
    }

    // Golden, Diamond, Premium
    const remaining = subscription.monthlyChatsRemaining;
    const limit = currentPlan.monthlyChats;
    const pct = Math.round((remaining / limit) * 100);

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {currentPlan.name}: <strong className="font-bold text-white">{remaining}</strong> / {limit} chats
          </span>
          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" 
              style={{ width: `${Math.max(5, pct)}%` }} 
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20 text-white font-bold ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PromptVibe
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Universal AI Photo & Video Prompt Architect (Midjourney & Runway)
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Credit status */}
          {getCreditDisplay()}

          {/* Owner Dashboard Shortcut - Visible strictly for the Owner */}
          {subscription.isOwner && onOpenOwner && (
            <button
              onClick={onOpenOwner}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition"
              title="Open Owner & Creator Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Owner Console</span>
            </button>
          )}

          {/* Upgrade Button */}
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 hover:brightness-110 active:scale-95 transition"
          >
            <Crown className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden xs:inline">
              {subscription.plan === 'free' ? 'Upgrade Plans' : 'Manage Plan'}
            </span>
            <span className="xs:hidden">Plans</span>
          </button>

          {/* Saved Prompts Library Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Saved</span>
            {savedCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
