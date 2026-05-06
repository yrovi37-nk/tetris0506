import React, { useState } from 'react';
import { Intro } from './components/Intro';
import { Tetris } from './components/Tetris';

function App() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [lastScore, setLastScore] = useState(0);
  const [lastLevel, setLastLevel] = useState(1);

  const startGame = () => {
    setGameState('playing');
  };

  const handleGameOver = (score: number, level: number) => {
    setLastScore(score);
    setLastLevel(level);
    setGameState('intro'); // Returns to intro showing last score, acting as game over screen
  };
  
  const handleBackToMenu = () => {
    setGameState('intro');
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      {gameState === 'intro' && (
         <Intro 
           onStart={startGame} 
           lastScore={lastScore} 
           lastLevel={lastLevel} 
         />
      )}
      {gameState === 'playing' && (
         <Tetris 
           onGameOver={handleGameOver} 
           onBackToMenu={handleBackToMenu}
         />
      )}
    </div>
  );
}

export default App;
