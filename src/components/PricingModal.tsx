import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Crown, 
  Zap, 
  Diamond, 
  Sparkles, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  Receipt,
  Users
} from 'lucide-react';
import { PlanTier, UserSubscription } from '../types';
import { PLANS, upgradePlan } from '../utils/subscription';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSubscriptionUpdate,
}) => {
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enterpriseTeamName, setEnterpriseTeamName] = useState('VFX Studio One');
  const [checkoutSuccess, setCheckoutSuccess] = useState<PlanTier | null>(null);

  if (!isOpen) return null;

  const handleStartCheckout = (planId: PlanTier) => {
    if (planId === subscription.plan) return;
    setSelectedPlanForCheckout(planId);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);

    setTimeout(() => {
      const updated = upgradePlan(
        selectedPlanForCheckout, 
        selectedPlanForCheckout === 'enterprise' ? enterpriseTeamName : undefined
      );
      onSubscriptionUpdate(updated);
      setIsProcessing(false);
      setCheckoutSuccess(selectedPlanForCheckout);
      setSelectedPlanForCheckout(null);
    }, 900);
  };

  const planOrder: PlanTier[] = ['free', 'golden', 'diamond', 'premium', 'enterprise'];

  const getPlanIcon = (tier: PlanTier) => {
    switch (tier) {
      case 'free':
        return <Zap className="w-5 h-5 text-indigo-400" />;
      case 'golden':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'diamond':
        return <Diamond className="w-5 h-5 text-cyan-400" />;
      case 'premium':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'enterprise':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="relative px-6 py-8 border-b border-slate-800 bg-gradient-to-b from-slate-800/50 to-slate-900/50 text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scale Your Generative Vision</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Flexible Plans for Every Prompt Architect
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
            Each chat includes full generation requests plus multi-turn refinement cycles. Choose the credit package that matches your production throughput.
          </p>

          {/* Quick Demo Switcher Bar */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Quick Demo Switch:</span>
            {planOrder.map((tier) => (
              <button
                key={tier}
                onClick={() => {
                  const updated = upgradePlan(tier, tier === 'enterprise' ? enterpriseTeamName : undefined);
                  onSubscriptionUpdate(updated);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  subscription.plan === tier
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Success Banner if just upgraded */}
        {checkoutSuccess && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  Plan Activated: {PLANS[checkoutSuccess].name}
                </p>
                <p className="text-xs text-slate-400">
                  {checkoutSuccess === 'enterprise'
                    ? 'Unlimited chats are now unlocked for your team.'
                    : `${PLANS[checkoutSuccess].monthlyChats || PLANS[checkoutSuccess].dailyChats} chats added to your account.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCheckoutSuccess(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              Continue Prompting
            </button>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {planOrder.map((tier) => {
            const plan = PLANS[tier];
            const isCurrent = subscription.plan === tier;
            const isDiamond = tier === 'diamond';

            return (
              <div
                key={tier}
                className={`relative flex flex-col justify-between rounded-xl p-5 border transition-all ${
                  isCurrent
                    ? 'bg-slate-800/80 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl'
                    : isDiamond
                    ? 'bg-gradient-to-b from-cyan-950/30 to-slate-900 border-cyan-500/50 hover:border-cyan-400'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular or Current Badge */}
                {plan.popular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 shadow-md">
                    Most Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white shadow-md">
                    Active Plan
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60">
                      {getPlanIcon(tier)}
                    </div>
                    {tier === 'enterprise' && (
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        Teams
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{plan.name}</h3>

                  {/* Price */}
                  <div className="mt-2 mb-4">
                    {tier === 'free' ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">$0</span>
                        <span className="text-xs text-slate-400">/ forever</span>
                      </div>
                    ) : tier === 'enterprise' ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">Custom</span>
                        <span className="text-xs text-slate-400">/ team</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">
                          ${plan.priceMonthly.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">/ month</span>
                      </div>
                    )}

                    {/* Chat allocation highlighted */}
                    <div className="mt-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                      {tier === 'free' && '4 chats / day'}
                      {tier === 'golden' && '30 chats / month'}
                      {tier === 'diamond' && '80 chats / month'}
                      {tier === 'premium' && '200 chats / month'}
                      {tier === 'enterprise' && 'Unlimited chats'}
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-2 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to action button */}
                <div className="mt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 cursor-default text-center"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartCheckout(tier)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                        isDiamond
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : tier === 'enterprise'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      <span>{tier === 'free' ? 'Switch to Free' : `Get ${plan.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant credit activation. Cancel or adjust anytime without penalties.</span>
          </div>
          <div className="text-slate-500">
            Payment simulator active — test any tier with 1 click.
          </div>
        </div>
      </div>

      {/* Checkout Simulator Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Complete Checkout</h3>
              </div>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Selected Plan</p>
                  <p className="text-sm font-bold text-white">
                    {PLANS[selectedPlanForCheckout].name}
                  </p>
                  <p className="text-xs text-indigo-400">
                    {selectedPlanForCheckout === 'free'
                      ? '4 daily chats'
                      : selectedPlanForCheckout === 'enterprise'
                      ? 'Unlimited chats for larger teams'
                      : `${PLANS[selectedPlanForCheckout].monthlyChats} chats per month`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">
                    {selectedPlanForCheckout === 'free'
                      ? '$0.00'
                      : selectedPlanForCheckout === 'enterprise'
                      ? '$99.00'
                      : `$${PLANS[selectedPlanForCheckout].priceMonthly.toFixed(2)}`}
                  </p>
                  <p className="text-[10px] text-slate-400">Billed monthly</p>
                </div>
              </div>

              {selectedPlanForCheckout === 'enterprise' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization / Team Workspace Name
                  </label>
                  <input
                    type="text"
                    value={enterpriseTeamName}
                    onChange={(e) => setEnterpriseTeamName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Apex Visual Effects Studio"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Includes multi-seat access for up to 50 creators with shared prompt libraries.
                  </p>
                </div>
              )}

              {selectedPlanForCheckout !== 'free' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Simulated Payment Method
                  </label>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span>Card ending in •••• 4242</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Sandbox Verified
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 active:scale-98 text-white transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing Activation...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {selectedPlanForCheckout === 'free'
                          ? 'Confirm Free Tier'
                          : `Confirm & Pay ${
                              selectedPlanForCheckout === 'enterprise'
                                ? '$99.00'
                                : `$${PLANS[selectedPlanForCheckout].priceMonthly.toFixed(2)}`
                            }`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPlanForCheckout(null)}
                  disabled={isProcessing}
                  className="w-full mt-2 py-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
