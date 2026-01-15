import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw, Brain, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SequenceGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, showing, input, success, gameover
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeCell, setActiveCell] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [bestLevel, setBestLevel] = useState(0);
  const [showingIndex, setShowingIndex] = useState(-1);
  
  const showTimeoutRef = useRef(null);
  const sequenceTimeoutRef = useRef(null);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };
  
  const gridSize = settings.gridSize;
  const totalCells = gridSize * gridSize;
  const cellColors = [
    'from-red-400 to-red-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600',
    'from-cyan-400 to-cyan-600',
    'from-rose-400 to-rose-600',
    'from-emerald-400 to-emerald-600',
    'from-violet-400 to-violet-600',
    'from-amber-400 to-amber-600',
    'from-lime-400 to-lime-600',
    'from-fuchsia-400 to-fuchsia-600',
  ];

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, []);

  const generateSequence = useCallback((length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * totalCells));
    }
    return newSequence;
  }, [totalCells]);

  const showSequence = useCallback((seq) => {
    setGameState('showing');
    setShowingIndex(-1);
    
    let index = 0;
    
    const showNext = () => {
      if (index < seq.length) {
        setShowingIndex(index);
        setActiveCell(seq[index]);
        
        showTimeoutRef.current = setTimeout(() => {
          setActiveCell(null);
          index++;
          
          sequenceTimeoutRef.current = setTimeout(showNext, settings.pauseBetween);
        }, settings.showTime);
      } else {
        setShowingIndex(-1);
        setGameState('input');
        setUserSequence([]);
      }
    };
    
    // Small delay before starting
    setTimeout(showNext, 500);
  }, [settings.showTime, settings.pauseBetween]);

  const startGame = () => {
    const initialLength = settings.startLength;
    const newSequence = generateSequence(initialLength);
    setSequence(newSequence);
    setCurrentLevel(1);
    setBestLevel(0);
    setUserSequence([]);
    showSequence(newSequence);
  };

  const handleCellClick = (cellIndex) => {
    if (gameState !== 'input') return;
    
    // Visual feedback
    setActiveCell(cellIndex);
    setTimeout(() => setActiveCell(null), 200);
    
    const newUserSequence = [...userSequence, cellIndex];
    setUserSequence(newUserSequence);
    
    // Check if correct so far
    const currentIndex = newUserSequence.length - 1;
    if (newUserSequence[currentIndex] !== sequence[currentIndex]) {
      // Wrong! Game over
      handleGameOver();
      return;
    }
    
    // Check if sequence complete
    if (newUserSequence.length === sequence.length) {
      // Success! Next level
      handleLevelComplete();
    }
  };

  const handleLevelComplete = () => {
    setGameState('success');
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setBestLevel(Math.max(bestLevel, newLevel - 1));
    
    // Generate next sequence (one more element)
    setTimeout(() => {
      const newSequence = generateSequence(settings.startLength + newLevel - 1);
      setSequence(newSequence);
      showSequence(newSequence);
    }, 1000);
  };

  const handleGameOver = async () => {
    setGameState('gameover');
    const finalLevel = currentLevel;
    const maxSequenceLength = settings.startLength + finalLevel - 1;
    
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/sequence/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          level_reached: finalLevel,
          max_sequence_length: maxSequenceLength,
          grid_size: gridSize,
        }),
      });
    } catch (error) {
      console.error('Failed to save result:', error);
    }
    
    setBestLevel(Math.max(bestLevel, finalLevel));
    setShowResults(true);
  };

  const handleRestart = () => {
    setShowResults(false);
    setGameState('idle');
  };

  const getCellStyle = (index) => {
    const isActive = activeCell === index;
    const colorIndex = index % cellColors.length;
    
    return {
      base: `relative rounded-xl transition-all duration-200 cursor-pointer select-none
        ${isActive ? 'scale-95 ring-4 ring-white shadow-2xl' : 'hover:scale-105'}
        bg-gradient-to-br ${cellColors[colorIndex]}`,
      overlay: isActive ? 'opacity-100' : 'opacity-0',
    };
  };

  if (gameState === 'idle') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-16 text-center">
          <div className="text-7xl mb-6">🧠</div>
          <h3 className="text-2xl font-bold mb-4">Запоминание последовательностей</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Запомните порядок, в котором загораются ячейки, и повторите его. С каждым уровнем последовательность становится длиннее!
          </p>
          <div className="flex justify-center gap-4 mb-8 text-sm text-gray-500">
            <span>📊 Сетка: {gridSize}×{gridSize}</span>
            <span>🎯 Старт: {settings.startLength} ячеек</span>
          </div>
          <Button 
            onClick={startGame} 
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-6 text-lg"
          >
            Начать игру
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Запоминание последовательностей</CardTitle>
              <Badge className="bg-purple-100 text-purple-700">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Уровень</div>
                <div className="text-2xl font-bold text-purple-600">{currentLevel}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Длина</div>
                <div className="text-2xl font-bold text-indigo-600">{sequence.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Введено</div>
                <div className="text-2xl font-bold text-gray-900">
                  {userSequence.length}/{sequence.length}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status indicator */}
          <div className="mb-4 text-center">
            {gameState === 'showing' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>Запоминайте последовательность... ({showingIndex + 1}/{sequence.length})</span>
              </div>
            )}
            {gameState === 'input' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <Brain className="w-4 h-4" />
                <span>Ваш ход! Повторите последовательность</span>
              </div>
            )}
            {gameState === 'success' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full animate-bounce">
                <Trophy className="w-4 h-4" />
                <span>Отлично! Следующий уровень...</span>
              </div>
            )}
          </div>

          {/* Game Grid */}
          <div 
            className="mx-auto p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl"
            style={{ maxWidth: `${gridSize * 90 + 40}px` }}
          >
            <div 
              className="grid gap-3"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {Array.from({ length: totalCells }).map((_, index) => {
                const style = getCellStyle(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={gameState !== 'input'}
                    className={style.base}
                    style={{ 
                      aspectRatio: '1',
                      minWidth: '60px',
                      minHeight: '60px',
                    }}
                  >
                    {/* Glow effect when active */}
                    <div 
                      className={`absolute inset-0 rounded-xl bg-white transition-opacity duration-200 ${style.overlay}`}
                      style={{ mixBlendMode: 'overlay' }}
                    />
                    
                    {/* Number indicator (optional, for debugging or easy mode) */}
                    {settings.showNumbers && (
                      <span className="absolute inset-0 flex items-center justify-center text-white/50 font-bold text-lg">
                        {index + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            💡 Совет: Попробуйте создать мысленные ассоциации между ячейками
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-2">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              Игра завершена!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Результаты игры "Запоминание последовательностей"
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Достигнутый уровень</div>
              <div className="text-5xl font-bold text-purple-600">{currentLevel}</div>
              <div className="text-sm text-gray-600 mt-2">
                Максимальная длина: {settings.startLength + currentLevel - 1} ячеек
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Сетка</div>
                <div className="text-2xl font-bold text-indigo-600">{gridSize}×{gridSize}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Сложность</div>
                <div className="text-2xl font-bold text-purple-600">{difficultyNames[difficulty]}</div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Играть ещё
              </Button>
              <Button onClick={onBack} variant="outline" className="flex-1">
                Выбрать сложность
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SequenceGame;
