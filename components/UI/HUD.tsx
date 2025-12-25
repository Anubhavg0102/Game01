import React from 'react';
import { GameState } from '../../types';

interface HUDProps {
  score: number;
  distance: number;
  hp: number;
  gameState: GameState;
}

const HUD: React.FC<HUDProps> = ({ score, distance, hp, gameState }) => {
  if (gameState !== GameState.PLAYING) return null;

  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
      
      {/* Score & Distance Panel */}
      <div className="flex flex-col gap-4">
        {/* Score */}
        <div className="glass-panel px-6 py-3 rounded-2xl border border-white/30 transform skew-x-[-10deg] shadow-[0_10px_20px_rgba(0,0,0,0.3)] bg-gradient-to-r from-purple-600/90 to-blue-600/90 overflow-hidden relative">
           <div className="absolute inset-0 bg-white/10 skew-x-[20deg] animate-pulse"></div>
           <div className="transform skew-x-[10deg]">
             <span className="text-purple-200 text-xs font-bold tracking-widest uppercase block mb-1 drop-shadow-md">Score</span>
             <span className="text-4xl font-black text-white drop-shadow-[2px_4px_0_rgba(0,0,0,0.5)] font-comic">
               {score.toString().padStart(6, '0')}
             </span>
           </div>
        </div>

        {/* Distance */}
        <div className="glass-panel px-5 py-2 rounded-xl border border-white/20 transform skew-x-[-10deg] bg-black/40">
           <div className="transform skew-x-[10deg] flex items-center gap-2">
             <span className="text-green-400 text-lg">🏃‍♀️</span>
             <span className="text-2xl font-bold text-white font-mono">
               {distance}m
             </span>
           </div>
        </div>
      </div>

      {/* HP Panel */}
      <div className="flex gap-4 items-center">
        <div className="glass-panel px-8 py-3 rounded-full flex gap-3 shadow-[0_0_30px_rgba(255,0,100,0.2)] bg-black/30 border border-white/20 backdrop-blur-md">
           {Array.from({ length: 3 }).map((_, i) => (
             <div 
               key={i} 
               className={`w-10 h-10 flex items-center justify-center text-3xl transition-all duration-300 transform ${i < hp ? 'scale-100 opacity-100 animate-pulse' : 'scale-75 opacity-30 grayscale'}`}
               style={{ filter: i < hp ? 'drop-shadow(0 0 5px rgba(255,50,50,0.8))' : 'none' }}
             >
               ❤️
             </div>
           ))}
        </div>
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-10 left-10 glass-panel px-6 py-3 rounded-full text-white/90 text-sm font-semibold border border-white/20 flex gap-4 shadow-lg">
         <span><span className="text-yellow-400 font-bold">↑ / SPACE</span> Jump</span>
         <span className="text-white/30">|</span>
         <span><span className="text-yellow-400 font-bold">↔</span> Run</span>
         <span className="text-white/30">|</span>
         <span><span className="text-yellow-400 font-bold">Z</span> Attack</span>
      </div>
    </div>
  );
};

export default HUD;