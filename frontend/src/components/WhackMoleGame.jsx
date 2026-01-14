import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, RotateCcw, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const WhackMoleGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle');
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [showResults, setShowResults] = useState(false);
  
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const targetIdRef = useRef(0);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, []);

  const spawnTarget = () => {
    const activeTargets = targets.filter(t => !t.hit && !t.expired).length;
    if (activeTargets >= settings.maxTargets) return;

    const x = Math.random() * 85 + 5;
    const y = Math.random() * 85 + 5;
    const id = targetIdRef.current++;
    
    const newTarget = {
      id,
      x,
      y,
      hit: false,
      expired: false,
      spawnTime: Date.now(),
    };

    setTargets(prev => [...prev, newTarget]);

    setTimeout(() => {
      setTargets(prev => prev.map(t => 
        t.id === id && !t.hit ? { ...t, expired: true } : t
      ));
      setMisses(m => m + 1);
      
      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, settings.targetLifetime);
  };

  const handleTargetClick = (targetId) => {
    setTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, hit: true } : t
    ));
    setScore(s => s + 1);
    
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== targetId));
    }, 300);
  };

  const startGame = () => {
    setTargets([]);
    setScore(0);
    setMisses(0);
    setTimeLeft(settings.duration);
    setGameState('playing');
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(spawnTarget, settings.spawnInterval);
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    
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
        <CardContent className="py-24 text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h3 className="text-2xl font-bold mb-4">Поймай крота</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Кликайте на появляющиеся круги как можно быстрее. Чем больше поймаете - тем лучше результат!
          </p>
          <Button onClick={startGame} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-6 text-lg">
            Начать игру
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Поймай крота</CardTitle>
              <Badge className="bg-orange-100 text-orange-700">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Попадания</div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Промахи</div>
                <div className="text-2xl font-bold text-red-600">{misses}</div>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 text-gray-600 mx-auto" />
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {timeLeft}с
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden cursor-crosshair"
            style={{ height: '500px' }}
          >
            {targets.map(target => {
              if (target.expired && !target.hit) return null;
              
              return (
                <div
                  key={target.id}
                  onClick={() => !target.hit && !target.expired && handleTargetClick(target.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 cursor-pointer ${
                    target.hit 
                      ? 'bg-green-500 scale-150 opacity-0' 
                      : target.expired 
                      ? 'bg-red-500 scale-50 opacity-0'
                      : 'bg-gradient-to-br from-orange-500 to-red-600 hover:scale-110 shadow-lg'
                  }`}
                  style={{
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    width: `${settings.targetSize}px`,
                    height: `${settings.targetSize}px`,
                  }}
                >
                  {!target.hit && !target.expired && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Target className="w-1/2 h-1/2 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {gameState === 'playing' && targets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <p className="text-lg">Приготовьтесь... Цели скоро появятся!</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            💡 Совет: Будьте внимательны и реагируйте быстро!
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
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Итоговый счёт</div>
              <div className="text-4xl font-bold text-orange-600">{score}</div>
              <div className="text-sm text-gray-600 mt-2">
                Точность: {Math.round((score / (score + misses)) * 100) || 0}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Попадания</div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Промахи</div>
                <div className="text-2xl font-bold text-red-600">{misses}</div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
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