import React, { useEffect, useState } from 'react';
import { GameState } from '../../types';
import { generateAuntyCommentary } from '../../services/geminiService';
import { soundManager } from '../../services/soundManager';

interface GameOverModalProps {
  score: number;
  causeOfDeath: string;
  gameState: GameState;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, causeOfDeath, gameState, onRestart, onMenu }) => {
  const [commentary, setCommentary] = useState<string>("Judge AI is thinking...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      soundManager.playGameOver();
      setLoading(true);
      generateAuntyCommentary(score, causeOfDeath).then((text) => {
        setCommentary(text);
        setLoading(false);
      });
    } else {
        setCommentary("Judge AI is thinking...");
    }
  }, [gameState, score, causeOfDeath]);

  const handleRestart = () => {
      soundManager.playClick();
      onRestart();
  }

  const handleMenu = () => {
      soundManager.playClick();
      onMenu();
  }

  if (gameState !== GameState.GAME_OVER) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-lg z-50">
      <div className="relative w-full max-w-2xl mx-4 glass-panel rounded-3xl p-1 bg-gradient-to-br from-pink-500/50 to-purple-600/50">
      <div className="bg-gray-900/90 rounded-[22px] p-8 md:p-12 text-center border border-white/10 shadow-2xl">
        
        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-orange-600 mb-2 drop-shadow-sm font-comic">GAME OVER</h2>
        <div className="text-white/80 font-bold text-lg mb-8 uppercase tracking-widest bg-white/5 inline-block px-4 py-1 rounded-full">{causeOfDeath}</div>
        
        <div className="mb-8 grid grid-cols-1 gap-4">
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Final Score</div>
                <div className="text-6xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] font-comic">
                    {score}
                </div>
            </div>
        </div>

        {/* AI Commentary Box */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 mb-10 border border-white/10 relative shadow-inner">
            <div className="absolute -top-3 left-6 bg-blue-500 text-white font-bold px-3 py-1 rounded-md text-[10px] uppercase shadow-lg tracking-wider">
                Commentary Box
            </div>
            <p className="text-xl md:text-2xl text-white font-medium italic leading-relaxed font-serif">
                "{loading ? <span className="animate-pulse">Analyzing replay footage...</span> : commentary}"
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
                onClick={handleRestart}
                className="flex-1 px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-lg shadow-[0_5px_0_rgb(150,0,50)] active:shadow-none active:translate-y-1 transition-all"
            >
                RESPAWN
            </button>
            <button 
                onClick={handleMenu}
                className="flex-1 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-lg shadow-[0_5px_0_rgb(50,50,50)] active:shadow-none active:translate-y-1 transition-all"
            >
                MAIN MENU
            </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default GameOverModal;