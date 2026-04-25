/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Terminal, 
  Activity, 
  Zap, 
  Cpu,
  Monitor
} from 'lucide-react';
import { 
  Point, 
  Direction, 
  TRACKS, 
  GRID_SIZE, 
  INITIAL_SPEED, 
  MIN_SPEED, 
  SPEED_INCREMENT,
  Track
} from './constants';

export default function App() {
  // Game State
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [nextDirection, setNextDirection] = useState<Direction>(Direction.RIGHT);
  const [isGameOver, setIsGameOver] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Music State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const gameLoopRef = useRef<number | null>(null);

  // --- Game Logic ---

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const actualDirection = nextDirection;
      setDirection(actualDirection);

      const newHead = { ...head };

      switch (actualDirection) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Check collisions
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Eat food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [nextDirection, food, generateFood, score, highScore]);

  useEffect(() => {
    if (!isGameOver) {
      const interval = setInterval(moveSnake, speed);
      return () => clearInterval(interval);
    }
  }, [isGameOver, moveSnake, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== Direction.DOWN) setNextDirection(Direction.UP);
          break;
        case 'ArrowDown':
          if (direction !== Direction.UP) setNextDirection(Direction.DOWN);
          break;
        case 'ArrowLeft':
          if (direction !== Direction.RIGHT) setNextDirection(Direction.LEFT);
          break;
        case 'ArrowRight':
          if (direction !== Direction.LEFT) setNextDirection(Direction.RIGHT);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection(Direction.RIGHT);
    setNextDirection(Direction.RIGHT);
    setScore(0);
    setIsGameOver(false);
    setSpeed(INITIAL_SPEED);
  };

  // --- Music Logic ---

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="h-screen w-screen bg-void-black flex flex-col relative overflow-hidden">
      {/* CRT Overlay Effects */}
      <div className="absolute inset-0 z-50 pointer-events-none crt-scanline opacity-10" />
      
      {/* Top Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-surface-elevated z-40">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 bg-gradient-to-tr from-neon-cyan to-neon-magenta rounded-lg flex items-center justify-center"
          >
            <Cpu className="text-black w-5 h-5" />
          </motion.div>
          <h1 className="text-xl font-bold tracking-tighter uppercase text-white">
            SynthSnake <span className="text-neon-cyan font-pixel text-xs ml-2">v2.0</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-8 text-sm font-medium text-white/50">
          <span className="text-white/90 border-b-2 border-neon-cyan pb-5 pt-5 uppercase tracking-widest text-[10px]">Arcade</span>
          <span className="uppercase tracking-widest text-[10px]">Playlists</span>
          <span className="uppercase tracking-widest text-[10px]">Leaderboard</span>
          <span className="uppercase tracking-widest text-[10px]">Settings</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isGameOver ? 'bg-red-500' : 'bg-neon-green'}`} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Side Info Panel - Left */}
        <aside className="w-72 border-r border-white/5 bg-surface-muted p-6 flex flex-col gap-8 z-30 hidden md:flex">
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> System_Log
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-neon-cyan/20 rounded-lg flex items-center justify-center text-neon-cyan">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-white uppercase tracking-tight">Active_Session</p>
                  <p className="text-[10px] text-white/40 truncate uppercase">Neural_Sync_Ready</p>
                </div>
              </div>
              
              <div className="text-[10px] space-y-2 font-mono text-white/30 uppercase pl-1">
                <p>{">"} Initialization_Void...</p>
                <p>{">"} Frequency: 44.1Khz</p>
                <p className={isGameOver ? "text-red-500/60" : "text-neon-green/60"}>
                  {">"} Status: {isGameOver ? "Interrupted" : "Streaming"}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-auto">
            <div className="bg-gradient-to-br from-neon-magenta/10 to-neon-cyan/10 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] uppercase font-bold text-neon-magenta mb-1">PRO_VERSION</p>
              <p className="text-xs text-white/70 leading-relaxed mb-3">Unlock 4K textures and lossless AI audio export.</p>
              <button className="w-full py-2 bg-white text-black text-[11px] font-bold rounded-lg uppercase tracking-wider hover:opacity-90 transition-opacity">Upgrade</button>
            </div>
          </section>
        </aside>

        {/* Center Game Window */}
        <section className="flex-1 bg-void-black flex flex-col items-center justify-center p-4 relative z-20">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22d3ee 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 w-full max-w-2xl flex flex-col">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-[10px] font-mono text-neon-cyan tracking-widest uppercase mb-1">Session Active</h2>
                <p className="text-3xl font-black text-white italic tracking-tighter uppercase">Current Run</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-white/40 uppercase">High Score</p>
                <p className="text-2xl font-mono text-neon-magenta">{highScore.toString().padStart(6, '0')}</p>
              </div>
            </div>

            {/* Game Canvas Container */}
            <div 
              className="relative aspect-square bg-[#0f172a] rounded-2xl border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden mx-auto"
              style={{
                width: 'min(65vh, 90vw)',
                height: 'min(65vh, 90vw)',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {/* Snake Rendering */}
              {snake.map((segment, i) => (
                <motion.div
                  key={`${i}-${segment.x}-${segment.y}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    gridColumnStart: segment.x + 1,
                    gridRowStart: segment.y + 1,
                  }}
                  className={`
                    w-full h-full 
                    ${i === 0 ? 'bg-neon-cyan z-10 shadow-[0_0_15px_#22d3ee]' : 'bg-neon-cyan/60'}
                    rounded-sm
                  `}
                />
              ))}

              {/* Food Rendering */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  boxShadow: ["0 0 10px #d946ef", "0 0 20px #d946ef", "0 0 10px #d946ef"]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  gridColumnStart: food.x + 1,
                  gridRowStart: food.y + 1,
                }}
                className="w-full h-full bg-neon-magenta rounded-full z-0 p-1"
              >
                <div className="w-full h-full bg-white/20 rounded-full" />
              </motion.div>

              {/* HUD Overlays */}
              <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-tighter">Score:</span>
                  <span className="text-xs font-mono text-white ml-2">{score.toString().padStart(6, '0')}</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-tighter">Speed:</span>
                  <span className="text-xs font-mono text-neon-cyan ml-2">{(INITIAL_SPEED / speed).toFixed(1)}x</span>
                </div>
              </div>

              {/* Start/GameOver Screen */}
              <AnimatePresence>
                {isGameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-50"
                  >
                    <motion.h2 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2"
                    >
                      {score > 0 ? "System_Failure" : "Neural_Standby"}
                    </motion.h2>
                    <p className="text-xs text-white/40 mb-8 max-w-[200px] uppercase tracking-widest leading-relaxed">
                      {score > 0 
                        ? `Recovery sequence completed. Final Score: ${score}` 
                        : "Synchronize your neural link to begin."}
                    </p>
                    <button 
                      onClick={startGame}
                      className="px-8 py-2.5 bg-white text-black text-xs font-bold rounded-lg uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      {score > 0 ? "Re-Sync" : "Initialize"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Stats */}
        <aside className="w-72 border-l border-white/5 bg-surface-muted p-6 flex flex-col gap-8 z-30 hidden lg:flex">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">Global_Stats</h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-white/30 tracking-widest">Current Rank</span>
                <span className="text-xl font-bold text-white">#1,244 <span className="text-neon-green text-[10px] ml-1 font-mono uppercase tracking-tighter">+12</span></span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-white/30 tracking-widest">Neural Match</span>
                <span className="text-xl font-bold text-white">94.2%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94.2%" }}
                    className="h-full bg-neon-cyan shadow-[0_0_8px_#22d3ee]" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Live_Activity</h3>
            <div className="space-y-4">
              {[
                { dot: "bg-neon-cyan", text: "User_99 beat level 12" },
                { dot: "bg-neon-magenta", text: "Ghost88 drop matched" },
                { dot: "bg-white/20", text: "412 Units online", dim: true }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.dot} ${item.dim ? '' : 'shadow-[0_0_5px_currentColor]'}`} />
                  <p className={`text-[10px] uppercase tracking-tight ${item.dim ? 'text-white/30' : 'text-white/70'}`}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Bar: Player Controls */}
      <footer className="h-24 bg-surface-elevated border-t border-white/10 px-8 flex items-center justify-between z-40">
        <div className="flex items-center gap-4 w-72">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-neon-cyan" />
             </div>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{currentTrack.title}</p>
            <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 max-w-lg">
          <div className="flex items-center gap-8">
            <button onClick={prevTrack} className="text-white/40 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-white/40 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/40">{(progress * 0.034).toFixed(2).replace('.', ':')}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-neon-cyan shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/40">{currentTrack.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 w-72">
          <div className="flex items-center gap-3 group">
            <Volume2 className="w-5 h-5 text-white/40 group-hover:text-neon-cyan transition-colors" />
            <div className="w-24 h-1 bg-white/10 rounded-full">
              <div className="w-2/3 h-full bg-white/40"></div>
            </div>
          </div>
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

