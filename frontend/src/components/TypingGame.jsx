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
  const [prepareTime, setPrepareTime] = useState(10);
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
  const typedTextRef = useRef(''); // Track typed text for timer callback
  const gameEndedRef = useRef(false); // Prevent double ending

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
      // Clean and normalize the text - remove extra whitespace
      const cleanedText = data.text.trim().replace(/\s+/g, ' ');
      setTargetText(cleanedText);
    } catch (error) {
      console.error('Error generating text:', error);
      setGenerationError('Не удалось сгенерировать текст. Используем запасной вариант.');
      // Use fallback text
      const fallbacks = settings.fallbackTexts || ['Текст для тренировки печати.'];
      setTargetText(fallbacks[Math.floor(Math.random() * fallbacks.length)].trim());
    } finally {
      setIsGenerating(false);
    }
  };

  const startPreparing = async () => {
    setGameState('preparing');
    setPrepareTime(10);
    setTypedText('');
    setTargetText('');
    
    // Start generating text
    generateText();
    
    // Start countdown
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
    if (gameState !== 'playing') return;
    
    const newText = e.target.value;
    setTypedText(newText);
    
    // Only end game if user typed the EXACT full text
    // Use trimmed comparison to avoid whitespace issues
    if (newText.length >= targetText.length && newText.trim() === targetText.trim()) {
      endGame(newText);
    }
  };

  const endGame = async (finalText = null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
    
    // Use passed text or current state
    const textToEvaluate = finalText || typedText;
    
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
        <CardContent className="py-16 text-center">
          <div className="text-7xl mb-6">⌨️</div>
          <h3 className="text-2xl font-bold mb-4">Тест скорости печати</h3>
          <p className="text-gray-600 mb-2 max-w-md mx-auto">
            Проверьте свою скорость набора текста с AI-генерируемым текстом!
          </p>
          <p className="text-sm text-indigo-600 mb-8">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Текст генерируется нейросетью специально для вас
          </p>
          <Button 
            onClick={startPreparing} 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
          >
            Начать тест
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Preparing state - countdown + text generation
  if (gameState === 'preparing') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-16 text-center">
          <div className="mb-8">
            <div className="text-8xl font-bold text-indigo-600 mb-4 animate-pulse">
              {prepareTime}
            </div>
            <p className="text-xl text-gray-600">Приготовьтесь...</p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3 text-indigo-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Генерируем текст с помощью AI...</span>
              </div>
            ) : targetText ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Sparkles className="w-5 h-5" />
                <span>Текст готов!</span>
              </div>
            ) : null}
            
            {generationError && (
              <p className="text-amber-600 text-sm">{generationError}</p>
            )}
            
            <Progress value={(10 - prepareTime) * 10} className="h-2" />
            
            <p className="text-sm text-gray-500">
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Скорость печати</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-700">{difficultyNames[difficulty]}</Badge>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI текст
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Прогресс</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((typedText.length / targetText.length) * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Точность</div>
                <div className="text-2xl font-bold text-green-600">
                  {calculateAccuracy(typedText, targetText)}%
                </div>
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
        <CardContent className="space-y-6">
          {/* Target Text Display */}
          <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200 shadow-inner">
            <div className="text-xl leading-relaxed font-mono whitespace-pre-wrap">
              {renderText()}
            </div>
          </div>

          {/* Input Field */}
          <div>
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleTyping}
              className="w-full p-4 text-lg font-mono border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white"
              rows={4}
              placeholder="Начните печатать здесь..."
              disabled={gameState !== 'playing'}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{typedText.length} / {targetText.length} символов</span>
              <span>~{calculateWPM(typedText, (Date.now() - (startTime || Date.now())) / 1000)} WPM</span>
            </div>
            <Progress value={(typedText.length / targetText.length) * 100} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Правильно</div>
              <div className="text-xl font-bold text-green-600">
                {typedText.split('').filter((char, i) => char === targetText[i]).length}
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Ошибок</div>
              <div className="text-xl font-bold text-red-600">
                {typedText.split('').filter((char, i) => char !== targetText[i]).length}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Осталось</div>
              <div className="text-xl font-bold text-blue-600">
                {Math.max(0, targetText.length - typedText.length)}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            💡 Старайтесь печатать без ошибок, точность важнее скорости!
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
              <div className="text-5xl font-bold text-indigo-600">{wpm}</div>
              <div className="text-sm text-gray-600 mt-2">
                {wpm < 30 ? 'Продолжайте тренироваться!' : wpm < 50 ? 'Хороший результат!' : wpm < 70 ? 'Отличный результат!' : 'Превосходно! 🚀'}
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
