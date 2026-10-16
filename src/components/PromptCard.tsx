import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Star, 
  Sliders, 
  Film, 
  Eye, 
  Layers, 
  Palette, 
  Sun, 
  Maximize2,
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { PromptResult, StylePreset } from '../types';

interface PromptCardProps {
  prompt: PromptResult;
  onOpenExport: (prompt: PromptResult) => void;
  onQuickRefine: (refinementText: string) => void;
  isSaved?: boolean;
  onToggleSave?: (prompt: PromptResult) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onOpenExport,
  onQuickRefine,
  isSaved = false,
  onToggleSave,
}) => {
  const [activeTab, setActiveTab] = useState<'midjourney' | 'runway' | 'master' | 'anatomy'>('midjourney');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStyleBadgeColor = (style: StylePreset) => {
    switch (style) {
      case 'cinematic':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'photorealistic':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'abstract':
        return 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30';
      case 'anime':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
      case 'scifi':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'fantasy':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case '3d-render':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition-all hover:border-slate-700/80">
      
      {/* Top Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStyleBadgeColor(prompt.stylePreset)}`}>
              {prompt.stylePreset}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              {prompt.mediaType === 'video' ? <Video className="w-3 h-3 text-purple-400" /> : <Camera className="w-3 h-3 text-cyan-400" />}
              <span>{prompt.mediaType === 'video' ? 'AI Video Prompt' : 'AI Photo Prompt'}</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              ar {prompt.aspectRatio}
            </span>
          </div>
          <h4 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
            {prompt.title}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {prompt.summary}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(prompt)}
              className={`p-2 rounded-xl border transition ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isSaved ? 'Saved to library' : 'Save to library'}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          <button
            onClick={() => onOpenExport(prompt)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Export Syntax</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800/80 bg-slate-950/40 px-4 gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('midjourney')}
          className={`py-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition shrink-0 ${
            activeTab === 'midjourney'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Midjourney v6.1</span>
        </button>

        <button
          onClick={() => setActiveTab('runway')}
          className={`py-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition shrink-0 ${
            activeTab === 'runway'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Runway Gen-3</span>
        </button>

        <button
          onClick={() => setActiveTab('master')}
          className={`py-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition shrink-0 ${
            activeTab === 'master'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Master</span>
        </button>

        <button
          onClick={() => setActiveTab('anatomy')}
          className={`py-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition shrink-0 ${
            activeTab === 'anatomy'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Prompt Anatomy</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-5">
        
        {/* MIDJOURNEY TAB */}
        {activeTab === 'midjourney' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Discord Command Format
              </span>
              <button
                onClick={() => handleCopy(prompt.midjourneyPrompt, 'mj')}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition active:scale-95"
              >
                {copiedKey === 'mj' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-200 font-mono leading-relaxed break-words select-all">
              {prompt.midjourneyPrompt}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
              <span className="font-semibold text-slate-300">Flags:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                --ar {prompt.aspectRatio}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                --v 6.1
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                --style raw
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                --stylize 250
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                --chaos 5
              </span>
            </div>
          </div>
        )}

        {/* RUNWAY TAB */}
        {activeTab === 'runway' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Runway Gen-3 Alpha Cinematic Director Syntax
              </span>
              <button
                onClick={() => handleCopy(prompt.runwayPrompt, 'rw')}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition active:scale-95"
              >
                {copiedKey === 'rw' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Runway</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-200 font-mono leading-relaxed break-words select-all">
              {prompt.runwayPrompt}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Camera Kinematics:</span>
                <span className="text-white text-xs font-medium">{prompt.cameraSettings.movement}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Lens & Shutter:</span>
                <span className="text-white text-xs font-medium">{prompt.cameraSettings.lens} @ 24fps</span>
              </div>
            </div>
          </div>
        )}

        {/* UNIVERSAL MASTER TAB */}
        {activeTab === 'master' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Flux.1 / SDXL / Sora Master Prompt
              </span>
              <button
                onClick={() => handleCopy(prompt.masterPrompt, 'master')}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition active:scale-95"
              >
                {copiedKey === 'master' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Master</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed select-all">
              {prompt.masterPrompt}
            </div>

            {prompt.negativePrompt && (
              <div className="pt-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  Negative Prompt:
                </span>
                <p className="text-[11px] text-rose-300/80 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                  {prompt.negativePrompt}
                </p>
              </div>
            )}
          </div>
        )}

        {/* PROMPT ANATOMY TAB */}
        {activeTab === 'anatomy' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/20">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Eye className="w-3 h-3" />
                Subject
              </span>
              <p className="text-slate-300 text-[11px] leading-snug">
                {prompt.promptBreakdown.subject}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Compass className="w-3 h-3" />
                Environment & Depth
              </span>
              <p className="text-slate-300 text-[11px] leading-snug">
                {prompt.promptBreakdown.environment}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Sun className="w-3 h-3" />
                Lighting & Temperature
              </span>
              <p className="text-slate-300 text-[11px] leading-snug">
                {prompt.promptBreakdown.lighting}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/20">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Camera className="w-3 h-3" />
                Optics & Sensor
              </span>
              <p className="text-slate-300 text-[11px] leading-snug">
                {prompt.promptBreakdown.camera}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/20">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Palette className="w-3 h-3" />
                Tactile Aesthetics
              </span>
              <p className="text-slate-300 text-[11px] leading-snug">
                {prompt.promptBreakdown.aesthetics}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Video className="w-3 h-3" />
                Motion Kinematics
              </span>
              <p className="text-slate-300 text-[11px] leading-snug">
                {prompt.promptBreakdown.motion}
              </p>
            </div>
          </div>
        )}

        {/* Variations Section */}
        {prompt.variations && prompt.variations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Explore Dynamic Variations:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {prompt.variations.map((v, i) => (
                <button
                  key={i}
                  onClick={() => onQuickRefine(`Apply variation ${i + 1}: ${v}`)}
                  className="text-left p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition group"
                >
                  <span className="text-indigo-400 font-bold block mb-0.5 group-hover:text-indigo-300">
                    Option {i + 1}
                  </span>
                  <span className="line-clamp-2 leading-tight">{v}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Refine Action Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Refine:</span>
          
          <button
            onClick={() => onQuickRefine('Make it more cinematic with 35mm anamorphic flares, 24fps motion, and moody volumetric chiaroscuro')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-300 border border-slate-700 text-slate-300 transition"
          >
            🎬 Cinematic 35mm
          </button>

          <button
            onClick={() => onQuickRefine('Maximize photorealism with medium format Hasselblad optics, natural overcast daylight, and micro skin pores')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300 border border-slate-700 text-slate-300 transition"
          >
            📸 Hyper-Photorealistic
          </button>

          <button
            onClick={() => onQuickRefine('Transform into abstract avant-garde artistic style with fluid acrylic textures, geometric fractures, and iridescent caustics')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/40 hover:text-fuchsia-300 border border-slate-700 text-slate-300 transition"
          >
            🎨 Abstract Art
          </button>

          <button
            onClick={() => onQuickRefine('Add dynamic Runway camera motion: continuous orbital tracking dolly 360 degrees at 1.0x speed')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-300 border border-slate-700 text-slate-300 transition"
          >
            🎥 Runway Orbit Camera
          </button>

          <button
            onClick={() => onQuickRefine('Shift lighting to 2800K golden hour horizon with dramatic long shadows and soft atmospheric mist')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-300 border border-slate-700 text-slate-300 transition"
          >
            🌅 Golden Hour
          </button>
        </div>

      </div>
    </div>
  );
};
