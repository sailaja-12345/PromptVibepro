import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Crown, 
  Film, 
  Camera, 
  Palette, 
  Layers, 
  Check, 
  Zap, 
  Video, 
  HelpCircle,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Sliders,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Header } from './components/Header';
import { ChatRefinementStudio } from './components/ChatRefinementStudio';
import { PricingModal } from './components/PricingModal';
import { ExportModal } from './components/ExportModal';
import { SavedPromptsDrawer } from './components/SavedPromptsDrawer';
import { OwnerDashboardModal } from './components/OwnerDashboardModal';
import { UserSubscription, PromptResult } from './types';
import { loadUserSubscription, saveUserSubscription, resetDemoDailyCredits } from './utils/subscription';

const SAVED_STORAGE_KEY = 'promptvibe_saved_prompts';

export default function App() {
  const [subscription, setSubscription] = useState<UserSubscription>(loadUserSubscription);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [exportTargetPrompt, setExportTargetPrompt] = useState<PromptResult | null>(null);

  // Saved Prompts Library
  const [savedPrompts, setSavedPrompts] = useState<PromptResult[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedPrompts));
    } catch (err) {
      console.error('Failed to save prompts to local storage:', err);
    }
  }, [savedPrompts]);

  const handleToggleSave = (prompt: PromptResult) => {
    setSavedPrompts((prev) => {
      const exists = prev.some((p) => p.id === prompt.id || p.title === prompt.title);
      if (exists) {
        return prev.filter((p) => (p.id ? p.id !== prompt.id : p.title !== prompt.title));
      } else {
        return [prompt, ...prev];
      }
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Navigation Header */}
      <Header
        subscription={subscription}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenOwner={() => setIsOwnerOpen(true)}
        savedCount={savedPrompts.length}
        onSubscriptionUpdate={setSubscription}
      />

      {/* Main Studio Body */}
      <main className="flex-1">
        <ChatRefinementStudio
          subscription={subscription}
          onSubscriptionUpdate={setSubscription}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenExport={(prompt) => setExportTargetPrompt(prompt)}
          savedPrompts={savedPrompts}
          onToggleSave={handleToggleSave}
        />

        {/* Feature Highlights Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Multi-Model Visual Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 tracking-tight">
              Supported Artistic Styles & Engine Formats
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every prompt is dynamically translated into native syntax flags for Midjourney v6.1 and Runway Gen-3 Alpha.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cinematic Style Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/20 to-slate-900 border border-amber-500/30 hover:border-amber-400/50 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4 border border-amber-500/30">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Cinematic Style</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Anamorphic lenses (Cooke, Arri Master Anamorphic), 35mm / 65mm IMAX film stocks, dramatic volumetric chiaroscuro lighting, natural halation, and DaVinci color grading.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-200/90">
                --v 6.1 --ar 16:9 --style raw [Camera: 35mm anamorphic tracking dolly]
              </div>
            </div>

            {/* Photorealistic Style Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/20 to-slate-900 border border-emerald-500/30 hover:border-emerald-400/50 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4 border border-emerald-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Photorealistic Style</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                True optical mechanics without CGI plastic sheen. Hasselblad H6D-100c medium format sensors, f/1.4 aperture falloff, natural diffuse overcast daylight, and micro-skin textures.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-200/90">
                --stylize 250 --no plastic, CGI, airbrushed, unretouched raw photo
              </div>
            </div>

            {/* Abstract Artistic Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-fuchsia-950/20 to-slate-900 border border-fuchsia-500/30 hover:border-fuchsia-400/50 transition">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center mb-4 border border-fuchsia-500/30">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Abstract Artistic</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Deconstructed Bauhaus shapes, fluid acrylic suspended in mineral oils, chromatic dispersion, iridescent light caustics, and tactile heavy impasto textures.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-fuchsia-200/90">
                --chaos 15 --weird 100 [Camera: Hypnotic rotational roll through fractal planes]
              </div>
            </div>

          </div>
        </section>

        {/* Pricing Tiers Overview */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Transparent Credit Architecture
              </span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                4 Free Chats / Day or Scale from $5.00/mo
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Free users get 4 chats every single day with automatic 24h reset. Need more bandwidth? Upgrade to Golden (30 chats / $5.00), Diamond (80 chats / $12.00), Premium (200 chats / $25.00), or Enterprise unlimited.
              </p>
            </div>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-orange-500/20 shrink-0 transition"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span>View All Plans & Perks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">PromptVibe AI Studio</span>
            <span>—</span>
            <span>Midjourney v6.1 & Runway Gen-3 Prompt Engineer</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {subscription.isOwner && (
              <button onClick={() => setIsOwnerOpen(true)} className="text-amber-400 hover:text-amber-300 font-semibold transition">
                Owner Console
              </button>
            )}
            <button onClick={() => setIsPricingOpen(true)} className="hover:text-white transition">
              Plans & Pricing
            </button>
            <button
              onClick={() => {
                const updated = resetDemoDailyCredits();
                setSubscription(updated);
              }}
              className="hover:text-indigo-400 transition"
            >
              Reset 4 Daily Chats (Demo)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <OwnerDashboardModal
        isOpen={isOwnerOpen}
        onClose={() => setIsOwnerOpen(false)}
        subscription={subscription}
        onSubscriptionUpdate={setSubscription}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        subscription={subscription}
        onSubscriptionUpdate={setSubscription}
      />

      <ExportModal
        isOpen={Boolean(exportTargetPrompt)}
        onClose={() => setExportTargetPrompt(null)}
        promptResult={exportTargetPrompt}
      />

      <SavedPromptsDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedPrompts={savedPrompts}
        onRemoveSaved={handleRemoveSaved}
        onLoadIntoChat={(p) => {
          // Open into export or allow copy
          setExportTargetPrompt(p);
        }}
        onOpenExport={(p) => setExportTargetPrompt(p)}
      />

    </div>
  );
}
