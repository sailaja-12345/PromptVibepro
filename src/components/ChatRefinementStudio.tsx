import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Camera, 
  Video, 
  Layers, 
  RotateCcw, 
  Sliders, 
  Compass, 
  Zap, 
  AlertCircle, 
  Crown, 
  ChevronRight,
  Flame,
  Wand2,
  HelpCircle,
  PlusCircle,
  Lightbulb
} from 'lucide-react';
import { 
  PromptResult, 
  MediaType, 
  StylePreset, 
  TargetEngine, 
  AspectRatio, 
  ChatMessage, 
  ChatSession, 
  UserSubscription 
} from '../types';
import { PromptCard } from './PromptCard';
import { canConsumeChat, consumeChatCredit } from '../utils/subscription';

interface ChatRefinementStudioProps {
  subscription: UserSubscription;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
  onOpenPricing: () => void;
  onOpenExport: (prompt: PromptResult) => void;
  savedPrompts: PromptResult[];
  onToggleSave: (prompt: PromptResult) => void;
}

const INSPIRATION_TEMPLATES = [
  {
    title: 'Cinematic Anamorphic Samurai',
    idea: 'A cybernetic ronin wandering through a rain-drenched neon alley in Neo-Kyoto with reflections in puddles',
    mediaType: 'photo' as MediaType,
    style: 'cinematic' as StylePreset,
    ar: '16:9' as AspectRatio,
    engine: 'midjourney' as TargetEngine,
  },
  {
    title: 'Hyper-Photorealistic Macro',
    idea: 'Intricate close-up portrait of an elderly watchmaker with fine wrinkles, brass gears reflecting in round spectacles, natural window light',
    mediaType: 'photo' as MediaType,
    style: 'photorealistic' as StylePreset,
    ar: '4:5' as AspectRatio,
    engine: 'all' as TargetEngine,
  },
  {
    title: 'Runway Drone Flight Video',
    idea: 'Sweeping aerial tracking shot flying low over black volcanic sand dunes meeting turquoise crashing arctic waves at golden hour',
    mediaType: 'video' as MediaType,
    style: 'cinematic' as StylePreset,
    ar: '16:9' as AspectRatio,
    engine: 'runway' as TargetEngine,
  },
  {
    title: 'Surreal Abstract Sculpture',
    idea: 'Avant-garde kinetic sculpture made of iridescent liquid glass and flowing metallic chrome ribbons suspended in deep cosmic void',
    mediaType: 'photo' as MediaType,
    style: 'abstract' as StylePreset,
    ar: '1:1' as AspectRatio,
    engine: 'all' as TargetEngine,
  },
];

export const ChatRefinementStudio: React.FC<ChatRefinementStudioProps> = ({
  subscription,
  onSubscriptionUpdate,
  onOpenPricing,
  onOpenExport,
  savedPrompts,
  onToggleSave,
}) => {
  // Session Configuration
  const [ideaInput, setIdeaInput] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [stylePreset, setStylePreset] = useState<StylePreset>('cinematic');
  const [targetEngine, setTargetEngine] = useState<TargetEngine>('all');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  // Active Chat Session state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activePrompt, setActivePrompt] = useState<PromptResult | null>(null);
  const [refinementInput, setRefinementInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleApplyTemplate = (tpl: typeof INSPIRATION_TEMPLATES[0]) => {
    setIdeaInput(tpl.idea);
    setMediaType(tpl.mediaType);
    setStylePreset(tpl.style);
    setAspectRatio(tpl.ar);
    setTargetEngine(tpl.engine);
  };

  // Start new generation request (consumes 1 chat credit)
  const handleStartGeneration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ideaInput.trim() || isLoading) return;

    // Check credits
    if (!canConsumeChat(subscription)) {
      setErrorMsg('You have reached your chat credit limit. Upgrade your plan to continue generating!');
      onOpenPricing();
      return;
    }

    // Deduct 1 credit for new chat generation & refinement cycle
    const creditResult = consumeChatCredit(subscription);
    if (!creditResult.success) {
      setErrorMsg('No chat credits remaining. Please upgrade your plan.');
      onOpenPricing();
      return;
    }
    onSubscriptionUpdate(creditResult.updatedSub);

    setErrorMsg(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: ideaInput.trim(),
      timestamp: Date.now(),
      isInitial: true,
    };

    setMessages([userMsg]);
    const currentIdea = ideaInput.trim();
    setIdeaInput('');

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: currentIdea,
          mediaType,
          style: stylePreset,
          targetEngine,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed with HTTP status ${response.status}`);
      }

      const promptData: PromptResult = await response.json();
      promptData.id = `prompt-${Date.now()}`;
      promptData.mediaType = mediaType;
      promptData.stylePreset = stylePreset;
      promptData.aspectRatio = aspectRatio;
      promptData.targetEngine = targetEngine;
      promptData.timestamp = Date.now();

      setActivePrompt(promptData);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've synthesized a professional prompt architecture for "${promptData.title}" tailored for Midjourney and Runway. You can refine this vision below as part of this chat cycle!`,
        promptResult: promptData,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error generating prompt:', err);
      setErrorMsg(err?.message || 'Failed to generate prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refine existing prompt inside the active chat cycle
  const handleRefinePrompt = async (refinementText: string) => {
    if (!refinementText.trim() || isLoading || !activePrompt) return;

    setErrorMsg(null);
    setIsLoading(true);

    const userRefineMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: refinementText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userRefineMsg]);
    setRefinementInput('');

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: activePrompt.masterPrompt,
          mediaType: activePrompt.mediaType || mediaType,
          style: activePrompt.stylePreset || stylePreset,
          targetEngine: activePrompt.targetEngine || targetEngine,
          aspectRatio: activePrompt.aspectRatio || aspectRatio,
          customRefinement: refinementText.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Refinement failed with HTTP status ${response.status}`);
      }

      const updatedPrompt: PromptResult = await response.json();
      updatedPrompt.id = `prompt-${Date.now()}`;
      updatedPrompt.mediaType = activePrompt.mediaType || mediaType;
      updatedPrompt.stylePreset = activePrompt.stylePreset || stylePreset;
      updatedPrompt.aspectRatio = activePrompt.aspectRatio || aspectRatio;
      updatedPrompt.targetEngine = activePrompt.targetEngine || targetEngine;
      updatedPrompt.timestamp = Date.now();

      setActivePrompt(updatedPrompt);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Refined prompt based on: "${refinementText.trim()}". All syntax tags for Midjourney v6.1 and Runway Gen-3 have been calibrated.`,
        promptResult: updatedPrompt,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error refining prompt:', err);
      setErrorMsg(err?.message || 'Failed to refine prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFreshChat = () => {
    setMessages([]);
    setActivePrompt(null);
    setRefinementInput('');
    setErrorMsg(null);
  };

  const isOutOfCredits = !canConsumeChat(subscription);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Out of credit banner if reached 0 */}
      {isOutOfCredits && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Daily Chat Credits Exhausted (0 / 4 Remaining)</h4>
              <p className="text-xs text-slate-300">
                Free credits refresh every 24h, or unlock 30 to 200 monthly chats with Golden, Diamond, or Premium.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPricing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade Plans ($5.00+)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Studio View */}
      {messages.length === 0 ? (
        /* INITIAL GENERATOR HERO & INPUT */
        <div className="space-y-8">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Next-Gen Visual Prompt Engineering</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Turn Raw Ideas into <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Hollywood-Grade Prompts
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Engineered specifically for <strong>Midjourney v6.1</strong> and <strong>Runway Gen-3</strong> with native support for Cinematic, Photorealistic, and Abstract styles.
            </p>
          </div>

          {/* Generator Configurator Box */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
            
            {/* Style, Engine, and Media Type Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Media Type Toggle */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Target Format
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMediaType('photo')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                      mediaType === 'photo'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>AI Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                      mediaType === 'video'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>AI Video (Runway)</span>
                  </button>
                </div>
              </div>

              {/* Style Presets */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Artistic Style Preset
                </label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="cinematic">🎬 Cinematic (35mm Anamorphic, Volumetric)</option>
                  <option value="photorealistic">📸 Photorealistic (Medium Format Hasselblad)</option>
                  <option value="abstract">🎨 Abstract Artistic (Fluid Geometries, Caustics)</option>
                  <option value="anime">🎌 Anime & Manga (Makoto Shinkai / Ghibli)</option>
                  <option value="scifi">🛸 Sci-Fi Neo-Noir (Cyberpunk & Holographic)</option>
                  <option value="fantasy">🐉 Dark Fantasy (Ethereal Gothic & Mist)</option>
                  <option value="3d-render">🧊 3D Octane / Unreal 5 (Raytraced Shading)</option>
                </select>
              </div>

              {/* Target Engine & Aspect Ratio */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Primary Engine
                  </label>
                  <select
                    value={targetEngine}
                    onChange={(e) => setTargetEngine(e.target.value as TargetEngine)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">⚡ All Supported</option>
                    <option value="midjourney">Midjourney v6.1</option>
                    <option value="runway">Runway Gen-3</option>
                    <option value="flux">Flux.1 / SDXL</option>
                    <option value="dalle3">DALL-E 3</option>
                    <option value="sora">OpenAI Sora</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait / Reel)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Instagram)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleStartGeneration} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center justify-between">
                  <span>Describe your concept, character, scene, or action:</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    A chat cycle includes generation + unlimited refinement
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={ideaInput}
                    onChange={(e) => setIdeaInput(e.target.value)}
                    placeholder="e.g. A cyberpunk street vendor in rainy Neo-Tokyo serving glowing ramen under holographic neon advertisements, atmospheric mist, cinematic reflections..."
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed"
                  />
                  
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!ideaInput.trim() || isLoading}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Architecting Prompt...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Prompt Architecture</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>

            {/* Curated Templates Carousel */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Quick Inspiration Starters
                </span>
                <span className="text-[11px] text-slate-500">1-click to test presets</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {INSPIRATION_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                        {tpl.style}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {tpl.mediaType === 'video' ? 'Video' : 'Photo'}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {tpl.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {tpl.idea}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ACTIVE CHAT & REFINEMENT THREAD */
        <div className="space-y-6">
          
          {/* Active Session Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="font-bold text-white text-sm">
                  Active Prompt Refinement Chat
                </p>
                <p className="text-slate-400 text-[11px]">
                  Refining your prompt vision with instant Midjourney & Runway flag updates.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartFreshChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Prompt Chat</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-2xl p-4 rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm shadow-md font-medium leading-relaxed">
                    <p>{msg.content}</p>
                    <span className="text-[10px] text-indigo-200 mt-1 block text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-300">PromptVibe AI Architect</span>
                      <span>•</span>
                      <span>{msg.content}</span>
                    </div>

                    {msg.promptResult && (
                      <PromptCard
                        prompt={msg.promptResult}
                        onOpenExport={onOpenExport}
                        onQuickRefine={(text) => handleRefinePrompt(text)}
                        isSaved={savedPrompts.some((p) => p.id === msg.promptResult?.id)}
                        onToggleSave={onToggleSave}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-300 font-medium animate-pulse">
                  Calibrating cinematics, optical lenses, and motion tokens...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Refinement Input Bar */}
          <div className="sticky bottom-4 z-30 pt-2">
            <div className="rounded-2xl bg-slate-900/95 border border-slate-700/80 p-3 backdrop-blur-xl shadow-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRefinePrompt(refinementInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="Refine this prompt... (e.g. 'Add anamorphic lens flares', 'Switch to Runway continuous drone zoom', 'Make it hyper-photorealistic')"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!refinementInput.trim() || isLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refine</span>
                </button>
              </form>

              {/* Quick Prompt Refinement Chips */}
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
                <span className="text-slate-500 shrink-0 font-medium">Quick suggestions:</span>
                <button
                  type="button"
                  onClick={() => handleRefinePrompt('Convert to 35mm anamorphic widescreen with cinematic volumetric rim lighting')}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                >
                  🎬 35mm Anamorphic
                </button>
                <button
                  type="button"
                  onClick={() => handleRefinePrompt('Maximize raw photorealism with medium format Hasselblad 100mm lens and unretouched micro skin pores')}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                >
                  📸 Raw Photorealism
                </button>
                <button
                  type="button"
                  onClick={() => handleRefinePrompt('Transform into abstract surrealism with fluid acrylic marble caustics and geometric crystal refraction')}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                >
                  🎨 Abstract Fluid Art
                </button>
                <button
                  type="button"
                  onClick={() => handleRefinePrompt('Add Runway Gen-3 orbital camera motion rotating 360 degrees around focal point')}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                >
                  🎥 Runway Orbital Motion
                </button>
                <button
                  type="button"
                  onClick={() => handleRefinePrompt('Change aspect ratio to 9:16 vertical portrait for mobile reels')}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                >
                  📱 9:16 Mobile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
