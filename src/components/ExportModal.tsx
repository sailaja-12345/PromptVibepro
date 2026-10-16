import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Film, 
  Camera, 
  Sliders, 
  Terminal, 
  Share2, 
  FileText, 
  Code2,
  Video
} from 'lucide-react';
import { PromptResult, AspectRatio } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptResult: PromptResult | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  promptResult,
}) => {
  const [activeTab, setActiveTab] = useState<'midjourney' | 'runway' | 'master' | 'json'>('midjourney');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom Midjourney Flag Overrides
  const [mjVersion, setMjVersion] = useState<'6.1' | '6.0' | '5.2' | 'niji 6'>('6.1');
  const [mjAr, setMjAr] = useState<AspectRatio>(promptResult?.aspectRatio || '16:9');
  const [mjStylize, setMjStylize] = useState<number>(250);
  const [mjChaos, setMjChaos] = useState<number>(5);
  const [mjRaw, setMjRaw] = useState<boolean>(true);
  const [includeNegative, setIncludeNegative] = useState<boolean>(true);

  // Custom Runway Overrides
  const [cameraMovement, setCameraMovement] = useState<string>(
    promptResult?.cameraSettings.movement || 'Slow tracking dolly push-in with subtle pan right'
  );
  const [cameraSpeed, setCameraSpeed] = useState<'0.5x' | '1.0x' | '1.5x' | '2.0x'>('1.0x');
  const [motionIntensity, setMotionIntensity] = useState<number>(4);
  const [videoDuration, setVideoDuration] = useState<'5s' | '10s'>('5s');

  if (!isOpen || !promptResult) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadTxt = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build Midjourney Command dynamically
  const cleanedSubject = promptResult.masterPrompt
    .replace(/Captured on [^.]+?\./gi, '')
    .trim();

  let dynamicMjPrompt = `/imagine prompt: ${cleanedSubject}, ${promptResult.cameraSettings.lighting}, ${promptResult.cameraSettings.lens}, ${promptResult.cameraSettings.filmStock} --ar ${mjAr} --v ${mjVersion}`;
  if (mjRaw) dynamicMjPrompt += ' --style raw';
  if (mjStylize !== 100) dynamicMjPrompt += ` --stylize ${mjStylize}`;
  if (mjChaos > 0) dynamicMjPrompt += ` --chaos ${mjChaos}`;
  if (includeNegative && promptResult.negativePrompt) {
    const cleanNeg = promptResult.negativePrompt.split(',').slice(0, 5).join(', ').trim();
    dynamicMjPrompt += ` --no ${cleanNeg}`;
  }

  // Build Runway Gen-3 Command dynamically
  const dynamicRunwayPrompt = `[Camera: ${cameraMovement}, ${cameraSpeed} speed, 24fps] [Subject & Motion: ${promptResult.promptBreakdown.subject}, motion intensity ${motionIntensity}/10, duration ${videoDuration}] [Lighting & Environment: ${promptResult.cameraSettings.lighting}, ${promptResult.promptBreakdown.environment}] [Cinematography: ${promptResult.cameraSettings.lens}, ${promptResult.cameraSettings.filmStock}, seamless continuous physics]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg tracking-tight">
                Export Prompt for AI Engines
              </h3>
              <p className="text-xs text-slate-400">
                Precision formatted for Midjourney v6.1, Runway Gen-3 Alpha, and Flux.1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('midjourney')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'midjourney'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Midjourney v6.1 Command</span>
          </button>

          <button
            onClick={() => setActiveTab('runway')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'runway'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Runway Gen-3 Director</span>
          </button>

          <button
            onClick={() => setActiveTab('master')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'master'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Universal Master Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Raw JSON Data</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* MIDJOURNEY TAB */}
          {activeTab === 'midjourney' && (
            <div className="space-y-5">
              {/* Parameter Controls */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Midjourney Parameter Customizer</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Model Version</label>
                    <select
                      value={mjVersion}
                      onChange={(e) => setMjVersion(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="6.1">v6.1 (Latest)</option>
                      <option value="6.0">v6.0</option>
                      <option value="5.2">v5.2</option>
                      <option value="niji 6">Niji 6 (Anime)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Aspect Ratio (--ar)</label>
                    <select
                      value={mjAr}
                      onChange={(e) => setMjAr(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="16:9">16:9 (Landscape Cinematic)</option>
                      <option value="9:16">9:16 (Portrait / Reels)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:5">4:5 (Instagram / Social)</option>
                      <option value="21:9">21:9 (Ultrawide Anamorphic)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400 font-medium">Stylize (--s)</label>
                      <span className="text-indigo-400 font-bold">{mjStylize}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={mjStylize}
                      onChange={(e) => setMjStylize(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400 font-medium">Chaos (--c)</label>
                      <span className="text-indigo-400 font-bold">{mjChaos}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={mjChaos}
                      onChange={(e) => setMjChaos(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={mjRaw}
                      onChange={(e) => setMjRaw(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Add <code className="text-indigo-300">--style raw</code> (authenticity)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeNegative}
                      onChange={(e) => setIncludeNegative(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Include <code className="text-indigo-300">--no</code> negative filters</span>
                  </label>
                </div>
              </div>

              {/* Formatted Code Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Ready-to-Paste Discord / Imagine Command
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(dynamicMjPrompt, 'mj')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95"
                    >
                      {copiedKey === 'mj' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Command</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadTxt('midjourney-prompt.txt', dynamicMjPrompt)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Download as .txt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-200 font-mono text-xs leading-relaxed break-all select-all shadow-inner">
                  {dynamicMjPrompt}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                💡 <strong>Midjourney Tip:</strong> Paste directly into any Discord server with the Midjourney bot or the midjourney.com web interface prompt box.
              </div>
            </div>
          )}

          {/* RUNWAY TAB */}
          {activeTab === 'runway' && (
            <div className="space-y-5">
              {/* Runway Director Controls */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Runway Gen-3 Camera & Motion Director</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Camera Movement</label>
                    <select
                      value={cameraMovement}
                      onChange={(e) => setCameraMovement(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Slow tracking dolly push-in with subtle pan right">Dolly Push-in + Subtle Pan</option>
                      <option value="Fast dynamic tracking forward low-angle shot">Kinetic Tracking Low-Angle</option>
                      <option value="Continuous orbital 360-degree rotation around subject">Orbital 360° Rotation</option>
                      <option value="Smooth crane pedestal rise revealing panoramic horizon">Crane Pedestal Rise</option>
                      <option value="Static deliberate tripod framing with organic wind motion">Static Tripod Hold</option>
                      <option value="Slow cinematic zoom out revealing massive scale">Slow Zoom Out</option>
                      <option value="Handheld documentary follow camera with organic sway">Handheld Follow Sway</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Camera Speed</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['0.5x', '1.0x', '1.5x', '2.0x'] as const).map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setCameraSpeed(spd)}
                          className={`py-1.5 rounded text-center text-xs font-bold transition ${
                            cameraSpeed === spd
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Target Duration</label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['5s', '10s'] as const).map((dur) => (
                        <button
                          key={dur}
                          onClick={() => setVideoDuration(dur)}
                          className={`py-1.5 rounded text-center text-xs font-bold transition ${
                            videoDuration === dur
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-400 font-medium">Motion Intensity Vector</span>
                    <span className="text-purple-400 font-bold">{motionIntensity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={motionIntensity}
                    onChange={(e) => setMotionIntensity(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Formatted Code Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    Runway Gen-3 Alpha Prompt Structure
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(dynamicRunwayPrompt, 'rw')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition active:scale-95"
                    >
                      {copiedKey === 'rw' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Runway Prompt</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadTxt('runway-gen3-prompt.txt', dynamicRunwayPrompt)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Download as .txt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-purple-200 font-mono text-xs leading-relaxed break-all select-all shadow-inner">
                  {dynamicRunwayPrompt}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                🎥 <strong>Runway Gen-3 Alpha Tip:</strong> Runway responds best to bracketed tokens like <code>[Camera: ...]</code> and <code>[Subject: ...]</code> to separate physical kinematics from visual rendering traits.
              </div>
            </div>
          )}

          {/* MASTER / UNIVERSAL TAB */}
          {activeTab === 'master' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Universal Prompt (Compatible with Flux.1, SDXL, Sora, DALL-E 3)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(promptResult.masterPrompt, 'master')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95"
                  >
                    {copiedKey === 'master' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Master</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadTxt('master-prompt.txt', promptResult.masterPrompt)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Download as .txt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed select-all">
                {promptResult.masterPrompt}
              </div>

              {promptResult.negativePrompt && (
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs font-bold text-rose-400">
                    <span>Negative Prompt (What to Avoid)</span>
                    <button
                      onClick={() => handleCopy(promptResult.negativePrompt, 'neg')}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'neg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Negative</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs">
                    {promptResult.negativePrompt}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JSON TAB */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Raw Structured JSON Payload
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(promptResult, null, 2), 'json')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95"
                  >
                    {copiedKey === 'json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadTxt(
                        'prompt-architecture.json',
                        JSON.stringify(promptResult, null, 2)
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Download as .json"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 select-all">
                {JSON.stringify(promptResult, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <span>Engine target: <strong>{activeTab.toUpperCase()}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
