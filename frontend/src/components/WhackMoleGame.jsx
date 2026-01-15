import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mole component with animation
const Mole = ({ isVisible, isHit, onClick }) => {
  return (
    <div 
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] cursor-pointer transition-all duration-150 ease-out select-none"
      style={{
        transform: `translateX(-50%) translateY(${isVisible ? '15%' : '100%'})`,
        opacity: isHit ? 0.5 : 1,
      }}
      onClick={onClick}
    >
      {/* Mole body */}
      <div className={`relative transition-transform duration-100 ${isHit ? 'scale-90' : 'hover:scale-105'}`}>
        {/* Mole face */}
        <div className="relative">
          {/* Main head */}
          <div className="bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-full aspect-square relative overflow-hidden">
            {/* Ears */}
            <div className="absolute -left-1 top-2 w-4 h-4 bg-amber-700 rounded-full" />
            <div className="absolute -right-1 top-2 w-4 h-4 bg-amber-700 rounded-full" />
            
            {/* Face lighter area */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-[60%] bg-gradient-to-t from-amber-200 to-amber-400 rounded-t-full" />
            
            {/* Eyes */}
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 flex gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-white rounded-full">
                  <div className={`absolute w-2 h-2 bg-black rounded-full top-0.5 left-0.5 ${isHit ? '' : 'animate-pulse'}`} />
                </div>
              </div>
              <div className="relative">
                <div className="w-3 h-3 bg-white rounded-full">
                  <div className={`absolute w-2 h-2 bg-black rounded-full top-0.5 left-0.5 ${isHit ? '' : 'animate-pulse'}`} />
                </div>
              </div>
            </div>
            
            {/* Nose */}
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-4 h-3 bg-pink-400 rounded-full" />
            
            {/* Whiskers */}
            <div className="absolute top-[60%] left-[15%] w-4 h-0.5 bg-amber-900 -rotate-12" />
            <div className="absolute top-[65%] left-[15%] w-3 h-0.5 bg-amber-900" />
            <div className="absolute top-[60%] right-[15%] w-4 h-0.5 bg-amber-900 rotate-12" />
            <div className="absolute top-[65%] right-[15%] w-3 h-0.5 bg-amber-900" />
            
            {/* Mouth / Teeth */}
            <div className="absolute top-[70%] left-1/2 -translate-x-1/2 flex gap-0.5">
              <div className="w-1.5 h-2 bg-white rounded-b-sm" />
              <div className="w-1.5 h-2 bg-white rounded-b-sm" />
            </div>
            
            {/* Hit effect - stars */}
            {isHit && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl animate-ping">⭐</span>
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
      {/* Hole with mole container */}
      <div className="relative w-full h-[85%] overflow-hidden">
        {/* Mole */}
        <Mole 
          isVisible={isVisible} 
          isHit={isHit} 
          onClick={() => isVisible && !isHit && onWhack(index)}
        />
      </div>
      
      {/* Hole front (covers mole when hidden) */}
      <div className="absolute bottom-0 w-full">
        {/* Dirt mound */}
        <div className="relative">
          {/* Back shadow */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] h-6 bg-amber-900/30 rounded-[50%]"
            style={{ transform: 'translateX(-50%) translateY(2px)' }}
          />
          {/* Main hole ellipse */}
          <div className="relative w-full h-5 bg-gradient-to-b from-amber-950 to-black rounded-[50%] border-4 border-amber-800" />
          {/* Grass around hole */}
          <div className="absolute -top-1 left-[10%] w-2 h-3 bg-green-600 rounded-t-full -rotate-12" />
          <div className="absolute -top-2 left-[20%] w-1.5 h-4 bg-green-500 rounded-t-full rotate-6" />
          <div className="absolute -top-1 right-[10%] w-2 h-3 bg-green-600 rounded-t-full rotate-12" />
          <div className="absolute -top-2 right-[20%] w-1.5 h-4 bg-green-500 rounded-t-full -rotate-6" />
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

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };
  
  // Calculate grid based on settings
  const gridSize = settings.gridSize || 3;
  const totalHoles = gridSize * gridSize;
  const holeSize = Math.min(140, 500 / gridSize - 10);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      Object.values(moleTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const spawnMole = useCallback(() => {
    setMoles(prevMoles => {
      const activeMoles = Object.values(prevMoles).filter(m => m.visible && !m.hit).length;
      if (activeMoles >= settings.maxMoles) return prevMoles;
      
      // Find available holes
      const occupiedHoles = Object.keys(prevMoles).filter(k => prevMoles[k].visible);
      const availableHoles = Array.from({ length: totalHoles }, (_, i) => i)
        .filter(i => !occupiedHoles.includes(String(i)));
      
      if (availableHoles.length === 0) return prevMoles;
      
      const holeIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
      
      setTotalSpawned(prev => prev + 1);
      
      // Set timeout for this mole to hide
      const timeoutId = setTimeout(() => {
        setMoles(prev => {
          if (prev[holeIndex]?.visible && !prev[holeIndex]?.hit) {
            setMisses(m => m + 1);
            return { ...prev, [holeIndex]: { visible: false, hit: false } };
          }
          return prev;
        });
      }, settings.moleVisibleTime);
      
      moleTimeoutsRef.current[holeIndex] = timeoutId;
      
      return { ...prevMoles, [holeIndex]: { visible: true, hit: false } };
    });
  }, [settings.maxMoles, settings.moleVisibleTime, totalHoles]);

  const handleWhack = useCallback((holeIndex) => {
    setMoles(prev => {
      if (!prev[holeIndex]?.visible || prev[holeIndex]?.hit) return prev;
      
      // Clear the timeout for this mole
      if (moleTimeoutsRef.current[holeIndex]) {
        clearTimeout(moleTimeoutsRef.current[holeIndex]);
      }
      
      setScore(s => s + 1);
      
      // Hide mole after hit animation
      setTimeout(() => {
        setMoles(p => ({ ...p, [holeIndex]: { visible: false, hit: false } }));
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
    moleTimeoutsRef.current = {};
    
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
    
    // Spawn first mole immediately
    setTimeout(spawnMole, 500);
  };

  const endGame = async () => {
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
        <CardContent className="py-16 text-center">
          <div className="text-7xl mb-6">🦔</div>
          <h3 className="text-2xl font-bold mb-4">Поймай крота</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Кроты выглядывают из норок! Кликайте на них как можно быстрее, чтобы набрать очки.
          </p>
          <div className="flex justify-center gap-4 mb-8 text-sm text-gray-500">
            <span>🕳️ Норок: {totalHoles}</span>
            <span>🦔 Макс. кротов: {settings.maxMoles}</span>
            <span>⏱️ Время: {settings.duration}с</span>
          </div>
          <Button 
            onClick={startGame} 
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
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
              <CardTitle className="text-2xl mb-2">Поймай крота</CardTitle>
              <Badge className="bg-amber-100 text-amber-700">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Поймано</div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Сбежало</div>
                <div className="text-2xl font-bold text-red-600">{misses}</div>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 text-gray-600 mx-auto" />
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                  {timeLeft}с
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Game Field */}
          <div 
            className="relative rounded-2xl overflow-hidden mx-auto"
            style={{ 
              background: 'linear-gradient(180deg, #87CEEB 0%, #98D8AA 30%, #4A7C23 50%, #3D5A1E 100%)',
              padding: '20px',
              minHeight: '450px',
            }}
          >
            {/* Sky decorations */}
            <div className="absolute top-2 left-4 text-2xl opacity-80">☁️</div>
            <div className="absolute top-4 right-8 text-xl opacity-60">☁️</div>
            <div className="absolute top-1 right-24 text-lg opacity-70">☁️</div>
            
            {/* Sun */}
            <div className="absolute top-2 right-4 text-3xl">🌞</div>
            
            {/* Grass field background */}
            <div 
              className="relative rounded-xl p-4 mt-8"
              style={{
                background: 'linear-gradient(180deg, #6B8E23 0%, #556B2F 50%, #4A5D23 100%)',
                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {/* Holes grid */}
              <div 
                className="grid gap-2 justify-center items-end mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, ${holeSize}px)`,
                  minHeight: `${gridSize * holeSize}px`,
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
            
            {/* Fence decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-around">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-1 h-full bg-amber-800 rounded-t" />
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            🔨 Кликайте по кротам, когда они выглядывают из норок!
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
              Результаты игры "Поймай крота"
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Итоговый счёт</div>
              <div className="text-4xl font-bold text-amber-600">{score}</div>
              <div className="text-sm text-gray-600 mt-2">
                Точность: {totalSpawned > 0 ? Math.round((score / totalSpawned) * 100) : 0}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Поймано</div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Сбежало</div>
                <div className="text-2xl font-bold text-red-600">{misses}</div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
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

export default WhackMoleGame;
