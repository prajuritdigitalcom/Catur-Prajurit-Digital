import React from 'react';
import { Settings, Volume2, VolumeX, Eye, Palette, Check } from 'lucide-react';
import { UserSettings, BoardTheme } from '../types';
import { BOARD_THEMES } from '../constants/chess';
import { saveSettings } from '../lib/storage';
import { soundEngine } from '../lib/audio';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updated: UserSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings
}) => {
  const handleChangeTheme = (theme: BoardTheme) => {
    const updated = { ...settings, boardTheme: theme };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    saveSettings(updated);
    soundEngine.setEnabled(updated.soundEnabled);
    onUpdateSettings(updated);
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, soundVolume: vol };
    saveSettings(updated);
    soundEngine.setVolume(vol);
    onUpdateSettings(updated);
  };

  const handleToggleAutoFlip = () => {
    const updated = { ...settings, autoFlip: !settings.autoFlip };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleToggleHighlight = () => {
    const updated = { ...settings, highlightLegalMoves: !settings.highlightLegalMoves };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 space-y-3.5 animate-in fade-in duration-200 pb-20">
      {/* Mobile Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 flex items-center gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#fe4c6f] flex items-center justify-center font-bold border border-rose-100 flex-shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900">Pengaturan Aplikasi</h2>
          <p className="text-slate-500 text-[11px]">Kustomisasi papan & suara catur HP.</p>
        </div>
      </div>

      {/* Board Theme Selection */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[#fe4c6f]" />
          Warna Papan Catur
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {BOARD_THEMES.map((theme) => {
            const isSelected = settings.boardTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleChangeTheme(theme.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-rose-50 border-[#fe4c6f] shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {/* Mini Board Preview */}
                <div className="w-full h-8 rounded-xl grid grid-cols-4 overflow-hidden mb-1.5 border border-slate-200">
                  <div style={{ backgroundColor: theme.lightSquare }} />
                  <div style={{ backgroundColor: theme.darkSquare }} />
                  <div style={{ backgroundColor: theme.lightSquare }} />
                  <div style={{ backgroundColor: theme.darkSquare }} />
                  <div style={{ backgroundColor: theme.darkSquare }} />
                  <div style={{ backgroundColor: theme.lightSquare }} />
                  <div style={{ backgroundColor: theme.darkSquare }} />
                  <div style={{ backgroundColor: theme.lightSquare }} />
                </div>

                <div className="font-bold text-xs text-slate-900">{theme.name}</div>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#fe4c6f] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#fe4c6f]" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
          Efek Suara HP
        </h3>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div>
            <div className="font-bold text-xs text-slate-900">Suara Bidak & Langkah</div>
            <div className="text-[10px] text-slate-500">Suara langkah, skak, & makan.</div>
          </div>

          <button
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
              settings.soundEnabled
                ? 'bg-[#fe4c6f] text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {settings.soundEnabled ? 'Aktif' : 'Mati'}
          </button>
        </div>

        {settings.soundEnabled && (
          <div className="space-y-1 px-1">
            <label className="text-[11px] font-bold text-slate-600">Volume:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[#fe4c6f]"
            />
          </div>
        )}
      </div>

      {/* Visual Assistance */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-[#fe4c6f]" />
          Bantuan Visual Papan
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <div className="font-bold text-xs text-slate-900">Highlight Langkah Legal</div>
              <div className="text-[10px] text-slate-500">Tandai titik pink pada petak legal.</div>
            </div>
            <button
              onClick={handleToggleHighlight}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                settings.highlightLegalMoves
                  ? 'bg-[#fe4c6f] text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {settings.highlightLegalMoves ? 'Aktif' : 'Mati'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <div className="font-bold text-xs text-slate-900">Auto-Flip Papan (Lokal)</div>
              <div className="text-[10px] text-slate-500">Putar papan otomatis bergantian.</div>
            </div>
            <button
              onClick={handleToggleAutoFlip}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                settings.autoFlip
                  ? 'bg-[#fe4c6f] text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {settings.autoFlip ? 'Aktif' : 'Mati'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
