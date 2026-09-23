'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { getLocalProfile } from '@/lib/db';
import { TypingEngine, TypingTestResult } from '@keyarena/typing-engine';
import { TypingArea } from '@/components/typing/TypingArea';
import {
  Users,
  Play,
  Copy,
  Check,
  ArrowLeft,
  Trophy,
  Crown,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface RemotePlayer {
  id: string;
  name: string;
  avatarColor: string;
  isHost: boolean;
  progress: number;
  wpm: number;
  isFinished: boolean;
  rank?: number;
}

export default function MultiplayerPage() {
  const profile = useMemo(() => getLocalProfile(), []);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<RemotePlayer[]>([]);
  const [raceStatus, setRaceStatus] = useState<'lobby' | 'countdown' | 'racing' | 'finished'>('lobby');
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [promptText, setPromptText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);
  const engineRef = useRef<TypingEngine | null>(null);

  // Host configuration options
  const [configDuration, setConfigDuration] = useState(30);
  const [configPunctuation, setConfigPunctuation] = useState(false);
  const [configNumbers, setConfigNumbers] = useState(false);

  // Fallback bot simulation if offline/server disconnected
  const isSimulationMode = useRef(false);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const connectWebSocket = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        resolve(wsRef.current);
        return;
      }

      // Connect to configured or local socket server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${host}:8080`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        wsRef.current = socket;
        resolve(socket);
      };

      socket.onerror = (err) => {
        reject(err);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleSocketMessage(msg);
        } catch (e) {
          console.error('Socket message parse error', e);
        }
      };

      socket.onclose = () => {
        // Disconnected
      };
    });
  };

  const handleSocketMessage = (msg: any) => {
    switch (msg.type) {
      case 'room_joined':
        setCurrentRoomId(msg.roomId);
        setIsHost(msg.isHost);
        setPromptText(msg.prompt);
        setPlayers(msg.players);
        setErrorMsg(null);
        break;

      case 'player_joined':
        setPlayers((prev) => [...prev, msg.player]);
        break;

      case 'player_left':
        setPlayers((prev) => prev.filter((p) => p.id !== msg.playerId));
        break;

      case 'countdown_started':
        setRaceStatus('countdown');
        setCountdownSec(msg.seconds);
        break;

      case 'countdown_tick':
        setCountdownSec(msg.count);
        break;

      case 'race_started':
        setRaceStatus('racing');
        setCountdownSec(null);
        break;

      case 'player_progress':
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === msg.playerId ? { ...p, progress: msg.progress, wpm: msg.wpm } : p
          )
        );
        break;

      case 'player_finished':
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === msg.playerId
              ? { ...p, isFinished: true, rank: msg.rank, wpm: msg.result.wpm }
              : p
          )
        );
        break;

      case 'race_finished':
        setRaceStatus('finished');
        break;

      case 'error':
        setErrorMsg(msg.message);
        break;
    }
  };

  const handleCreateRoom = async () => {
    setErrorMsg(null);
    try {
      const socket = await connectWebSocket();
      socket.send(
        JSON.stringify({
          type: 'create_room',
          playerName: profile.displayName,
          avatarColor: profile.avatarColor,
          config: {
            duration: configDuration,
            punctuation: configPunctuation,
            numbers: configNumbers
          }
        })
      );
    } catch {
      // Start offline race room with AI ghosts if server isn't running
      startLocalGhostRace();
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) return;
    setErrorMsg(null);
    try {
      const socket = await connectWebSocket();
      socket.send(
        JSON.stringify({
          type: 'join_room',
          roomId: roomCodeInput.trim().toUpperCase(),
          playerName: profile.displayName,
          avatarColor: profile.avatarColor
        })
      );
    } catch {
      setErrorMsg('Cannot reach multiplayer server. You can still practice in solo arena.');
    }
  };

  const handleStartRace = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_countdown' }));
    } else if (isSimulationMode.current) {
      // Local simulation countdown
      setRaceStatus('countdown');
      setCountdownSec(3);
      let count = 3;
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdownSec(count);
        } else {
          clearInterval(interval);
          setCountdownSec(null);
          setRaceStatus('racing');
          startGhostBots();
        }
      }, 1000);
    }
  };

  // Offline Ghost Race for testing without server
  const startLocalGhostRace = () => {
    isSimulationMode.current = true;
    const testPrompt =
      'Precision typing requires balance and calm focus. High velocity keystrokes flow naturally when errors are eliminated early.';
    setPromptText(testPrompt);
    setCurrentRoomId('KEY-LOCAL');
    setIsHost(true);
    setPlayers([
      { id: 'me', name: profile.displayName, avatarColor: profile.avatarColor, isHost: true, progress: 0, wpm: 0, isFinished: false },
      { id: 'bot_1', name: 'Apex Pilot (Ghost)', avatarColor: '#10b981', isHost: false, progress: 0, wpm: 75, isFinished: false },
      { id: 'bot_2', name: 'Neon Striker (Ghost)', avatarColor: '#f59e0b', isHost: false, progress: 0, wpm: 92, isFinished: false }
    ]);
  };

  const startGhostBots = () => {
    const start = Date.now();
    const botInterval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === 'bot_1') {
            const prog = Math.min(100, Math.round(elapsed * 6));
            return { ...p, progress: prog, isFinished: prog >= 100 };
          }
          if (p.id === 'bot_2') {
            const prog = Math.min(100, Math.round(elapsed * 7.5));
            return { ...p, progress: prog, isFinished: prog >= 100 };
          }
          return p;
        })
      );
    }, 200);
  };

  // Initializing Engine when race begins
  const engine = useMemo(() => {
    if (!promptText) return null;
    const eng = new TypingEngine(promptText, {
      mode: 'words',
      targetWordCount: promptText.split(/\s+/).length
    });
    engineRef.current = eng;
    return eng;
  }, [promptText]);

  const handleKeyPress = (key: string, isErr: boolean) => {
    if (!engine) return;
    const prog = engine.getProgress();
    const wpm = Math.round(engine.getWpm());

    // Update local player state
    setPlayers((prev) =>
      prev.map((p) => (p.isHost === isHost ? { ...p, progress: prog, wpm } : p))
    );

    // Send to WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'progress_update',
          progress: prog,
          wpm
        })
      );
    }
  };

  const handleRaceComplete = (result: TypingTestResult) => {
    setRaceStatus('finished');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'finish_race',
          wpm: result.wpm,
          rawWpm: result.rawWpm,
          accuracy: result.accuracy
        })
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-mono select-none">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Multiplayer Race Arena
              </h1>
              <p className="text-xs text-text-muted">
                Real-time competitive typing races with synchronized starts and telemetry
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800 rounded flex items-center space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!currentRoomId ? (
          /* Lobby Join / Create View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Room */}
            <div className="p-6 bg-bg-surface border border-border rounded-lg flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                  Create Race Room
                </h2>
                <p className="text-xs text-text-muted mb-4">
                  Host a room, choose your constraints, and invite competitors using a unique room code.
                </p>

                <div className="space-y-3 mb-6 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Duration:</span>
                    <div className="flex space-x-1">
                      {[15, 30, 60].map((d) => (
                        <button
                          key={d}
                          onClick={() => setConfigDuration(d)}
                          className={`px-2 py-0.5 rounded border ${
                            configDuration === d
                              ? 'border-accent text-accent font-bold bg-bg-subtle'
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Punctuation:</span>
                    <button
                      onClick={() => setConfigPunctuation(!configPunctuation)}
                      className={`px-2 py-0.5 rounded border ${
                        configPunctuation
                          ? 'border-accent text-accent bg-bg-subtle'
                          : 'border-border text-text-muted'
                      }`}
                    >
                      {configPunctuation ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded bg-accent text-bg-primary font-bold text-xs hover:bg-accent-hover transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Create Room</span>
              </button>
            </div>

            {/* Join Room */}
            <div className="p-6 bg-bg-surface border border-border rounded-lg flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                  Join with Code
                </h2>
                <p className="text-xs text-text-muted mb-4">
                  Enter an existing 4-letter room code (e.g. KEY-7291) to enter a friend&apos;s lobby.
                </p>

                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="KEY-XXXX"
                  className="w-full bg-bg-subtle border border-border rounded p-3 text-sm font-mono text-center tracking-widest text-text-primary uppercase focus:outline-none focus:border-accent mb-4"
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={!roomCodeInput.trim()}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded bg-bg-subtle border border-border hover:border-accent text-text-primary font-bold text-xs hover:bg-bg-subtle/80 disabled:opacity-50 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Join Race</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Room Screen */
          <div className="space-y-6">
            {/* Room Header Info */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-bg-surface border border-border rounded-lg text-xs">
              <div className="flex items-center space-x-3">
                <span className="text-text-muted">Room Code:</span>
                <span className="text-base font-bold text-accent tracking-widest">
                  {currentRoomId}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentRoomId);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-subtle"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <span className="text-text-muted">
                  {players.length} Racer{players.length !== 1 ? 's' : ''} Connected
                </span>

                {isHost && raceStatus === 'lobby' && (
                  <button
                    onClick={handleStartRace}
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded bg-accent text-bg-primary font-bold hover:bg-accent-hover transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Race</span>
                  </button>
                )}
              </div>
            </div>

            {/* Countdown Overlay */}
            {raceStatus === 'countdown' && (
              <div className="py-12 flex flex-col items-center justify-center">
                <span className="text-xs text-text-muted uppercase tracking-widest mb-2">
                  Race Begins In
                </span>
                <span className="text-8xl font-black text-accent animate-pulse">
                  {countdownSec}
                </span>
              </div>
            )}

            {/* Live Progress Race Tracks */}
            <div className="p-4 bg-bg-surface border border-border rounded-lg space-y-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Live Track
              </h3>

              {players.map((p, idx) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.avatarColor }}
                      />
                      <span className="font-semibold text-text-primary">{p.name}</span>
                      {p.isHost && (
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-text-muted font-mono">
                      <span>{p.wpm} WPM</span>
                      <span className="text-text-secondary">{p.progress}%</span>
                    </div>
                  </div>

                  {/* Lane Bar */}
                  <div className="w-full h-3 bg-bg-subtle rounded border border-border overflow-hidden relative">
                    <div
                      className="h-full transition-all duration-150 rounded"
                      style={{
                        width: `${p.progress}%`,
                        backgroundColor: p.avatarColor
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Active Typing Area for Racer */}
            {(raceStatus === 'racing' || raceStatus === 'finished') && engine && (
              <div className="pt-4">
                <TypingArea
                  engine={engine}
                  onComplete={handleRaceComplete}
                  onRestart={() => {}}
                  onKeyPress={handleKeyPress}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
