import React, { useState } from 'react';
import { 
  Sparkles, 
  Maximize2, 
  Download, 
  RefreshCw, 
  Camera, 
  Sliders, 
  Eye, 
  Grid, 
  Film, 
  Layers, 
  Sun,
  X
} from 'lucide-react';
import { PromptResult, AspectRatio, StylePreset } from '../types';

interface ImagePreviewPlaceholderProps {
  prompt: PromptResult;
  onUpdatePreviewImage?: (imageUrl: string) => void;
}

export const ImagePreviewPlaceholder: React.FC<ImagePreviewPlaceholderProps> = ({
  prompt,
  onUpdatePreviewImage,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(prompt.previewImageUrl || null);
  const [showGrid, setShowGrid] = useState(false);
  const [colorFilter, setColorFilter] = useState<'normal' | 'anamorphic' | 'noir' | 'warm'>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Determine aspect ratio class
  const getAspectRatioClass = (ar: AspectRatio) => {
    switch (ar) {
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16] max-w-[280px] mx-auto';
      case '1:1':
        return 'aspect-square max-w-[420px] mx-auto';
      case '4:5':
        return 'aspect-[4/5] max-w-[340px] mx-auto';
      case '21:9':
        return 'aspect-[21/9]';
      default:
        return 'aspect-video';
    }
  };

  // Dynamic aesthetic gradient backgrounds per style preset
  const getStyleThemeGradients = (style: StylePreset) => {
    switch (style) {
      case 'cinematic':
        return 'from-amber-950/80 via-slate-900 to-indigo-950/90 text-amber-300';
      case 'photorealistic':
        return 'from-emerald-950/80 via-slate-900 to-teal-950/90 text-emerald-300';
      case 'abstract':
        return 'from-fuchsia-950/80 via-purple-900 to-cyan-950/90 text-fuchsia-300';
      case 'anime':
        return 'from-pink-950/80 via-sky-900 to-indigo-950/90 text-pink-300';
      case 'scifi':
        return 'from-cyan-950/80 via-slate-950 to-blue-950/90 text-cyan-300';
      case 'fantasy':
        return 'from-purple-950/80 via-slate-900 to-violet-950/90 text-purple-300';
      default:
        return 'from-indigo-950/80 via-slate-900 to-slate-950 text-indigo-300';
    }
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-preview-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.masterPrompt,
          style: prompt.stylePreset,
          aspectRatio: prompt.aspectRatio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setCurrentImage(data.imageUrl);
          if (onUpdatePreviewImage) {
            onUpdatePreviewImage(data.imageUrl);
          }
        }
      }
    } catch (err) {
      console.error('Failed to generate preview image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSnapshot = () => {
    if (!currentImage) return;
    const a = document.createElement('a');
    a.href = currentImage;
    a.download = `preview-${prompt.stylePreset}-${prompt.aspectRatio}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFilterStyle = () => {
    switch (colorFilter) {
      case 'anamorphic':
        return 'contrast-125 saturate-125 hue-rotate-15';
      case 'noir':
        return 'grayscale contrast-150';
      case 'warm':
        return 'sepia-50 saturate-110 hue-rotate-[-10deg]';
      default:
        return '';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>Live Visual Impact Preview</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                {prompt.aspectRatio}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Instant aesthetic simulation with lighting, camera optics, and framing geometry
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              showGrid
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Rule-of-Thirds Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value as any)}
            className="text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="normal">Natural Look</option>
            <option value="anamorphic">Teal & Amber</option>
            <option value="noir">Monochrome Noir</option>
            <option value="warm">Kodachrome 64</option>
          </select>

          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 active:scale-95 text-white transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{currentImage ? 'Regenerate Preview' : 'Generate AI Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-black flex items-center justify-center group shadow-inner">
        <div className={`relative w-full ${getAspectRatioClass(prompt.aspectRatio)} overflow-hidden transition-all duration-300 ${getFilterStyle()}`}>
          
          {/* Background image or rich generative aesthetic backdrop */}
          {currentImage ? (
            <img
              src={currentImage}
              alt={prompt.title}
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getStyleThemeGradients(prompt.stylePreset)} flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden select-none`}>
              {/* Volumetric flare element */}
              <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

              {/* Top HUD */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold tracking-wider">REC [24.00 FPS]</span>
                  <span className="text-white/40">|</span>
                  <span>ISO 100</span>
                  <span className="text-white/40">|</span>
                  <span>f/1.8</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 uppercase tracking-widest text-[10px] text-cyan-300">
                    {prompt.stylePreset}
                  </span>
                  <span>4K PRORES</span>
                </div>
              </div>

              {/* Center Composition Preview & Subject Focus */}
              <div className="relative z-10 text-center max-w-lg mx-auto space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl mx-auto">
                  <Film className="w-7 h-7 text-indigo-300" />
                </div>
                <h5 className="text-base sm:text-lg font-extrabold text-white tracking-tight drop-shadow-md">
                  {prompt.title}
                </h5>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed drop-shadow bg-black/30 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  {prompt.masterPrompt}
                </p>
              </div>

              {/* Bottom Telemetry HUD */}
              <div className="relative z-10 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-mono text-white/70 bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10 gap-2">
                <span>LENS: {prompt.cameraSettings.lens}</span>
                <span>STOCK: {prompt.cameraSettings.filmStock}</span>
                <span className="text-amber-300">LIGHT: {prompt.cameraSettings.lighting.slice(0, 32)}...</span>
              </div>
            </div>
          )}

          {/* Rule of Thirds Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>
            </div>
          )}

          {/* Viewport Hover Actions */}
          <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
            {currentImage && (
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md border border-white/20 transition"
                title="Download preview image"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md border border-white/20 transition"
              title="Fullscreen view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Loading Indicator */}
          {isGenerating && (
            <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-bold text-white tracking-wide">
                Synthesizing Visual Impact Preview...
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Simulating camera focal depth, illumination falloff, and texture shaders.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          <span>Focal Geometry: <strong className="text-white">{prompt.cameraSettings.angle}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Optics: <strong className="text-white">{prompt.cameraSettings.lens}</strong></span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt={prompt.title}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <div className="p-8 text-center text-white space-y-4">
                <h3 className="text-2xl font-bold">{prompt.title}</h3>
                <p className="text-sm text-slate-300 max-w-xl mx-auto">{prompt.masterPrompt}</p>
                <button
                  onClick={handleGeneratePreview}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Generate AI Preview
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
