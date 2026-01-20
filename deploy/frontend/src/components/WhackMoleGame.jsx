import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mole component with animation
const Mole = ({ isVisible, isHit, onClick, size }) => {
  const moleSize = size === 'small' ? 'w-[60%]' : 'w-[70%]';
  
  return (
    <div 
      className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${moleSize} cursor-pointer transition-all duration-150 ease-out select-none`}
      style={{
        transform: `translateX(-50%) translateY(${isVisible ? '15%' : '100%'})`,
        opacity: isHit ? 0.5 : 1,
      }}
      onClick={onClick}
    >
      <div className={`relative transition-transform duration-100 ${isHit ? 'scale-90' : 'hover:scale-105'}`}>
        <div className="relative">
          <div className="bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-full aspect-square relative overflow-hidden">
            <div className="absolute -left-1 top-2 w-3 h-3 sm:w-4 sm:h-4 bg-amber-700 rounded-full" />
            <div className="absolute -right-1 top-2 w-3 h-3 sm:w-4 sm:h-4 bg-amber-700 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-[60%] bg-gradient-to-t from-amber-200 to-amber-400 rounded-t-full" />
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full">
                  <div className={`absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full top-0.5 left-0.5 ${isHit ? '' : 'animate-pulse'}`} />
                </div>
              </div>
              <div className="relative">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full">
                  <div className={`absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full top-0.5 left-0.5 ${isHit ? '' : 'animate-pulse'}`} />
                </div>
              </div>
            </div>
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-3 h-2 sm:w-4 sm:h-3 bg-pink-400 rounded-full" />
            <div className="absolute top-[70%] left-1/2 -translate-x-1/2 flex gap-0.5">
              <div className="w-1 h-1.5 sm:w-1.5 sm:h-2 bg-white rounded-b-sm" />
              <div className="w-1 h-1.5 sm:w-1.5 sm:h-2 bg-white rounded-b-sm" />
            </div>
            {isHit && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg sm:text-2xl animate-ping">⭐</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hole component
const Hole = ({ index, moleState, onWhack, holeSize }) => {
  const isVisible = moleState?.visible || false;
  const isHit = moleState?.hit || false;

  return (
    <div 
      className="relative flex items-end justify-center"
      style={{ width: holeSize, height: holeSize }}
    >
      <div className="relative w-full h-[85%] overflow-hidden">
        <Mole 
          isVisible={isVisible} 
          isHit={isHit} 
          onClick={() => isVisible && !isHit && onWhack(index)}
          size={holeSize < 100 ? 'small' : 'normal'}
        />
      </div>
      
      <div className="absolute bottom-0 w-full">
        <div className="relative">
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] h-4 sm:h-6 bg-amber-900/30 rounded-[50%]"
            style={{ transform: 'translateX(-50%) translateY(2px)' }}
          />
          <div className="relative w-full h-3 sm:h-5 bg-gradient-to-b from-amber-950 to-black rounded-[50%] border-2 sm:border-4 border-amber-800" />
        </div>
      </div>
    </div>
  );
};

const WhackMoleGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle');
  const [moles, setMoles] = useState({});
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [showResults, setShowResults] = useState(false);
  const [totalSpawned, setTotalSpawned] = useState(0);
  
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const moleTimeoutsRef = useRef({});
  const processedMolesRef = useRef(new Set()); // Track processed moles to prevent double counting
  const gameActiveRef = useRef(false);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };
  
  const gridSize = settings.gridSize || 3;
  const totalHoles = gridSize * gridSize;
  const holeSize = Math.min(90, Math.floor((window.innerWidth - 60) / gridSize));

  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      Object.values(moleTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const spawnMole = useCallback(() => {
    if (!gameActiveRef.current) return;
    
    setMoles(prevMoles => {
      const activeMoles = Object.values(prevMoles).filter(m => m.visible && !m.hit).length;
      if (activeMoles >= settings.maxMoles) return prevMoles;
      
      const occupiedHoles = Object.keys(prevMoles).filter(k => prevMoles[k].visible);
      const availableHoles = Array.from({ length: totalHoles }, (_, i) => i)
        .filter(i => !occupiedHoles.includes(String(i)));
      
      if (availableHoles.length === 0) return prevMoles;
      
      const holeIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
      const moleId = `mole_${Date.now()}_${holeIndex}`;
      
      setTotalSpawned(prev => prev + 1);
      
      // Set timeout for this mole to hide and count as miss
      const timeoutId = setTimeout(() => {
        if (!gameActiveRef.current) return;
        
        setMoles(prev => {
          const currentMole = prev[holeIndex];
          // Only count as miss if this exact mole is still visible and not hit
          if (currentMole?.moleId === moleId && currentMole?.visible && !currentMole?.hit) {
            // Check if not already processed
            if (!processedMolesRef.current.has(moleId)) {
              processedMolesRef.current.add(moleId);
              setMisses(m => m + 1);
            }
            return { ...prev, [holeIndex]: { visible: false, hit: false, moleId: null } };
          }
          return prev;
        });
      }, settings.moleVisibleTime);
      
      moleTimeoutsRef.current[moleId] = timeoutId;
      
      return { ...prevMoles, [holeIndex]: { visible: true, hit: false, moleId } };
    });
  }, [settings.maxMoles, settings.moleVisibleTime, totalHoles]);

  const handleWhack = useCallback((holeIndex) => {
    if (!gameActiveRef.current) return;
    
    setMoles(prev => {
      const currentMole = prev[holeIndex];
      if (!currentMole?.visible || currentMole?.hit) return prev;
      
      const moleId = currentMole.moleId;
      
      // Check if already processed
      if (processedMolesRef.current.has(moleId)) return prev;
      
      // Mark as processed
      processedMolesRef.current.add(moleId);
      
      // Clear the timeout for this mole
      if (moleTimeoutsRef.current[moleId]) {
        clearTimeout(moleTimeoutsRef.current[moleId]);
        delete moleTimeoutsRef.current[moleId];
      }
      
      // Increment score
      setScore(s => s + 1);
      
      // Hide mole after hit animation
      setTimeout(() => {
        setMoles(p => {
          if (p[holeIndex]?.moleId === moleId) {
            return { ...p, [holeIndex]: { visible: false, hit: false, moleId: null } };
          }
          return p;
        });
      }, 300);
      
      return { ...prev, [holeIndex]: { ...prev[holeIndex], hit: true } };
    });
  }, []);

  const startGame = () => {
    setMoles({});
    setScore(0);
    setMisses(0);
    setTotalSpawned(0);
    setTimeLeft(settings.duration);
    setGameState('playing');
    processedMolesRef.current = new Set();
    moleTimeoutsRef.current = {};
    gameActiveRef.current = true;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(spawnMole, settings.spawnInterval);
    setTimeout(spawnMole, 500);
  };

  const endGame = async () => {
    gameActiveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    Object.values(moleTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    
    setGameState('finished');

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/whack-mole/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          hits: score,
          misses: misses,
          total_time: settings.duration,
        }),
      });
    } catch (error) {
      console.error('Failed to save result:', error);
    }

    setShowResults(true);
  };

  const handleRestart = () => {
    setShowResults(false);
    setGameState('idle');
  };

  if (gameState === 'idle') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-10 sm:py-16 text-center px-4">
          <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">🦔</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Поймай крота</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm sm:text-base">
            Кроты выглядывают из норок! Кликайте на них как можно быстрее.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-500">
            <span>🕳️ Норок: {totalHoles}</span>
            <span>🦔 Макс: {settings.maxMoles}</span>
            <span>⏱️ Время: {settings.duration}с</span>
          </div>
          <Button 
            onClick={startGame} 
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
          >
            Начать игру
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-2xl mb-2">Поймай крота</CardTitle>
              <Badge className="bg-amber-100 text-amber-700 text-xs">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="text-center">
                <div className="text-xs text-gray-600">Поймано</div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Сбежало</div>
                <div className="text-lg sm:text-2xl font-bold text-red-600">{misses}</div>
              </div>
              <div className="text-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mx-auto" />
                <div className={`text-lg sm:text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                  {timeLeft}с
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div 
            className="relative rounded-xl sm:rounded-2xl overflow-hidden mx-auto"
            style={{ 
              background: 'linear-gradient(180deg, #87CEEB 0%, #98D8AA 30%, #4A7C23 50%, #3D5A1E 100%)',
              padding: '10px',
              maxWidth: '100%',
            }}
          >
            <div className="absolute top-1 left-2 sm:top-2 sm:left-4 text-lg sm:text-2xl opacity-80">☁️</div>
            <div className="absolute top-2 right-6 sm:top-4 sm:right-8 text-base sm:text-xl opacity-60">☁️</div>
            <div className="absolute top-0 right-16 sm:top-1 sm:right-24 text-sm sm:text-lg opacity-70">☁️</div>
            <div className="absolute top-1 right-2 sm:top-2 sm:right-4 text-xl sm:text-3xl">🌞</div>
            
            <div 
              className="relative rounded-lg sm:rounded-xl p-2 sm:p-4 mt-6 sm:mt-8"
              style={{
                background: 'linear-gradient(180deg, #6B8E23 0%, #556B2F 50%, #4A5D23 100%)',
                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div 
                className="grid gap-1 sm:gap-2 justify-center items-end mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, ${holeSize}px)`,
                }}
              >
                {Array.from({ length: totalHoles }).map((_, index) => (
                  <Hole
                    key={index}
                    index={index}
                    moleState={moles[index]}
                    onWhack={handleWhack}
                    holeSize={holeSize}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
            🔨 Кликайте по кротам!
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-center mb-2">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mx-auto mb-2" />
              Игра завершена!
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base">
              Результаты игры "Поймай крота"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Итоговый счёт</div>
              <div className="text-3xl sm:text-4xl font-bold text-amber-600">{score}</div>
              <div className="text-sm text-gray-600 mt-2">
                Точность: {totalSpawned > 0 ? Math.round((score / totalSpawned) * 100) : 0}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Поймано</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Сбежало</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600">{misses}</div>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm sm:text-base">
                <RotateCcw className="w-4 h-4 mr-2" />
                Ещё
              </Button>
              <Button onClick={onBack} variant="outline" className="flex-1 text-sm sm:text-base">
                Назад
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhackMoleGame;
