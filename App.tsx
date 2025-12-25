import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/UI/HUD';
import MainMenu from './components/UI/MainMenu';
import GameOverModal from './components/UI/GameOverModal';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [hp, setHp] = useState(3);
  const [causeOfDeath, setCauseOfDeath] = useState("Unknown");

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setDistance(0);
    setHp(3);
  };

  const restartGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setDistance(0);
    setHp(3);
  };

  const goToMenu = () => {
    setGameState(GameState.MENU);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 select-none">
      
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        setScore={setScore}
        setDistance={setDistance}
        setHp={setHp}
        setCauseOfDeath={setCauseOfDeath}
      />

      <HUD 
        score={score} 
        distance={distance}
        hp={hp} 
        gameState={gameState} 
      />

      <MainMenu 
        gameState={gameState} 
        onStart={startGame} 
      />

      <GameOverModal 
        gameState={gameState}
        score={score}
        causeOfDeath={causeOfDeath}
        onRestart={restartGame}
        onMenu={goToMenu}
      />

    </div>
  );
};

export default App;