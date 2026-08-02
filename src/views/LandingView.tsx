import React from 'react';
import { Bot, Users, Globe, Search, Zap, Trophy, ChevronRight, Play } from 'lucide-react';
import { AILevel, TimeControl } from '../types';
import { AI_LEVELS, TIME_CONTROLS } from '../constants/chess';

interface LandingViewProps {
  onStartAI: (level: AILevel, color: 'w' | 'b' | 'random', timeControl: TimeControl) => void;
  onStartLocal: (timeControl: TimeControl) => void;
  onOpenOnline: () => void;
  onOpenAnalysis: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartAI,
  onStartLocal,
  onOpenOnline,
  onOpenAnalysis
}) => {
  const [selectedAILevel, setSelectedAILevel] = React.useState<AILevel>('medium');
  const [selectedColor, setSelectedColor] = React.useState<'w' | 'b' | 'random'>('random');
  const [selectedTimeControl, setSelectedTimeControl] = React.useState<TimeControl>(TIME_CONTROLS[2]); // 3m Blitz
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

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 space-y-4 animate-in fade-in duration-200 pb-20">
      {/* Mobile Hero Card */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-orange-50 border border-rose-100 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fe4c6f]/10 border border-[#fe4c6f]/20 text-[#fe4c6f] font-extrabold text-[10px] uppercase tracking-wider">
          <Zap className="w-3 h-3" />
          Aplikasi Catur HP No. 1
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          Main Catur HP <br />
          <span className="text-[#fe4c6f]">Terang, Cepat & Seru</span>
        </h1>

        <p className="text-slate-600 text-xs leading-relaxed">
          Pilih mode permainan favorit Anda. Nikmati AI Stockfish, tanding online realtime, atau lawan teman dalam satu HP.
        </p>

        <div className="pt-1 flex flex-col gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs shadow-md shadow-rose-200 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Main vs Stockfish AI
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>

          <button
            onClick={onOpenOnline}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs border border-slate-200 shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-[#fe4c6f]" />
            Main Online (Lobi Room)
            <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
          </button>
        </div>
      </div>

      {/* Play Modes List (Mobile Vertical Cards) */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
          Pilihan Mode Tanding
        </h2>

        {/* VS AI */}
        <div
          onClick={() => setShowAiModal(true)}
          className="bg-white hover:bg-rose-50/50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer shadow-2xs active:scale-98 transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-[#fe4c6f] flex items-center justify-center font-bold flex-shrink-0 border border-rose-100">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xs text-slate-900">
              Lawan Bot AI (Stockfish)
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              5 Level (Pemula s/d Master) + Evaluation Bar
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Pass & Play (Lokal) */}
        <div
          onClick={() => onStartLocal(TIME_CONTROLS[0])}
          className="bg-white hover:bg-blue-50/50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer shadow-2xs active:scale-98 transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xs text-slate-900">
              Main Lokal (Pass & Play)
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Main 2 orang bergantian dalam 1 layar HP
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Online Room */}
        <div
          onClick={onOpenOnline}
          className="bg-white hover:bg-amber-50/50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer shadow-2xs active:scale-98 transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0 border border-amber-100">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xs text-slate-900">
              Lobi Room Online
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Buat room private, undang teman via kode unik
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Analysis Board */}
        <div
          onClick={onOpenAnalysis}
          className="bg-white hover:bg-purple-50/50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer shadow-2xs active:scale-98 transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 border border-purple-100">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xs text-slate-900">
              Papan Analisis & PGN
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Impor notasi FEN/PGN & hitung langkah terbaik
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Mobile AI Setup Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#fe4c6f]" />
                <h3 className="text-sm font-extrabold text-slate-900">Pengaturan Lawan AI</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-800 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Level Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Tingkat AI:
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {AI_LEVELS.filter((l) => l.id !== 'custom').map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedAILevel(lvl.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedAILevel === lvl.id
                        ? 'bg-rose-50 border-[#fe4c6f] text-slate-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{lvl.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${lvl.badgeColor}`}>
                        {lvl.elo} Elo
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Warna Bidak Anda:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'w', label: 'Putih', icon: '♔' },
                  { id: 'random', label: 'Acak', icon: '🎲' },
                  { id: 'b', label: 'Hitam', icon: '♚' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id as 'w' | 'b' | 'random')}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                      selectedColor === c.id
                        ? 'bg-[#fe4c6f] text-white border-[#fe4c6f]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">{c.icon}</span>
                    <span className="text-[10px]">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Control */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Waktu Pertandingan:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_CONTROLS.slice(0, 6).map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => setSelectedTimeControl(tc)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      selectedTimeControl.id === tc.id
                        ? 'bg-rose-50 text-[#fe4c6f] border-[#fe4c6f]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmAI}
              className="w-full py-3 rounded-2xl bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs shadow-md transition-all active:scale-98"
            >
              Mulai Tanding HP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
