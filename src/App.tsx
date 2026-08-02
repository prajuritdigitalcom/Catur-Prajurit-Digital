import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingView } from './views/LandingView';
import { AIPlayView } from './views/AIPlayView';
import { LocalPlayView } from './views/LocalPlayView';
import { OnlinePlayView } from './views/OnlinePlayView';
import { GameRoomView } from './views/GameRoomView';
import { AnalysisView } from './views/AnalysisView';
import { LeaderboardView } from './views/LeaderboardView';
import { FriendsView } from './views/FriendsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { UserProfile, UserSettings, AILevel, TimeControl } from './types';
import { getStoredProfile, getStoredSettings } from './lib/storage';
import { TIME_CONTROLS } from './constants/chess';
import { soundEngine } from './lib/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredProfile());
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getStoredSettings());

  // Game setup states
  const [aiConfig, setAiConfig] = useState<{
    level: AILevel;
    color: 'w' | 'b';
    timeControl: TimeControl;
  }>({
    level: 'medium',
    color: 'w',
    timeControl: TIME_CONTROLS[2]
  });

  const [localTimeControl, setLocalTimeControl] = useState<TimeControl>(TIME_CONTROLS[0]);
  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [analysisState, setAnalysisState] = useState<{ fen?: string; pgn?: string }>({});

  useEffect(() => {
    soundEngine.setEnabled(userSettings.soundEnabled);
    soundEngine.setVolume(userSettings.soundVolume);
  }, [userSettings]);

  const handleStartAI = (level: AILevel, color: 'w' | 'b', timeControl: TimeControl) => {
    setAiConfig({ level, color, timeControl });
    setCurrentTab('ai');
  };

  const handleStartLocal = (timeControl: TimeControl) => {
    setLocalTimeControl(timeControl);
    setCurrentTab('local');
  };

  const handleJoinOnlineRoom = (code: string) => {
    setActiveRoomCode(code);
    setCurrentTab('gameroom');
  };

  const handleOpenAnalysisWithFen = (fen: string, pgn: string) => {
    setAnalysisState({ fen, pgn });
    setCurrentTab('analysis');
  };

  const isGameActive = currentTab === 'ai' || currentTab === 'local' || currentTab === 'gameroom';

  return (
    <div className="min-h-screen bg-ink-900 text-bone-200 flex flex-col selection:bg-brass-500 selection:text-ink-950">
      {/* Header Bar */}
      <Header
        profile={userProfile}
        currentTab={currentTab === 'landing' ? 'play' : currentTab}
        onNavigate={(tab) => {
          if (tab === 'play') setCurrentTab('landing');
          else setCurrentTab(tab);
        }}
        isGameActive={isGameActive}
      />

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col justify-center">
        {currentTab === 'landing' && (
          <LandingView
            onStartAI={handleStartAI}
            onStartLocal={handleStartLocal}
            onOpenOnline={() => setCurrentTab('online')}
            onOpenAnalysis={() => {
              setAnalysisState({});
              setCurrentTab('analysis');
            }}
          />
        )}

        {currentTab === 'ai' && (
          <AIPlayView
            userPlayer={{
              id: userProfile.id,
              name: userProfile.displayName || userProfile.username,
              avatar: userProfile.avatar,
              rating: userProfile.rating,
              color: aiConfig.color
            }}
            aiLevel={aiConfig.level}
            userColor={aiConfig.color}
            timeControl={aiConfig.timeControl}
            boardTheme={userSettings.boardTheme}
            onBack={() => setCurrentTab('landing')}
            onOpenAnalysisWithFen={handleOpenAnalysisWithFen}
          />
        )}

        {currentTab === 'local' && (
          <LocalPlayView
            userPlayer={{
              id: userProfile.id,
              name: userProfile.displayName || userProfile.username,
              avatar: userProfile.avatar,
              rating: userProfile.rating,
              color: 'w'
            }}
            timeControl={localTimeControl}
            boardTheme={userSettings.boardTheme}
            autoFlip={userSettings.autoFlip}
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'online' && (
          <OnlinePlayView
            userPlayer={{
              id: userProfile.id,
              name: userProfile.displayName || userProfile.username,
              avatar: userProfile.avatar,
              rating: userProfile.rating,
              color: 'w'
            }}
            onJoinRoomCode={handleJoinOnlineRoom}
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'gameroom' && activeRoomCode && (
          <GameRoomView
            roomCode={activeRoomCode}
            userPlayer={{
              id: userProfile.id,
              name: userProfile.displayName || userProfile.username,
              avatar: userProfile.avatar,
              rating: userProfile.rating,
              color: 'w'
            }}
            boardTheme={userSettings.boardTheme}
            onBack={() => setCurrentTab('online')}
          />
        )}

        {currentTab === 'analysis' && (
          <AnalysisView
            initialFen={analysisState.fen}
            initialPgn={analysisState.pgn}
            boardTheme={userSettings.boardTheme}
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'leaderboard' && <LeaderboardView />}

        {currentTab === 'friends' && (
          <FriendsView
            profile={userProfile}
            onOpenOnlineRoom={() => setCurrentTab('online')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={userProfile}
            onUpdateProfile={setUserProfile}
            onOpenAnalysisWithFen={handleOpenAnalysisWithFen}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={userSettings}
            onUpdateSettings={setUserSettings}
          />
        )}
      </main>

      {/* Footer (Hidden on game screens as per PRD Section 2 & 7) */}
      <Footer hidden={isGameActive} />
    </div>
  );
}
