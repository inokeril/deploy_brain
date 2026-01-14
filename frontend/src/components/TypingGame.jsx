import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TypingGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle');
  const [targetText, setTargetText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [startTime, setStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const calculateWPM = (text, timeInSeconds) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  };

  const calculateAccuracy = (typed, target) => {
    if (typed.length === 0) return 100;
    let correct = 0;
    const minLength = Math.min(typed.length, target.length);
    
    for (let i = 0; i < minLength; i++) {
      if (typed[i] === target[i]) correct++;
    }
    
    return Math.round((correct / typed.length) * 100);
  };

  const startGame = () => {
    const randomText = settings.texts[Math.floor(Math.random() * settings.texts.length)];
    setTargetText(randomText);
    setTypedText('');
    setTimeLeft(settings.duration);
    setGameState('playing');
    setStartTime(Date.now());
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTyping = (e) => {
    const newText = e.target.value;
    setTypedText(newText);
    
    if (newText === targetText) {
      endGame();
    }
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
    
    const timeSpent = (Date.now() - startTime) / 1000;
    const calculatedWpm = calculateWPM(typedText, timeSpent);
    const calculatedAccuracy = calculateAccuracy(typedText, targetText);
    
    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/typing/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          wpm: calculatedWpm,
          accuracy: calculatedAccuracy,
          total_time: timeSpent,
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

  const renderText = () => {
    return targetText.split('').map((char, index) => {
      let className = 'text-gray-400';
      
      if (index < typedText.length) {
        className = typedText[index] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      } else if (index === typedText.length) {
        className = 'text-gray-900 bg-blue-100';
      }
      
      return (
        <span key={index} className={`${className} transition-colors duration-100`}>
          {char}
        </span>
      );
    });
  };

  if (gameState === 'idle') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-24 text-center">
          <div className="text-6xl mb-6">⌨️</div>
          <h3 className="text-2xl font-bold mb-4">Тест скорости печати</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Проверьте свою скорость набора текста. Чем быстрее и точнее - тем лучше результат!
          </p>
          <Button onClick={startGame} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-6 text-lg">
            Начать тест
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
              <CardTitle className="text-2xl mb-2">Скорость печати</CardTitle>
              <Badge className="bg-indigo-100 text-indigo-700">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Символов</div>
                <div className="text-2xl font-bold text-blue-600">{typedText.length}/{targetText.length}</div>
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
        <CardContent className="space-y-6">
          {/* Target Text Display */}
          <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xl leading-relaxed font-mono">
              {renderText()}
            </div>
          </div>

          {/* Input Field */}
          <div>
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleTyping}
              className="w-full p-4 text-lg font-mono border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Начните печатать здесь..."
              disabled={gameState !== 'playing'}
              spellCheck={false}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Правильно</div>
              <div className="text-2xl font-bold text-green-600">
                {typedText.split('').filter((char, i) => char === targetText[i]).length}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Ошибок</div>
              <div className="text-2xl font-bold text-red-600">
                {typedText.split('').filter((char, i) => char !== targetText[i]).length}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Точность</div>
              <div className="text-2xl font-bold text-blue-600">
                {calculateAccuracy(typedText, targetText)}%
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            💡 Совет: Старайтесь печатать без ошибок, даже если это замедлит вас
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-2">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              Тест завершён!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Результаты теста скорости печати
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Скорость (WPM)</div>
              <div className="text-4xl font-bold text-indigo-600">{wpm}</div>
              <div className="text-sm text-gray-600 mt-2">
                {wpm < 40 ? 'Продолжайте тренироваться!' : wpm < 60 ? 'Хороший результат!' : wpm < 80 ? 'Отличный результат!' : 'Превосходно! 🚀'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Точность</div>
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Символов</div>
                <div className="text-2xl font-bold text-blue-600">{typedText.length}</div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Попробовать ещё
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

export default TypingGame;