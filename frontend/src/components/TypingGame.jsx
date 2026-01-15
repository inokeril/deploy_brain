import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const TypingGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, preparing, playing, finished
  const [targetText, setTargetText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [prepareTime, setPrepareTime] = useState(5); // Changed to 5 seconds
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [startTime, setStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  
  const timerRef = useRef(null);
  const prepareTimerRef = useRef(null);
  const inputRef = useRef(null);
  const textDisplayRef = useRef(null);
  const typedTextRef = useRef('');
  const gameEndedRef = useRef(false);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepareTimerRef.current) clearInterval(prepareTimerRef.current);
    };
  }, []);

  const calculateWPM = (text, timeInSeconds) => {
    if (timeInSeconds === 0) return 0;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
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

  const generateText = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/typing/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          word_count: settings.wordCount || 30,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate text');
      }
      
      const data = await response.json();
      const cleanedText = data.text.trim().replace(/\s+/g, ' ');
      setTargetText(cleanedText);
    } catch (error) {
      console.error('Error generating text:', error);
      setGenerationError('Не удалось сгенерировать текст. Используем запасной вариант.');
      const fallbacks = settings.fallbackTexts || ['Текст для тренировки печати.'];
      setTargetText(fallbacks[Math.floor(Math.random() * fallbacks.length)].trim());
    } finally {
      setIsGenerating(false);
    }
  };

  const startPreparing = async () => {
    setGameState('preparing');
    setPrepareTime(5); // 5 seconds countdown
    setTypedText('');
    setTargetText('');
    
    generateText();
    
    prepareTimerRef.current = setInterval(() => {
      setPrepareTime(prev => {
        if (prev <= 1) {
          clearInterval(prepareTimerRef.current);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(settings.duration);
    setStartTime(Date.now());
    gameEndedRef.current = false;
    typedTextRef.current = '';
    
    setTimeout(() => {
      inputRef.current?.focus();
      // Scroll to input on mobile
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimeout(() => endGame(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTyping = (e) => {
    if (gameState !== 'playing') return;
    
    const newText = e.target.value;
    setTypedText(newText);
    typedTextRef.current = newText;
    
    if (newText.length >= targetText.length && newText.trim() === targetText.trim()) {
      endGame(newText);
    }
  };

  const endGame = async (finalText = null) => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
    
    const textToEvaluate = finalText || typedTextRef.current || typedText;
    
    const timeSpent = (Date.now() - startTime) / 1000;
    const calculatedWpm = calculateWPM(textToEvaluate, timeSpent);
    const calculatedAccuracy = calculateAccuracy(textToEvaluate, targetText);
    
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
    setTypedText('');
    typedTextRef.current = '';
    gameEndedRef.current = false;
  };

  const renderText = () => {
    if (!targetText) return null;
    
    return targetText.split('').map((char, index) => {
      let className = 'text-gray-400';
      
      if (index < typedText.length) {
        className = typedText[index] === char 
          ? 'text-green-600 bg-green-100' 
          : 'text-red-600 bg-red-100 underline';
      } else if (index === typedText.length) {
        className = 'text-gray-900 bg-indigo-200 animate-pulse';
      }
      
      return (
        <span key={index} className={`${className} transition-colors duration-75`}>
          {char}
        </span>
      );
    });
  };

  // Idle state
  if (gameState === 'idle') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 sm:py-16 text-center px-4">
          <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">⌨️</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Тест скорости печати</h3>
          <p className="text-gray-600 mb-2 max-w-md mx-auto text-sm sm:text-base">
            Проверьте свою скорость набора текста с AI-генерируемым текстом!
          </p>
          <p className="text-xs sm:text-sm text-indigo-600 mb-6 sm:mb-8">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Текст генерируется нейросетью
          </p>
          <Button 
            onClick={startPreparing} 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
          >
            Начать тест
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Preparing state - 5 second countdown
  if (gameState === 'preparing') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 sm:py-16 text-center px-4">
          <div className="mb-6 sm:mb-8">
            <div className="text-6xl sm:text-8xl font-bold text-indigo-600 mb-4 animate-pulse">
              {prepareTime}
            </div>
            <p className="text-lg sm:text-xl text-gray-600">Приготовьтесь...</p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3 text-indigo-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm sm:text-base">Генерируем текст...</span>
              </div>
            ) : targetText ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm sm:text-base">Текст готов!</span>
              </div>
            ) : null}
            
            {generationError && (
              <p className="text-amber-600 text-xs sm:text-sm">{generationError}</p>
            )}
            
            <Progress value={(5 - prepareTime) * 20} className="h-2" />
            
            <p className="text-xs sm:text-sm text-gray-500">
              Положите пальцы на клавиатуру
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Playing state
  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-2xl mb-2">Скорость печати</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-700 text-xs">{difficultyNames[difficulty]}</Badge>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="text-center">
                <div className="text-xs text-gray-600">Прогресс</div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {Math.round((typedText.length / targetText.length) * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Точность</div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {calculateAccuracy(typedText, targetText)}%
                </div>
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
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          {/* Target Text Display - sticky on mobile */}
          <div 
            ref={textDisplayRef}
            className="p-3 sm:p-6 bg-slate-50 rounded-xl border-2 border-slate-200 shadow-inner sticky top-0 z-10"
          >
            <div className="text-base sm:text-xl leading-relaxed font-mono whitespace-pre-wrap max-h-32 sm:max-h-48 overflow-y-auto">
              {renderText()}
            </div>
          </div>

          {/* Input Field */}
          <div>
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleTyping}
              className="w-full p-3 sm:p-4 text-base sm:text-lg font-mono border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white text-gray-900"
              rows={3}
              placeholder="Начните печатать здесь..."
              disabled={gameState !== 'playing'}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
              <span>{typedText.length} / {targetText.length}</span>
              <span>~{calculateWPM(typedText, (Date.now() - (startTime || Date.now())) / 1000)} WPM</span>
            </div>
            <Progress value={(typedText.length / targetText.length) * 100} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Верно</div>
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {typedText.split('').filter((char, i) => char === targetText[i]).length}
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Ошибок</div>
              <div className="text-lg sm:text-xl font-bold text-red-600">
                {typedText.split('').filter((char, i) => char !== targetText[i]).length}
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Осталось</div>
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {Math.max(0, targetText.length - typedText.length)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-center mb-2">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mx-auto mb-2" />
              Тест завершён!
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base">
              Результаты теста скорости печати
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Скорость (WPM)</div>
              <div className="text-4xl sm:text-5xl font-bold text-indigo-600">{wpm}</div>
              <div className="text-sm text-gray-600 mt-2">
                {wpm < 30 ? 'Продолжайте тренироваться!' : wpm < 50 ? 'Хороший результат!' : wpm < 70 ? 'Отличный результат!' : 'Превосходно! 🚀'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Точность</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{accuracy}%</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Символов</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{typedText.length}</div>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base">
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

export default TypingGame;
