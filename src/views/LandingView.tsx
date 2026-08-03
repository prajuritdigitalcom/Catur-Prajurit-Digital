import React from 'react';
import { Bot, Users, Globe, ChevronRight } from 'lucide-react';
import { AILevel, TimeControl } from '../types';
import { AI_LEVELS, TIME_CONTROLS } from '../constants/chess';

interface LandingViewProps {
  onStartAI: (level: AILevel, color: 'w' | 'b' | 'random', timeControl: TimeControl) => void;
  onStartLocal: (timeControl: TimeControl) => void;
  onOpenOnline: () => void;
}

const MODES = [
  { id: 'ai', icon: Bot, title: 'Lawan Bot AI', desc: '5 level, Stockfish engine + evaluation bar', tag: '1.e4', accent: 'brass' as const },
  { id: 'local', icon: Users, title: 'Main Lokal', desc: 'Dua pemain bergantian di satu HP', tag: 'O-O', accent: 'jade' as const },
  { id: 'online', icon: Globe, title: 'Lobi Room Online', desc: 'Room privat, undang teman lewat kode', tag: '1-0', accent: 'garnet' as const }
];

const accentClasses = {
  brass: { icon: 'text-brass-400', border: 'group-hover:border-brass-500/50', tag: 'text-brass-500 border-brass-600/40' },
  jade: { icon: 'text-jade-400', border: 'group-hover:border-jade-500/50', tag: 'text-jade-400 border-jade-500/40' },
  garnet: { icon: 'text-garnet-400', border: 'group-hover:border-garnet-500/50', tag: 'text-garnet-400 border-garnet-500/40' }
};

export const LandingView: React.FC<LandingViewProps> = ({
  onStartAI,
  onStartLocal,
  onOpenOnline
}) => {
  const [selectedAILevel, setSelectedAILevel] = React.useState<AILevel>('medium');
  const [selectedColor, setSelectedColor] = React.useState<'w' | 'b' | 'random'>('random');
  const [selectedTimeControl, setSelectedTimeControl] = React.useState<TimeControl>(TIME_CONTROLS[2]);
  const [showAiModal, setShowAiModal] = React.useState(false);

  const handleConfirmAI = () => {
    let finalColor: 'w' | 'b' = 'w';
    if (selectedColor === 'random') {
      finalColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      finalColor = selectedColor;
    }
    setShowAiModal(false);
    onStartAI(selectedAILevel, finalColor, selectedTimeControl);
  };

  const handleModeClick = (id: string) => {
    if (id === 'ai') setShowAiModal(true);
    else if (id === 'local') onStartLocal(TIME_CONTROLS[0]);
    else if (id === 'online') onOpenOnline();
  };

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 space-y-5 animate-in fade-in duration-200 pb-24">
      <div className="board-texture relative overflow-hidden bg-ink-800 border border-ink-600 rounded-lg p-5 space-y-3">
        <div className="absolute top-0 right-0 text-[120px] leading-none text-brass-500/5 font-display select-none -mr-3 -mt-4">
          ♜
        </div>

        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border border-brass-600/40 text-brass-400 font-notation text-[10px] tracking-wide">
          e4 — pembukaan paling dipercaya
        </div>

        <h1 className="font-display text-[26px] font-semibold text-bone-100 tracking-tight leading-[1.15] relative">
          Setiap bidak
          <br />
          adalah <span className="text-brass-400 italic">prajurit</span>.
        </h1>

        <p className="text-bone-400 text-[13px] leading-relaxed relative max-w-[85%]">
          Pilih medan tanding: lawan AI Stockfish, main santai satu HP, atau adu strategi online bareng teman.
        </p>

        <div className="pt-1 flex flex-col gap-2 relative">
          <button
            onClick={() => setShowAiModal(true)}
            className="glow-primary w-full py-3 px-4 rounded-md bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-[13px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Main vs Stockfish AI
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>

          <button
            onClick={onOpenOnline}
            className="w-full py-3 px-4 rounded-md bg-transparent hover:bg-ink-700 text-bone-200 font-semibold text-[13px] border border-ink-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-brass-400" />
            Main Online (Lobi Room)
            <ChevronRight className="w-4 h-4 ml-auto text-bone-400" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-[11px] font-notation text-bone-400 tracking-wide px-1">
          pilih-mode.tanding
        </h2>

        {MODES.map((mode) => {
          const Icon = mode.icon;
          const a = accentClasses[mode.accent];
          return (
            <div
              key={mode.id}
              onClick={() => handleModeClick(mode.id)}
              className={`group bg-ink-800 border border-ink-600 ${a.border} p-3.5 rounded-md flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all`}
            >
              <div className="w-10 h-10 rounded-sm bg-ink-900 border border-ink-600 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-[18px] h-[18px] ${a.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-bone-100">
                  {mode.title}
                </div>
                <div className="text-[11px] text-bone-400 truncate mt-0.5">
                  {mode.desc}
                </div>
              </div>
              <span className={`hidden xs:inline-block font-notation text-[10px] px-1.5 py-0.5 rounded-sm border ${a.tag}`}>
                {mode.tag}
              </span>
              <ChevronRight className="w-4 h-4 text-bone-400 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {showAiModal && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-ink-800 border border-ink-600 rounded-lg p-5 max-w-md w-full space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-ink-700">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-brass-400" />
                <h3 className="font-display text-[15px] font-semibold text-bone-100">Pengaturan Lawan AI</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-bone-400 hover:text-bone-100 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-notation text-bone-400 tracking-wide">
                tingkat-ai:
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {AI_LEVELS.filter((l) => l.id !== 'custom').map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedAILevel(lvl.id)}
                    className={`p-2.5 rounded-sm text-left border transition-all ${
                      selectedAILevel === lvl.id
                        ? 'bg-brass-500/10 border-brass-500 text-bone-100 font-semibold'
                        : 'bg-ink-900 border-ink-600 text-bone-300 hover:bg-ink-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{lvl.name}</span>
                      <span className="text-[9px] font-notation px-1.5 py-0.5 rounded-sm border border-ink-600 text-bone-400">
                        {lvl.elo} elo
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-notation text-bone-400 tracking-wide">
                warna-bidak-anda:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'w', label: 'Putih', icon: '♔' },
                  { id: 'random', label: 'Acak', icon: '?' },
                  { id: 'b', label: 'Hitam', icon: '♚' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id as 'w' | 'b' | 'random')}
                    className={`py-2 px-2 rounded-sm border text-xs font-semibold flex flex-col items-center gap-0.5 transition-all ${
                      selectedColor === c.id
                        ? 'bg-brass-500 text-ink-950 border-brass-500'
                        : 'bg-ink-900 border-ink-600 text-bone-300 hover:bg-ink-700'
                    }`}
                  >
                    <span className="text-base leading-none">{c.icon}</span>
                    <span className="text-[10px]">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-notation text-bone-400 tracking-wide">
                waktu-pertandingan:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_CONTROLS.slice(0, 6).map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => setSelectedTimeControl(tc)}
                    className={`py-1.5 px-2 rounded-sm border text-[11px] font-semibold text-center transition-all ${
                      selectedTimeControl.id === tc.id
                        ? 'bg-brass-500/10 text-brass-400 border-brass-500'
                        : 'bg-ink-900 border-ink-600 text-bone-300 hover:bg-ink-700'
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmAI}
              className="w-full py-3 rounded-md bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-[13px] transition-all active:scale-[0.98]"
            >
              Mulai Tanding
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
