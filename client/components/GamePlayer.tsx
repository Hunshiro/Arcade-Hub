
import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../types';
import { sendRoomInput, subscribeRoomInput, RoomInputPayload } from '../services/socketClient';

interface GamePlayerProps {
  game: Game;
  isTwoPlayer?: boolean;
  roomCode?: string | null;
  roomPlayers?: string[];
  currentUsername?: string | null;
  onClose: () => void;
  onScoreSubmit: (score: number) => void;
}

const GamePlayer: React.FC<GamePlayerProps> = ({
  game,
  isTwoPlayer,
  roomCode,
  roomPlayers,
  currentUsername,
  onClose,
  onScoreSubmit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  const isInjectingSyntheticRef = useRef(false);

  const waitingForPlayer = !!isTwoPlayer && (!roomPlayers || roomPlayers.length < 2);
  const shouldMountGame = !isTwoPlayer || !waitingForPlayer;
  const playerRole: 1 | 2 = (() => {
    if (!isTwoPlayer || !roomPlayers || !currentUsername) return 1;
    const idx = roomPlayers.findIndex((u) => u === currentUsername);
    return idx === 1 ? 2 : 1;
  })();

  useEffect(() => {
    if (!isTwoPlayer) return;
    if (!roomPlayers || roomPlayers.length < 2) {
      setShowReadyBanner(false);
      return;
    }
    setShowReadyBanner(true);
    const timer = setTimeout(() => setShowReadyBanner(false), 2000);
    return () => clearTimeout(timer);
  }, [isTwoPlayer, roomPlayers]);

  useEffect(() => {
    if (!isTwoPlayer || !roomCode || waitingForPlayer || !shouldMountGame) return;

    const getTargetWindow = () => iframeRef.current?.contentWindow ?? null;
    const controlKeys = new Set([
      "w", "a", "s", "d", "W", "A", "S", "D",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      " ", "Space", "Spacebar", "Shift", "ShiftLeft", "ShiftRight",
      "/", "f", "F",
    ]);

    const mapKeyToAction = (key: string): "up" | "down" | "left" | "right" | "bash" | null => {
      if (key === "w" || key === "W" || key === "ArrowUp") return "up";
      if (key === "s" || key === "S" || key === "ArrowDown") return "down";
      if (key === "a" || key === "A" || key === "ArrowLeft") return "left";
      if (key === "d" || key === "D" || key === "ArrowRight") return "right";
      if (key === " " || key === "Space" || key === "Spacebar" || key === "Shift" || key === "ShiftLeft" || key === "ShiftRight") return "bash";
      return null;
    };

    const toCanonicalInput = (action: "up" | "down" | "left" | "right" | "bash", type: "keydown" | "keyup"): RoomInputPayload => {
      if (playerRole === 1) {
        const keyMap: Record<typeof action, { key: string; code: string }> = {
          up: { key: "w", code: "KeyW" },
          down: { key: "s", code: "KeyS" },
          left: { key: "a", code: "KeyA" },
          right: { key: "d", code: "KeyD" },
          bash: { key: " ", code: "Space" },
        };
        return { type, ...keyMap[action] };
      }

      const keyMap: Record<typeof action, { key: string; code: string }> = {
        up: { key: "ArrowUp", code: "ArrowUp" },
        down: { key: "ArrowDown", code: "ArrowDown" },
        left: { key: "ArrowLeft", code: "ArrowLeft" },
        right: { key: "ArrowRight", code: "ArrowRight" },
        bash: { key: "Shift", code: "ShiftLeft" },
      };
      return { type, ...keyMap[action] };
    };

    const injectToIframe = (input: RoomInputPayload) => {
      const iframeWindow = getTargetWindow();
      if (!iframeWindow) return;
      isInjectingSyntheticRef.current = true;
      try {
        const event = new KeyboardEvent(input.type, {
          key: input.key,
          code: input.code,
          bubbles: true,
        });
        iframeWindow.dispatchEvent(event);
      } finally {
        isInjectingSyntheticRef.current = false;
      }
    };

    const emitInput = (type: "keydown" | "keyup", event: KeyboardEvent) => {
      if (isInjectingSyntheticRef.current) return;
      if (type === "keydown" && event.repeat) return;
      const action = mapKeyToAction(event.key);
      if (!action) return;
      const input = toCanonicalInput(action, type);
      sendRoomInput(roomCode, input);
      injectToIframe(input);
    };

    const attachIframeListeners = () => {
      const iframeWindow = getTargetWindow();
      if (!iframeWindow) return;

      const onKeyDown = (event: KeyboardEvent) => emitInput("keydown", event);
      const onKeyUp = (event: KeyboardEvent) => emitInput("keyup", event);

      iframeWindow.addEventListener("keydown", onKeyDown);
      iframeWindow.addEventListener("keyup", onKeyUp);

      return () => {
        iframeWindow.removeEventListener("keydown", onKeyDown);
        iframeWindow.removeEventListener("keyup", onKeyUp);
      };
    };

    let detachKeyboard: (() => void) | undefined;
    const onLoad = () => {
      detachKeyboard?.();
      detachKeyboard = attachIframeListeners();
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener("load", onLoad);
      detachKeyboard = attachIframeListeners();
    }

    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (!controlKeys.has(event.key)) return;
      emitInput("keydown", event);
      event.preventDefault();
    };

    const onWindowKeyUp = (event: KeyboardEvent) => {
      if (!controlKeys.has(event.key)) return;
      emitInput("keyup", event);
      event.preventDefault();
    };

    window.addEventListener("keydown", onWindowKeyDown);
    window.addEventListener("keyup", onWindowKeyUp);

    const unsubscribeRoomInput = subscribeRoomInput((input: RoomInputPayload) => {
      injectToIframe(input);
    });

    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener("load", onLoad);
      }
      detachKeyboard?.();
      window.removeEventListener("keydown", onWindowKeyDown);
      window.removeEventListener("keyup", onWindowKeyUp);
      unsubscribeRoomInput();
    };
  }, [isTwoPlayer, roomCode, waitingForPlayer, shouldMountGame, playerRole]);

  // Focus the iframe automatically when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SCORE_UPDATE') {
        const score = Number(event.data.score);
        setCurrentScore(score);
        onScoreSubmit(score);
      }
    };

    window.addEventListener('message', handleMessage);
    
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    // Track if user clicked away
    const handleWindowBlur = () => setIsFocused(false);
    const handleWindowFocus = () => setIsFocused(true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [onScoreSubmit]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const focusGame = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
      setIsFocused(true);
    }
  };

  const handleContainerClick = () => {
    focusGame();
  };

  return (
    <div className="h-full flex flex-col gap-5 md:gap-7 animate-in zoom-in duration-300">
      <div className="flex items-start md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-slate-900/70 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-800 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-100">{game.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">
                CLICK GAME TO FOCUS
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-5 px-4 md:px-6 py-3 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Live Score</p>
              <p className="text-2xl font-black text-indigo-400 retro-font leading-none mt-1">{currentScore}</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <button 
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-xl transition-all group"
              title="Fullscreen Mode"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className={`flex-1 min-h-[420px] bg-[#0a0f1a] rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative border-2 md:border-4 border-slate-800/80 group cursor-pointer transition-all ${isFullscreen ? 'rounded-none border-0' : ''} ${!isFocused ? 'ring-4 ring-indigo-500/30' : ''}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,72,120,0.25)_0%,rgba(10,15,26,0.9)_65%)] pointer-events-none"></div>
        {shouldMountGame && (
          <iframe
            ref={iframeRef}
            srcDoc={game.htmlContent}
            className="w-full h-full border-none bg-transparent relative"
            title={game.title}
            sandbox="allow-scripts allow-modals allow-same-origin allow-pointer-lock"
            tabIndex={0}
            onLoad={focusGame}
            onClick={focusGame}
          />
        )}
        
        {!isFocused && !isFullscreen && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none transition-opacity">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black retro-font text-xs animate-bounce shadow-2xl">
              CLICK TO FOCUS CONTROLS
            </div>
          </div>
        )}

        {waitingForPlayer && (
          <div className="absolute inset-0 bg-[#0b1020]/70 backdrop-blur-sm flex items-center justify-center">
            <div className="w-[92%] max-w-4xl text-center">
              <div className="relative rounded-[2.25rem] border border-indigo-500/20 bg-[#0b1222]/80 shadow-[0_0_40px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>
                <div className="relative h-24 md:h-28 flex items-center justify-center">
                  <div className="absolute inset-y-3 left-6 right-6 border border-slate-800/60 rounded-2xl"></div>
                  <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-slate-800/60"></div>
                  <div className="relative inline-flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-3">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Room</span>
                    <span className="text-lg font-black text-indigo-300 tracking-[0.35em]">{roomCode || '—'}</span>
                  </div>
                </div>
              </div>
              <h4 className="mt-8 text-xl md:text-2xl font-black text-white">Waiting for another player…</h4>
              <p className="mt-3 text-slate-400 text-sm">
                Share this room code with a friend to start a head-to-head match instantly.
              </p>
              <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
                <span className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2">PLAYER 1 <span className="text-white ml-1">You</span></span>
                <span className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2">OPPONENT <span className="text-white ml-1">Waiting</span></span>
              </div>
            </div>
          </div>
        )}

        {!waitingForPlayer && showReadyBanner && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-widest shadow-2xl pointer-events-none">
            OPPONENT JOINED — GAME STARTING
          </div>
        )}

        {isFullscreen && (
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="px-6 py-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4">
               <h4 className="font-black text-white">{game.title}</h4>
               <span className="text-indigo-400 font-mono text-xl">{currentScore}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="pointer-events-auto p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-indigo-600 transition-colors"
            >
              Exit Fullscreen
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <h4 className="font-black mb-3 uppercase text-xs text-indigo-400 tracking-widest">About this game</h4>
          <p className="text-slate-300 leading-relaxed italic">"{game.description}"</p>
          <div className="mt-6 p-4 bg-slate-800/40 rounded-2xl text-xs text-slate-400 leading-relaxed border border-slate-700">
            <strong>Pro Tip:</strong> If keys aren't working, click inside the game area once. Use Fullscreen mode for the best experience.
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col">
          <h4 className="font-black mb-4 uppercase text-xs text-indigo-400 tracking-widest">Gamer Status</h4>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-sm">
               <span className="text-slate-500">Session Quality</span>
               <span className="text-green-400 font-bold">Stable</span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span className="text-slate-500">Latency</span>
               <span className="text-slate-300 font-mono">0.4ms</span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span className="text-slate-500">Server Location</span>
               <span className="text-slate-300 font-bold">US-East</span>
             </div>
             <button className="w-full mt-2 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-sm font-bold transition-colors">
               Report Bug
             </button>
          </div>
        </div>
        <div className="md:col-start-3 bg-gradient-to-br from-indigo-900/30 via-slate-900/40 to-purple-900/30 p-6 rounded-3xl border border-indigo-500/20 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-200">Invite Friends</p>
            <p className="text-xs text-slate-400 mt-1">Earn +50 XP per referral</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            →
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlayer;

