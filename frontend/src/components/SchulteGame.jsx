import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SchulteTable from './SchulteTable';
import GridSizeSelector from './GridSizeSelector';
import Timer from './Timer';
import ResultsModal from './ResultsModal';
import { RotateCcw, Play, Pause, Info } from 'lucide-react';

const SchulteGame = () => {
  const [gridSize, setGridSize] = useState(5);
  const [gameState, setGameState] = useState('idle'); // idle, playing, paused, completed
  const [currentNumber, setCurrentNumber] = useState(1);
  const [numbers, setNumbers] = useState([]);
  const [completedCells, setCompletedCells] = useState(new Set());
  const [wrongCell, setWrongCell] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [bestTimes, setBestTimes] = useState({});
  const [showInstructions, setShowInstructions] = useState(false);

  // Generate shuffled numbers for the grid
  const generateNumbers = useCallback((size) => {
    const total = size * size;
    const nums = Array.from({ length: total }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  }, []);

  // Initialize or reset the game
  const initializeGame = useCallback(() => {
    setNumbers(generateNumbers(gridSize));
    setCurrentNumber(1);
    setCompletedCells(new Set());
    setWrongCell(null);
    setElapsedTime(0);
    setGameState('idle');
    setShowResults(false);
  }, [gridSize, generateNumbers]);

  // Start the game
  const startGame = () => {
    if (gameState === 'idle') {
      initializeGame();
    }
    setGameState('playing');
  };

  // Pause the game
  const pauseGame = () => {
    setGameState('paused');
  };

  // Resume the game
  const resumeGame = () => {
    setGameState('playing');
  };

  // Handle cell click
  const handleCellClick = (number, index) => {
    if (gameState !== 'playing') return;

    if (number === currentNumber) {
      // Correct answer
      const newCompleted = new Set(completedCells);
      newCompleted.add(index);
      setCompletedCells(newCompleted);
      setWrongCell(null);

      if (currentNumber === gridSize * gridSize) {
        // Game completed
        setGameState('completed');
        // Save best time locally
        const currentBest = bestTimes[gridSize];
        if (!currentBest || elapsedTime < currentBest) {
          setBestTimes(prev => ({ ...prev, [gridSize]: elapsedTime }));
        }
        // Save result to backend
        saveResult(elapsedTime);
        setTimeout(() => setShowResults(true), 500);
      } else {
        setCurrentNumber(currentNumber + 1);
      }
    } else {
      // Wrong answer - show feedback
      setWrongCell(index);
      setTimeout(() => setWrongCell(null), 300);
    }
  };

  // Handle grid size change
  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
    setNumbers(generateNumbers(newSize));
    setCurrentNumber(1);
    setCompletedCells(new Set());
    setWrongCell(null);
    setElapsedTime(0);
    setGameState('idle');
  };

  // Handle timer update
  const handleTimerUpdate = (time) => {
    setElapsedTime(time);
  };

  // Play again
  const playAgain = () => {
    setShowResults(false);
    initializeGame();
  };

  // Initialize numbers on mount and grid size change
  useEffect(() => {
    setNumbers(generateNumbers(gridSize));
  }, [gridSize, generateNumbers]);

  // Load best times from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('schulte-best-times');
    if (saved) {
      setBestTimes(JSON.parse(saved));
    }
  }, []);

  // Save best times to localStorage
  useEffect(() => {
    if (Object.keys(bestTimes).length > 0) {
      localStorage.setItem('schulte-best-times', JSON.stringify(bestTimes));
    }
  }, [bestTimes]);

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:py-10 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
            Таблица Шульте
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Тренировка периферийного зрения и концентрации
          </p>
        </div>

        {/* Main Game Card */}
        <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Grid Size Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Размер:</span>
                <GridSizeSelector 
                  value={gridSize} 
                  onChange={handleGridSizeChange}
                  disabled={gameState === 'playing'}
                />
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center sm:justify-end">
                <Timer 
                  isRunning={gameState === 'playing'}
                  onUpdate={handleTimerUpdate}
                  initialTime={elapsedTime}
                />
              </div>
            </div>

            {/* Current Target */}
            {gameState !== 'idle' && (
              <div className="mt-4 text-center">
                <span className="text-sm text-muted-foreground">Найдите число:</span>
                <div className="text-3xl sm:text-4xl font-semibold text-primary mt-1">
                  {currentNumber}
                </div>
              </div>
            )}

            {/* Instructions Toggle */}
            {gameState === 'idle' && (
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 mx-auto"
              >
                <Info size={16} />
                <span>{showInstructions ? 'Скрыть инструкцию' : 'Как играть?'}</span>
              </button>
            )}

            {/* Instructions */}
            {showInstructions && gameState === 'idle' && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground animate-fade-in-up">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Нажмите цифры по порядку от 1 до {gridSize * gridSize}</li>
                  <li>Старайтесь смотреть в центр таблицы</li>
                  <li>Используйте периферийное зрение для поиска чисел</li>
                  <li>Постарайтесь пройти как можно быстрее</li>
                </ol>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {/* Schulte Table */}
            <div className="flex justify-center mb-6">
              <SchulteTable
                size={gridSize}
                numbers={numbers}
                completedCells={completedCells}
                wrongCell={wrongCell}
                onCellClick={handleCellClick}
                gameState={gameState}
              />
            </div>

            {/* Game Controls */}
            <div className="flex flex-wrap justify-center gap-3">
              {gameState === 'idle' && (
                <Button 
                  onClick={startGame}
                  className="gap-2 px-6"
                  size="lg"
                >
                  <Play size={18} />
                  Начать
                </Button>
              )}

              {gameState === 'playing' && (
                <>
                  <Button 
                    onClick={pauseGame}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Pause size={18} />
                    Пауза
                  </Button>
                  <Button 
                    onClick={initializeGame}
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw size={18} />
                    Заново
                  </Button>
                </>
              )}

              {gameState === 'paused' && (
                <>
                  <Button 
                    onClick={resumeGame}
                    className="gap-2 px-6"
                  >
                    <Play size={18} />
                    Продолжить
                  </Button>
                  <Button 
                    onClick={initializeGame}
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw size={18} />
                    Заново
                  </Button>
                </>
              )}

              {gameState === 'completed' && (
                <Button 
                  onClick={playAgain}
                  className="gap-2 px-6"
                  size="lg"
                >
                  <RotateCcw size={18} />
                  Играть снова
                </Button>
              )}
            </div>

            {/* Best Time Display */}
            {bestTimes[gridSize] && gameState !== 'completed' && (
              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                  Лучшее время ({gridSize}×{gridSize}):{' '}
                  <span className="font-medium text-primary">
                    {formatTime(bestTimes[gridSize])}
                  </span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Modal */}
        <ResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          time={elapsedTime}
          gridSize={gridSize}
          bestTime={bestTimes[gridSize]}
          onPlayAgain={playAgain}
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground/70">
          <p>Тренируйте внимание каждый день</p>
        </footer>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(2, '0')}с`;
};

export default SchulteGame;
