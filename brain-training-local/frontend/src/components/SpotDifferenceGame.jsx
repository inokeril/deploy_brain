import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, CheckCircle2, X, Loader2, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SpotDifferenceGame = ({ difficulty, onBack }) => {
  const [gameState, setGameState] = useState('loading'); // loading, playing, completed
  const [gameData, setGameData] = useState(null);
  const [foundCount, setFoundCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);
  const [clickMarkers, setClickMarkers] = useState([]); // {x, y, correct}
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const difficultyNames = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  };

  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  const startNewGame = async () => {
    setGameState('loading');
    setFoundCount(0);
    setElapsedTime(0);
    setClickMarkers([]);
    setShowResults(false);
    setCompletionTime(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/spot-difference/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ difficulty }),
      });

      if (!response.ok) {
        throw new Error('Failed to start game');
      }

      const data = await response.json();
      setGameData(data);
      setGameState('playing');
      
      // Start timer
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (error) {
      console.error('Error starting game:', error);
      alert('Не удалось загрузить игру. Попробуйте ещё раз.');
      onBack();
    }
  };

  const handleImageClick = async (e, imageNumber) => {
    if (gameState !== 'playing') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Add visual marker
    const marker = {
      x: xPercent,
      y: yPercent,
      correct: false,
      imageNumber,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/spot-difference/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          game_id: gameData.game_id,
          x_percent: xPercent,
          y_percent: yPercent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check click');
      }

      const result = await response.json();
      
      marker.correct = result.correct;
      setClickMarkers(prev => [...prev, marker]);

      if (result.correct) {
        setFoundCount(result.found_count);
        
        if (result.completed) {
          // Game completed!
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState('completed');
          setCompletionTime(result.time_taken);
          setTimeout(() => setShowResults(true), 500);
        }
      }

      // Remove marker after animation
      setTimeout(() => {
        setClickMarkers(prev => prev.filter(m => m !== marker));
      }, 1000);

    } catch (error) {
      console.error('Error checking click:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'loading') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-24">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Генерируем изображения...</p>
            <p className="text-sm text-gray-500 mt-2">Это может занять 10-15 секунд</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gameData) {
    return null;
  }

  return (
    <>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Найди отличия</CardTitle>
              <div className="flex items-center space-x-4">
                <Badge className="bg-purple-100 text-purple-700">
                  {difficultyNames[difficulty]}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{foundCount} / {gameData.total_differences} найдено</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={startNewGame}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Новая игра
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image 1 */}
            <div className="relative">
              <div className="text-center text-sm text-gray-600 mb-2 font-medium">
                Изображение 1
              </div>
              <div
                className="relative cursor-crosshair border-2 border-gray-200 rounded-lg overflow-hidden"
                onClick={(e) => handleImageClick(e, 1)}
              >
                <img
                  src={`data:image/png;base64,${gameData.image1}`}
                  alt="Image 1"
                  className="w-full h-auto"
                />
                {/* Click markers on image 1 */}
                {clickMarkers
                  .filter(m => m.imageNumber === 1)
                  .map((marker, i) => (
                    <div
                      key={i}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                      }}
                    >
                      {marker.correct ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      ) : (
                        <X className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Image 2 */}
            <div className="relative">
              <div className="text-center text-sm text-gray-600 mb-2 font-medium">
                Изображение 2
              </div>
              <div
                className="relative cursor-crosshair border-2 border-gray-200 rounded-lg overflow-hidden"
                onClick={(e) => handleImageClick(e, 2)}
              >
                <img
                  src={`data:image/png;base64,${gameData.image2}`}
                  alt="Image 2"
                  className="w-full h-auto"
                />
                {/* Click markers on image 2 */}
                {clickMarkers
                  .filter(m => m.imageNumber === 2)
                  .map((marker, i) => (
                    <div
                      key={i}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                      }}
                    >
                      {marker.correct ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      ) : (
                        <X className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            💡 Кликайте на места, где вы видите отличия между двумя изображениями
          </div>
        </CardContent>
      </Card>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-2">
              🎉 Поздравляем!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Вы нашли все отличия!
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Ваше время</div>
              <div className="text-4xl font-bold text-purple-600">
                {completionTime ? `${completionTime.toFixed(2)}с` : formatTime(elapsedTime)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Сложность</div>
                <div className="text-lg font-semibold">{difficultyNames[difficulty]}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Отличий найдено</div>
                <div className="text-lg font-semibold">{gameData.total_differences}</div>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={startNewGame}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Играть ещё раз
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

export default SpotDifferenceGame;
