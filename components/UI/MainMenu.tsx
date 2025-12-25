import React from 'react';
import { GameState } from '../../types';
import { soundManager } from '../../services/soundManager';

interface MainMenuProps {
  onStart: () => void;
  gameState: GameState;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, gameState }) => {
  if (gameState !== GameState.MENU) return null;

  const handleStart = () => {
      soundManager.init(); // Ensure audio context is ready
      soundManager.playClick();
      onStart();
  }

  const handleHover = () => {
      // Optional: Add subtle hover sound if desired
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 overflow-hidden">
      <div className="relative z-10 text-center flex flex-col items-center">
        
        {/* 3D Title */}
        <div className="relative mb-8 group cursor-default">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <h1 className="relative text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 drop-shadow-[0_10px_0_rgba(50,0,50,1)] filter font-comic transform -rotate-3 hover:scale-105 transition-transform duration-500">
            DINO DASH
            </h1>
            <h2 className="relative text-5xl font-bold text-white tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] mt-2">
            GIRL POWER
            </h2>
        </div>

        {/* 3D Button */}
        <button 
          onClick={handleStart}
          onMouseEnter={handleHover}
          className="group relative px-16 py-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-[0_10px_0_rgb(50,20,80)] active:shadow-none active:translate-y-[10px] transform transition-all duration-100 border-t-2 border-white/20 mt-8"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </div>
          <span className="relative text-4xl font-black text-white drop-shadow-md tracking-wider flex items-center gap-4">
             <span>▶</span> PLAY NOW
          </span>
        </button>

        <p className="mt-12 text-white/70 font-mono text-sm max-w-lg leading-relaxed bg-black/50 p-6 rounded-xl backdrop-blur-xl border border-white/10 shadow-2xl">
          <span className="text-pink-400 font-bold">MISSION:</span> Run as far as you can! Dodge the spicy cacti, jump over fire pits, and defeat the dino army with your mighty chappals!
        </p>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-10 left-10 text-9xl opacity-10 animate-pulse delay-75">🦖</div>
         <div className="absolute bottom-10 right-10 text-9xl opacity-10 animate-bounce delay-150">👧</div>
         <div className="absolute top-1/2 left-20 text-6xl opacity-10 animate-spin-slow">🩴</div>
      </div>
    </div>
  );
};

export default MainMenu;