import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, RotateCcw, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ReactionGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, waiting, ready, clicked, results
  const [currentRound, setCurrentRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [showResults, setShowResults] = useState(false);
  const [earlyClick, setEarlyClick] = useState(false);
  
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const difficultyNames = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getRandomDelay = () => {
    const [min, max] = settings.delayRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getRandomPosition = () => {
    if (!settings.randomPosition) {
      return { x: 50, y: 50 };
    }
    
    // Random position with padding from edges
    const padding = 15; // 15% from edges
    const x = Math.floor(Math.random() * (100 - 2 * padding)) + padding;
    const y = Math.floor(Math.random() * (100 - 2 * padding)) + padding;
    return { x, y };
  };

  const startRound = () => {
    setEarlyClick(false);
    setCurrentTime(null);
    setGameState('waiting');
    setTargetPosition(getRandomPosition());

    const delay = getRandomDelay();
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Clicked too early!
      setEarlyClick(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimeout(() => {
        startRound(); // Restart round
      }, 1000);
      return;
    }

    if (gameState === 'ready') {
      // Calculate reaction time
      const reactionTime = Date.now() - startTimeRef.current;
      setCurrentTime(reactionTime);
      setReactionTimes(prev => [...prev, reactionTime]);
      setGameState('clicked');

      // Next round or finish
      setTimeout(() => {
        if (currentRound + 1 < settings.rounds) {
          setCurrentRound(currentRound + 1);
          startRound();
        } else {
          finishGame([...reactionTimes, reactionTime]);
        }
      }, 1500);
    }
  };

  const finishGame = async (times) => {
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const best = Math.min(...times);
    const worst = Math.max(...times);

    // Save to backend
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reaction/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          attempts: times,
          average_time: average,
          best_time: best,
        }),
      });
    } catch (error) {
      console.error('Failed to save result:', error);
    }

    setGameState('results');
    setShowResults(true);
  };

  const handleStart = () => {
    setCurrentRound(0);
    setReactionTimes([]);
    startRound();
  };

  const handleRestart = () => {
    setShowResults(false);
    setCurrentRound(0);
    setReactionTimes([]);
    setCurrentTime(null);
    setGameState('idle');
  };

  const getRatingText = (time) => {
    if (time < 200) return { text: 'Молниеносно! ⚡', color: 'text-purple-600' };
    if (time < 300) return { text: 'Отлично! 🎯', color: 'text-green-600' };
    if (time < 400) return { text: 'Хорошо! 👍', color: 'text-blue-600' };
    if (time < 500) return { text: 'Неплохо 👌', color: 'text-yellow-600' };
    return { text: 'Можно быстрее 🐌', color: 'text-orange-600' };
  };

  const average = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : null;

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Тест скорости реакции</CardTitle>
              <div className="flex items-center space-x-4">
                <Badge className="bg-yellow-100 text-yellow-700">
                  {difficultyNames[difficulty]}
                </Badge>
                <div className="text-sm text-gray-600">
                  Раунд {currentRound + 1} / {settings.rounds}
                </div>
              </div>
            </div>
            {gameState !== 'idle' && gameState !== 'results' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Начать заново
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {gameState === 'idle' && (
            <div className="text-center py-24">
              <Zap className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Готовы проверить свою реакцию?</h3>
              <p className="text-gray-600 mb-8">
                Кликните на зелёный круг как можно быстрее, когда он появится
              </p>
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Начать тест
              </Button>
            </div>
          )}

          {(gameState === 'waiting' || gameState === 'ready' || gameState === 'clicked') && (
            <div
              onClick={handleClick}
              className={`relative cursor-pointer transition-all duration-300 rounded-lg overflow-hidden ${
                gameState === 'waiting' ? 'bg-red-500' : 
                gameState === 'ready' ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ height: '400px' }}
            >
              {/* Instruction text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {gameState === 'waiting' && !earlyClick && (
                  <div className="text-white text-center">
                    <h3 className="text-3xl font-bold mb-2">Ждите...</h3>
                    <p className="text-lg">Зелёный круг скоро появится</p>
                  </div>
                )}
                {earlyClick && (
                  <div className="text-white text-center">
                    <h3 className="text-3xl font-bold mb-2">Слишком рано!</h3>
                    <p className="text-lg">Ждите зелёный круг</p>
                  </div>
                )}
                {gameState === 'clicked' && currentTime && (
                  <div className="text-white text-center">
                    <h3 className="text-5xl font-bold mb-2">{currentTime}мс</h3>
                    <p className={`text-2xl font-semibold ${getRatingText(currentTime).color}`}>
                      {getRatingText(currentTime).text}
                    </p>
                  </div>
                )}
              </div>

              {/* Target circle */}
              {gameState === 'ready' && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    left: `${targetPosition.x}%`,
                    top: `${targetPosition.y}%`,
                    width: `${settings.targetSize}px`,
                    height: `${settings.targetSize}px`,
                  }}
                >
                  <div className="w-full h-full rounded-full bg-white shadow-2xl flex items-center justify-center">
                    <Zap className="w-1/2 h-1/2 text-green-500" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {gameState !== 'idle' && gameState !== 'results' && reactionTimes.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Прогресс</span>
                <span>{reactionTimes.length} / {settings.rounds}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(reactionTimes.length / settings.rounds) * 100}%` }}
                />
              </div>
              {average && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Средняя реакция</p>
                  <p className="text-3xl font-bold text-yellow-600">{average.toFixed(0)}мс</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-2">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              Тест завершён!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Результаты теста на скорость реакции
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            {/* Average */}
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Средняя реакция</div>
              <div className="text-4xl font-bold text-yellow-600">
                {average?.toFixed(0)}мс
              </div>
              <div className={`text-sm font-medium mt-2 ${getRatingText(average).color}`}>
                {getRatingText(average).text}
              </div>
            </div>

            {/* Best & Worst */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-gray-600">Лучшая</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.min(...reactionTimes).toFixed(0)}мс
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm text-gray-600">Худшая</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {Math.max(...reactionTimes).toFixed(0)}мс
                </div>
              </div>
            </div>

            {/* All attempts */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Все попытки:</div>
              <div className="flex flex-wrap gap-2">
                {reactionTimes.map((time, i) => (
                  <Badge key={i} variant="outline" className="text-sm">
                    {i + 1}: {time.toFixed(0)}мс
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Попробовать ещё раз
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1"
              >
                Выбрать сложность
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReactionGame;
