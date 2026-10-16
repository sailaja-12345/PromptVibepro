import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Share2, 
  Star, 
  Search, 
  Filter, 
  Camera, 
  Video,
  ArrowUpRight
} from 'lucide-react';
import { PromptResult } from '../types';

interface SavedPromptsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPrompts: PromptResult[];
  onRemoveSaved: (id: string) => void;
  onLoadIntoChat: (prompt: PromptResult) => void;
  onOpenExport: (prompt: PromptResult) => void;
}

export const SavedPromptsDrawer: React.FC<SavedPromptsDrawerProps> = ({
  isOpen,
  onClose,
  savedPrompts,
  onRemoveSaved,
  onLoadIntoChat,
  onOpenExport,
}) => {
  const [search, setSearch] = useState('');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedPrompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.masterPrompt.toLowerCase().includes(search.toLowerCase());
    const matchesStyle = filterStyle === 'all' || p.stylePreset === filterStyle;
    return matchesSearch && matchesStyle;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-extrabold text-white text-base">Prompt Library</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {savedPrompts.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {['all', 'cinematic', 'photorealistic', 'abstract', 'anime'].map((style) => (
              <button
                key={style}
                onClick={() => setFilterStyle(style)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize shrink-0 transition ${
                  filterStyle === style
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Star className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No saved prompts yet</p>
              <p className="mt-1">Click the star icon on any generated prompt card to save it here.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id || item.title}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {item.stylePreset}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        --ar {item.aspectRatio}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{item.title}</h4>
                  </div>
                  <button
                    onClick={() => item.id && onRemoveSaved(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.masterPrompt}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <button
                    onClick={() => handleCopy(item.midjourneyPrompt, item.id || item.title)}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedId === (item.id || item.title) ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Midjourney</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenExport(item)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Export syntax"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onLoadIntoChat(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px]"
                    >
                      <span>Load into Chat</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
