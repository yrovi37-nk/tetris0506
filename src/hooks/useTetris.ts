import { useState, useCallback, useEffect, useRef } from 'react';
import { COLS, ROWS, SHAPES, COLORS, LEVEL_SPEEDS } from '../utils/constants';
import { playMoveSound, playRotateSound, playDropSound, playClearSound, playLevelUpSound, playGameOverSound } from '../utils/audio';

type Board = number[][];
type Tetromino = {
  shape: number[][];
  color: string;
  x: number;
  y: number;
  type: number;
};

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(-1));

const randomTetromino = (): Tetromino => {
  const type = Math.floor(Math.random() * SHAPES.length);
  const shape = SHAPES[type];
  return {
    shape,
    color: COLORS[type],
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
    type,
  };
};

export const useTetris = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [current, setCurrent] = useState<Tetromino>(randomTetromino());
  const [nextBlock, setNextBlock] = useState<Tetromino>(randomTetromino());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Use refs for state accessed inside fast intervals/event listeners
  const boardRef = useRef(board);
  const currentRef = useRef(current);
  const isPausedRef = useRef(isPaused);
  const gameOverRef = useRef(gameOver);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrent(randomTetromino());
    setNextBlock(randomTetromino());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
  }, []);

  const isValidPos = useCallback((shape: number[][], x: number, y: number) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
          if (newY >= 0 && boardRef.current[newY][newX] !== -1) return false;
        }
      }
    }
    return true;
  }, []);

  const rotate = useCallback(() => {
    if (isPausedRef.current || gameOverRef.current) return;
    const curr = currentRef.current;
    
    // Transpose and reverse rows (rotate clockwise)
    const rotated = curr.shape[0].map((val, index) => curr.shape.map(row => row[index]).reverse());
    
    if (isValidPos(rotated, curr.x, curr.y)) {
      setCurrent({ ...curr, shape: rotated });
      playRotateSound();
    }
  }, [isValidPos]);

  const move = useCallback((dx: number, dy: number) => {
    if (isPausedRef.current || gameOverRef.current) return false;
    const curr = currentRef.current;
    const newX = curr.x + dx;
    const newY = curr.y + dy;

    if (isValidPos(curr.shape, newX, newY)) {
      setCurrent({ ...curr, x: newX, y: newY });
      if (dx !== 0) playMoveSound();
      return true;
    }
    return false;
  }, [isValidPos]);

  const hardDrop = useCallback(() => {
    if (isPausedRef.current || gameOverRef.current) return;
    const curr = currentRef.current;
    let newY = curr.y;
    while (isValidPos(curr.shape, curr.x, newY + 1)) {
      newY += 1;
    }
    setCurrent({ ...curr, y: newY });
    lockCurrent(curr, newY);
    playDropSound();
  }, [isValidPos]);

  const clearLines = useCallback((newBoard: Board) => {
    let linesCleared = 0;
    const nextBoard = newBoard.filter(row => {
      const isComplete = row.every(cell => cell !== -1);
      if (isComplete) linesCleared++;
      return !isComplete;
    });

    for (let i = 0; i < linesCleared; i++) {
        nextBoard.unshift(Array(COLS).fill(-1));
    }

    if (linesCleared > 0) {
      playClearSound();
      setLines(prev => {
        const newLines = prev + linesCleared;
        const newLevel = Math.min(5, Math.floor(newLines / 10) + 1);
        setLevel(prevLevel => {
          if (newLevel > prevLevel) {
            setTimeout(playLevelUpSound, 500);
          }
          return newLevel;
        });
        return newLines;
      });

      setScore(prev => {
        const points = [0, 10, 30, 50, 70];
        return prev + points[linesCleared];
      });
    }

    return nextBoard;
  }, []);

  const lockCurrent = useCallback((curr: Tetromino, lockedY: number) => {
    const newBoard = boardRef.current.map(row => [...row]);
    
    for (let r = 0; r < curr.shape.length; r++) {
      for (let c = 0; c < curr.shape[r].length; c++) {
        if (curr.shape[r][c]) {
          const by = lockedY + r;
          const bx = curr.x + c;
          if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
            newBoard[by][bx] = curr.type;
          }
        }
      }
    }

    const clearedBoard = clearLines(newBoard);
    setBoard(clearedBoard);

    setNextBlock(prevNext => {
        setCurrent({...prevNext, y: 0, x: Math.floor(COLS / 2) - Math.floor(prevNext.shape[0].length / 2)});
        return randomTetromino();
    });

    // Check game over right after placing next block at initial pos
    setTimeout(() => {
        const newCurr = currentRef.current; // the updated current
        if (!isValidPos(newCurr.shape, newCurr.x, newCurr.y)) {
             setGameOver(true);
             playGameOverSound();
        }
    }, 0);

  }, [clearLines, isValidPos]);
  
  const tick = useCallback(() => {
     if (isPausedRef.current || gameOverRef.current) return;
     const moved = move(0, 1);
     if (!moved) {
         lockCurrent(currentRef.current, currentRef.current.y);
     }
  }, [move, lockCurrent]);

  return {
    board, current, nextBlock, score, level, lines, gameOver, isPaused,
    setIsPaused, move, rotate, hardDrop, tick, resetGame, isValidPos
  };
};
