

import React, { useState, useRef } from 'react';
import { INITIAL_LEVELS } from './constants';
import MonodromyGame, { MonodromyGameHandle } from './components/MonodromyGame';
import { LevelData } from './types';

const App: React.FC = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isDevMode, setIsDevMode] = useState(false);
  const [devOutput, setDevOutput] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const gameRef = useRef<MonodromyGameHandle>(null);

  const currentLevel: LevelData = INITIAL_LEVELS[currentLevelIndex];

  const handleNextLevel = () => {
    setShowLevelComplete(false);
    if (currentLevelIndex < INITIAL_LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      alert("All levels cleared! Resetting.");
      setCurrentLevelIndex(0);
    }
  };

  const handlePrevLevel = () => {
    setShowLevelComplete(false);
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(prev => prev - 1);
    }
  };

  const handleResetLevel = () => {
    setResetKey(prev => prev + 1);
    setShowLevelComplete(false);
  };

  // Keyboard listener for 'D' to toggle dev mode globally
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'D' || e.key === 'd') {
        setIsDevMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#050510] text-cyan-400 font-mono">
        <h1 className="text-4xl mb-4 tracking-widest uppercase glow">Monodromy</h1>
        <p className="text-sm mb-8 text-cyan-700">The Harmony of Roots</p>
        <button 
          onClick={() => setGameStarted(true)}
          className="px-8 py-3 border border-cyan-500 hover:bg-cyan-900/30 transition-all text-lg tracking-widest"
        >
          START
        </button>
      </div>
    );
  }

  const buttonStyle = "px-3 py-1 border border-cyan-900/50 text-cyan-800 hover:bg-cyan-900/20 hover:text-cyan-400 hover:border-cyan-500 transition-colors text-xs font-mono tracking-widest uppercase pointer-events-auto";
  const zoomButtonStyle = "px-1 py-1 border border-cyan-900/50 text-cyan-800 hover:bg-cyan-900/20 hover:text-cyan-400 hover:border-cyan-500 transition-colors text-xs font-mono tracking-widest uppercase pointer-events-auto";

  return (
    <div className="relative w-screen h-screen bg-[#050510] overflow-hidden">
      {/* Game Canvas */}
      <div className="absolute inset-0 z-0">
        <MonodromyGame 
          ref={gameRef}
          key={`${currentLevel.id}-${resetKey}`}
          levelData={currentLevel} 
          isDevMode={isDevMode}
          onLevelComplete={() => setShowLevelComplete(true)}
          setDevOutput={setDevOutput}
        />
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
        <div>
          <h2 className="text-cyan-400 font-mono text-xl tracking-widest">
            LEVEL {currentLevel.id} <span className="text-xs text-gray-500">/ DEGREE {currentLevel.degree}</span>
          </h2>
          {currentLevel.formula && (
            <p className="text-pink-400 font-mono text-lg mt-2 font-bold tracking-wider">
              {currentLevel.formula}
            </p>
          )}
          <p className="text-cyan-800 text-xs font-mono mt-2">
             Drag <span className="text-pink-500">Squares</span> to guide <span className="text-cyan-300">Dots</span> to <span className="text-yellow-300">Rings</span>.
          </p>
          
          <div className="flex gap-2 mt-4 pointer-events-auto">
            <button 
                onClick={handleResetLevel}
                className={buttonStyle}
            >
                [ RESET ]
            </button>
            <button 
                onClick={() => gameRef.current?.zoom(-0.1)}
                className={zoomButtonStyle}
            >
                [-]
            </button>
            <button 
                onClick={() => gameRef.current?.zoom(0.1)}
                className={zoomButtonStyle}
            >
                [+]
            </button>
          </div>
        </div>
        
        {isDevMode && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded text-red-400 font-mono text-xs pointer-events-auto">
            <h3 className="font-bold border-b border-red-500/30 mb-2 pb-1">DEV MODE ACTIVE</h3>
            <ul className="space-y-1 opacity-80">
              <li>[Drag]: Move any Coeff</li>
              <li>[H]: Snap Horizontal</li>
              <li>[V]: Snap Vertical</li>
              <li>[C]: Snap Circle (Origin)</li>
              <li>[E]: Define Circle Center (Click)</li>
              <li>[Z]: Freeze Position</li>
              <li>[F]: Free Constraint</li>
              <li>[2]: Set Targets to Roots</li>
              <li>[P]: Export JSON</li>
            </ul>
            <div className="flex gap-2 mt-3 w-full">
              <button 
                onClick={handlePrevLevel}
                className="flex-1 bg-red-900/50 hover:bg-red-800/50 text-red-200 py-1 border border-red-500/30 transition-colors uppercase"
              >
                Prev Level
              </button>
              <button 
                onClick={handleNextLevel}
                className="flex-1 bg-red-900/50 hover:bg-red-800/50 text-red-200 py-1 border border-red-500/30 transition-colors uppercase"
              >
                Next Level
              </button>
            </div>
            {devOutput && (
              <textarea 
                className="mt-4 w-64 h-32 bg-black/50 text-green-400 text-[10px] p-2 border border-green-800 focus:outline-none"
                readOnly
                value={devOutput}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            )}
          </div>
        )}
      </div>

      {/* Level Complete Overlay */}
      {showLevelComplete && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="text-center">
             <h2 className="text-5xl font-mono text-cyan-300 mb-2 tracking-tighter">HARMONY ACHIEVED</h2>
             <div className="w-16 h-1 bg-cyan-500 mx-auto mb-8"></div>
             <button 
               onClick={handleNextLevel}
               className="px-6 py-2 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors font-mono"
             >
               PROCEED TO LEVEL {currentLevel.id + 1}
             </button>
           </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="absolute bottom-4 right-6 text-[10px] text-gray-700 font-mono z-10 pointer-events-none">
        MONODROMY ENGINE v1.0 | Press 'D' for Dev Mode
      </div>
    </div>
  );
};

export default App;
