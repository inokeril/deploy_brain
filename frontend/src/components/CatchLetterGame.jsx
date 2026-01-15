import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CatchLetterGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle');
  const [letters, setLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const animationRef = useRef(null);
  const letterIdRef = useRef(0);
  const gameAreaRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const inputRef = useRef(null);
  const missedIdsRef = useRef(new Set()); // Track already missed letters

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const handleKeyPress = (e) => {
        const key = e.key.toUpperCase();
        const matchingLetter = letters.find(l => l.char === key && !l.caught && !l.missed);
        
        if (matchingLetter) {
          setScore(prev => prev + 1);
          setFeedback({ type: 'correct', char: key });
          setLetters(prev => prev.map(l => 
            l.id === matchingLetter.id ? { ...l, caught: true } : l
          ));
          
          setTimeout(() => setFeedback(null), 300);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, letters]);

  const spawnLetter = useCallback(() => {
    setLetters(prev => {
      if (prev.filter(l => !l.caught && !l.missed).length >= settings.maxLetters) {
        return prev;
      }

      const char = settings.letters[Math.floor(Math.random() * settings.letters.length)];
      const x = Math.random() * 70 + 15;
      const newId = letterIdRef.current++;
      
      return [...prev, {
        id: newId,
        char,
        x,
        y: -10,
        caught: false,
        missed: false,
      }];
    });
  }, [settings.letters, settings.maxLetters]);

  const updateLetters = useCallback(() => {
    const now = Date.now();
    const delta = (now - lastUpdateRef.current) / 16.67;
    lastUpdateRef.current = now;

    setLetters(prev => {
      const updated = prev.map(letter => {
        if (letter.caught || letter.missed) return letter;
        
        const newY = letter.y + (settings.speed * 0.5 * delta);
        
        // Check if letter reached bottom and not already counted
        if (newY >= 85 && !missedIdsRef.current.has(letter.id)) {
          missedIdsRef.current.add(letter.id);
          setMissed(m => m + 1);
          return { ...letter, y: newY, missed: true };
        }
        
        return { ...letter, y: newY };
      });
      
      return updated.filter(l => !(l.missed && l.y >= 100));
    });

    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(updateLetters);
    }
  }, [settings.speed, gameState]);

  const handleMobileInput = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length > 0) {
      const key = value[value.length - 1];
      const matchingLetter = letters.find(l => l.char === key && !l.caught && !l.missed);
      
      if (matchingLetter) {
        setScore(prev => prev + 1);
        setFeedback({ type: 'correct', char: key });
        setLetters(prev => prev.map(l => 
          l.id === matchingLetter.id ? { ...l, caught: true } : l
        ));
        
        setTimeout(() => setFeedback(null), 300);
      }
      
      // Clear input after processing
      e.target.value = '';
    }
  };

  const startGame = () => {
    setLetters([]);
    setScore(0);
    setMissed(0);
    setTimeLeft(settings.duration);
    setGameState('playing');
    lastUpdateRef.current = Date.now();
    missedIdsRef.current = new Set(); // Reset missed tracking
    letterIdRef.current = 0;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(spawnLetter, settings.spawnInterval);
    animationRef.current = requestAnimationFrame(updateLetters);
    
    // Focus hidden input for mobile keyboard
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    setGameState('finished');

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/catch-letter/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          caught_letters: score,
          missed_letters: missed,
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

  const focusInput = () => {
    inputRef.current?.focus();
  };

  if (gameState === 'idle') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 sm:py-24 text-center px-4">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🔤</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Поймай букву</h3>
          <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
            Нажимайте на клавиатуре буквы, которые падают сверху. Чем больше поймаете - тем лучше!
          </p>
          <Button onClick={startGame} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
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
              <CardTitle className="text-lg sm:text-2xl mb-2">Поймай букву</CardTitle>
              <Badge className="bg-blue-100 text-blue-700 text-xs">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="text-center">
                <div className="text-xs text-gray-600">Поймано</div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Пропущено</div>
                <div className="text-lg sm:text-2xl font-bold text-red-600">{missed}</div>
              </div>
              <div className="text-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mx-auto" />
                <div className={`text-lg sm:text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {timeLeft}с
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {/* Hidden input for mobile keyboard */}
          <input
            ref={inputRef}
            type="text"
            className="absolute opacity-0 pointer-events-none"
            onChange={handleMobileInput}
            autoComplete="off"
            autoCapitalize="characters"
          />
          
          <div 
            ref={gameAreaRef}
            className="relative bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg overflow-hidden cursor-pointer" 
            style={{ height: '350px' }}
            onClick={focusInput}
          >
            {/* Bottom danger zone indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-red-200/50 to-transparent pointer-events-none" />
            
            {letters.map(letter => {
              if (letter.missed || letter.caught) return null;
              
              return (
                <div
                  key={letter.id}
                  className="absolute text-3xl sm:text-5xl font-bold select-none"
                  style={{
                    left: `${letter.x}%`,
                    top: `${letter.y}%`,
                    transform: 'translateX(-50%)',
                    color: '#3b82f6',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  {letter.char}
                </div>
              );
            })}
            
            {feedback && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <div className="animate-ping">
                  <CheckCircle2 className="w-16 h-16 sm:w-24 sm:h-24 text-green-500" />
                </div>
              </div>
            )}

            {gameState === 'playing' && letters.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <p className="text-sm sm:text-lg">Приготовьтесь...</p>
              </div>
            )}
            
            {/* Tap hint for mobile */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={focusInput}
                className="bg-white/80 text-xs sm:text-sm"
              >
                ⌨️ Нажмите для клавиатуры
              </Button>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
            💡 Нажимайте на игровое поле, чтобы открыть клавиатуру
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
              Результаты игры "Поймай букву"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Итоговый счёт</div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600 mt-2">
                Точность: {score + missed > 0 ? Math.round((score / (score + missed)) * 100) : 0}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Поймано</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Пропущено</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600">{missed}</div>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base">
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

export default CatchLetterGame;
