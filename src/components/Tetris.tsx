import React, { useEffect, useState, useCallback } from 'react';
import { useTetris } from '../hooks/useTetris';
import { COLS, ROWS, COLORS, LEVEL_SPEEDS } from '../utils/constants';
import { playBGM, stopBGM, pauseBGM, resumeBGM } from '../utils/audio';

interface TetrisProps {
  onGameOver: (score: number, level: number) => void;
  onBackToMenu: () => void;
}

export const Tetris: React.FC<TetrisProps> = ({ onGameOver, onBackToMenu }) => {
  const {
    board, current, nextBlock, score, level, gameOver, isPaused,
    setIsPaused, move, rotate, hardDrop, tick, isValidPos
  } = useTetris();

  const [softDrop, setSoftDrop] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGhost, setShowGhost] = useState(true);

  // Handle BGM
  useEffect(() => {
    playBGM();
    return () => {
      stopBGM();
    };
  }, []);

  useEffect(() => {
    if (isPaused) {
      pauseBGM();
    } else if (!gameOver) {
      resumeBGM();
    }
  }, [isPaused, gameOver]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) return;

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          move(-1, 0);
          break;
        case 'ArrowRight':
          move(1, 0);
          break;
        case 'ArrowUp':
          rotate();
          break;
        case 'ArrowDown':
          setSoftDrop(true);
          break;
        case ' ':
          hardDrop();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSoftDrop(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [move, rotate, hardDrop, isPaused, gameOver, setIsPaused]);

  // Handle game loop
  useEffect(() => {
    if (gameOver) {
      onGameOver(score, level);
      return;
    }
    if (isPaused) return;

    const baseSpeed = LEVEL_SPEEDS[level - 1] || LEVEL_SPEEDS[LEVEL_SPEEDS.length - 1];
    const dropSpeed = softDrop ? 50 : baseSpeed;

    const timeout = setTimeout(tick, dropSpeed);
    return () => clearTimeout(timeout);
  }, [tick, isPaused, softDrop, level, gameOver, score, onGameOver]);

  // Calculate ghost position
  const getGhostY = useCallback(() => {
    let gy = current.y;
    while (isValidPos(current.shape, current.x, gy + 1)) {
      gy++;
    }
    return gy;
  }, [current, isValidPos]);

  const ghostY = getGhostY();

  return (
    <div className="flex justify-center items-start md:items-center h-full bg-gray-900 font-mono text-white p-2 sm:p-4 overflow-y-auto">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl items-center md:items-stretch w-full max-w-xs md:max-w-max my-auto transition-all">
        
        {/* Game Board */}
        <div 
          className="relative border-4 border-gray-700 bg-black overflow-hidden shadow-inner box-content shrink-0 w-[55vw] max-w-[240px] md:w-[240px]" 
          style={{ aspectRatio: '10 / 20' }}
        >
          {/* Static Board Colors */}
          {board.map((row, y) =>
            row.map((cellType, x) => (
              <div
                key={`cell-${y}-${x}`}
                className={`absolute ${cellType !== -1 ? 'border border-black/50' : (showGrid ? 'border border-gray-800/30' : '')}`}
                style={{
                  left: `${x * 10}%`,
                  top: `${y * 5}%`,
                  width: '10%',
                  height: '5%',
                  backgroundColor: cellType !== -1 ? COLORS[cellType] : '#111',
                }}
              />
            ))
          )}

          {/* Ghost Block */}
          {showGhost && !gameOver && !isPaused && current.shape.map((row, r) =>
            row.map((cell, c) => (
              cell ? (
                <div
                  key={`ghost-${r}-${c}`}
                  className="absolute pointer-events-none opacity-20 border border-gray-400"
                  style={{
                    left: `${(current.x + c) * 10}%`,
                    top: `${(ghostY + r) * 5}%`,
                    width: '10%',
                    height: '5%',
                    backgroundColor: current.color,
                  }}
                />
              ) : null
            ))
          )}

          {/* Current Falling Block */}
          {!gameOver && !isPaused && current.shape.map((row, r) =>
            row.map((cell, c) => {
              if (!cell) return null;
              const y = current.y + r;
              // Don't render if it's above the visible board
              if (y < 0) return null;
              return (
                <div
                  key={`curr-${r}-${c}`}
                  className="absolute border border-black/50"
                  style={{
                    left: `${(current.x + c) * 10}%`,
                    top: `${y * 5}%`,
                    width: '10%',
                    height: '5%',
                    backgroundColor: current.color,
                  }}
                />
              )
            })
          )}

          {/* Overlays */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <span className="text-2xl font-bold tracking-widest text-white">일시 정지</span>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-4 md:gap-6 w-full md:w-48 shrink-0">
          
          <div className="bg-gray-700 p-4 rounded-lg">
             <div className="text-sm text-gray-300 tracking-wider mb-1 font-bold">점수</div>
             <div className="text-2xl font-bold text-yellow-400 font-mono">{score}</div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
             <div className="text-sm text-gray-300 tracking-wider mb-1 font-bold">레벨</div>
             <div className="text-2xl font-bold text-cyan-400 font-mono">{level}</div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
             <div className="text-sm text-gray-300 tracking-wider mb-2 w-full self-start font-bold">다음 블록</div>
             <div className="relative" style={{ width: '96px', height: '96px' }}>
                {nextBlock.shape.map((row, r) => 
                   row.map((cell, c) => cell ? (
                       <div 
                         key={`next-${r}-${c}`}
                         className="absolute border border-black/50"
                         style={{
                             left: `${c * 24 + (4 - nextBlock.shape[0].length) * 12}px`,
                             top: `${r * 24 + (4 - nextBlock.shape.length) * 12}px`,
                             width: '24px',
                             height: '24px',
                             backgroundColor: nextBlock.color
                         }}
                       />
                   ) : null)
                )}
             </div>
          </div>

          <div className="bg-gray-700 p-3 flex flex-col gap-2 rounded-lg mt-auto">
             <div className="flex justify-between items-center">
                 <span className="text-sm text-white font-bold">격자 가이드</span>
                 <button 
                     onClick={(e) => { e.currentTarget.blur(); setShowGrid(!showGrid); }}
                     className={`px-4 py-1 rounded text-xs font-bold transition-colors ${showGrid ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                 >
                     {showGrid ? 'ON' : 'OFF'}
                 </button>
             </div>
             <div className="flex justify-between items-center">
                 <span className="text-sm text-white font-bold">낙하 힌트</span>
                 <button 
                     onClick={(e) => { e.currentTarget.blur(); setShowGhost(!showGhost); }}
                     className={`px-4 py-1 rounded text-xs font-bold transition-colors ${showGhost ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                 >
                     {showGhost ? 'ON' : 'OFF'}
                 </button>
             </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-700 p-4 rounded-lg text-xs text-gray-300 leading-relaxed font-sans">
             <div className="font-bold text-white mb-2 tracking-wide">조작키 안내</div>
             <p className="flex justify-between mb-1"><span>좌우 방향키</span><span className="text-gray-400">이동</span></p>
             <p className="flex justify-between mb-1"><span>위 화살표 (↑)</span><span className="text-gray-400">회전</span></p>
             <p className="flex justify-between mb-1"><span>아래 화살표 (↓)</span><span className="text-gray-400">소프트 드롭</span></p>
             <p className="flex justify-between mb-1"><span>스페이스바</span><span className="text-gray-400">하드 드롭</span></p>
             <p className="flex justify-between"><span>P 키</span><span className="text-gray-400">일시 정지</span></p>
          </div>
          
          <button 
             onClick={onBackToMenu}
             className="w-full py-2 bg-gray-600 hover:bg-red-600 transition-colors rounded-lg text-sm font-bold tracking-wider"
          >
            메뉴로 돌아가기
          </button>
        </div>

      </div>
    </div>
  );
};
