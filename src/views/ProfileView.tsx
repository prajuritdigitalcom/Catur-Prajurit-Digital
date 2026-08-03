import React, { useState } from 'react';
import { Edit3, Check, History, X, ArrowLeft } from 'lucide-react';
import { UserProfile, GameState } from '../types';
import { AVATARS } from '../constants/chess';
import { saveProfile, getGameHistory } from '../lib/storage';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onClose
}) => {
  const [displayNameInput, setDisplayNameInput] = useState(profile.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [isEditing, setIsEditing] = useState(false);
  const [history] = useState<GameState[]>(() => getGameHistory());

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...profile,
      displayName: displayNameInput.trim() || profile.username,
      avatar: selectedAvatar
    };

    saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.wins / profile.gamesPlayed) * 100)
      : 0;

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 space-y-3.5 animate-in fade-in duration-200 pb-20">
      {/* Top Bar with Close Button */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-sm font-black text-slate-900">Profil Saya</h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#fe4c6f] border border-rose-200 font-extrabold text-xs flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border-2 border-[#fe4c6f] flex items-center justify-center text-3xl flex-shrink-0">
              {profile.avatar}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-slate-900 truncate">
                  {profile.displayName}
                </h2>
                {profile.isGuest && (
                  <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
                    Tamu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">@{profile.username}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
          >
            <Edit3 className="w-4 h-4 text-[#fe4c6f]" />
          </button>
        </div>

        {/* Edit Profile Panel */}
        {isEditing && (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Nama Tampilan:</label>
              <input
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#fe4c6f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Pilih Avatar Emoji:</label>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                      selectedAvatar === emoji
                        ? 'bg-rose-50 border-[#fe4c6f]'
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-2 bg-[#fe4c6f] hover:bg-[#e03a5b] text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        )}

        {/* Rating & Match Stats Bar */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <div className="text-[9px] text-slate-500 font-extrabold uppercase">Rating Elo</div>
            <div className="text-lg font-mono font-black text-[#fe4c6f]">{profile.rating}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <div className="text-[9px] text-slate-500 font-extrabold uppercase">Win Rate</div>
            <div className="text-lg font-mono font-black text-emerald-600">{winRate}%</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <div className="text-[9px] text-slate-500 font-extrabold uppercase">Menang / Kalah</div>
            <div className="text-sm font-mono font-black text-slate-800">
              {profile.wins}W / {profile.losses}L
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <div className="text-[9px] text-slate-500 font-extrabold uppercase">Total Tanding</div>
            <div className="text-sm font-mono font-black text-slate-800">{profile.gamesPlayed}</div>
          </div>
        </div>
      </div>

      {/* Match History Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <History className="w-4 h-4 text-[#fe4c6f]" />
          <h3 className="font-extrabold text-xs text-slate-900">Riwayat Tanding Terakhir</h3>
        </div>

        {history.length === 0 ? (
          <div className="text-center text-slate-400 py-6 text-xs italic">
            Belum ada riwayat tanding tersimpan.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((g) => {
              const isWin = g.winner === 'w' ? g.playerWhite.id === profile.id : g.playerBlack.id === profile.id;
              const isDraw = g.winner === 'draw';

              return (
                <div
                  key={g.id}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                        isWin
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isDraw
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isWin ? 'Menang' : isDraw ? 'Remis' : 'Kalah'}
                    </span>

                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {g.playerWhite.name} vs {g.playerBlack.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {g.mode.toUpperCase()} • {g.history.length} langkah
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <X className="w-4 h-4 text-[#fe4c6f]" />
          <span>Tutup Profil & Kembali</span>
        </button>
      )}
    </div>
  );
};
