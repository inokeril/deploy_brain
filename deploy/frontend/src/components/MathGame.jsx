import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Trophy, RotateCcw, Check, X, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MathGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle'); // idle, playing, finished
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [problemsAnswered, setProblemsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const gameActiveRef = useRef(false);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };
  
  const operatorSymbols = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateProblem = useCallback(() => {
    const { operations, minNumber, maxNumber } = settings;
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        num2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        num2 = Math.floor(Math.random() * num1) + minNumber;
        if (num2 > num1) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case '*':
        const maxMult = Math.min(maxNumber, settings.maxMultiplier || 12);
        num1 = Math.floor(Math.random() * maxMult) + 1;
        num2 = Math.floor(Math.random() * maxMult) + 1;
        answer = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    return { num1, num2, operation, answer };
  }, [settings]);

  const startGame = () => {
    setScore(0);
    setErrors(0);
    setProblemsAnswered(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(settings.duration);
    setUserAnswer('');
    setFeedback(null);
    setGameState('playing');
    gameActiveRef.current = true;
    setCurrentProblem(generateProblem());
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Focus input with delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Check answer automatically when user types
  const handleInputChange = (e) => {
    if (!gameActiveRef.current) return;
    
    const value = e.target.value;
    setUserAnswer(value);
    
    if (!currentProblem || value === '' || value === '-') return;
    
    const numericAnswer = parseInt(value, 10);
    
    // Check if answer is correct
    if (numericAnswer === currentProblem.answer) {
      // Correct answer - auto advance
      setProblemsAnswered(prev => prev + 1);
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
      setFeedback({ type: 'correct' });
      
      // Very short delay then move to next problem
      setTimeout(() => {
        if (!gameActiveRef.current) return;
        setFeedback(null);
        setUserAnswer('');
        setCurrentProblem(generateProblem());
        // Keep focus on input - this is key!
        inputRef.current?.focus();
      }, 150);
    }
  };

  // Handle Enter key for wrong answers
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && userAnswer !== '') {
      e.preventDefault();
      
      const numericAnswer = parseInt(userAnswer, 10);
      
      if (numericAnswer !== currentProblem?.answer) {
        // Wrong answer
        setProblemsAnswered(prev => prev + 1);
        setErrors(prev => prev + 1);
        setStreak(0);
        setFeedback({ type: 'wrong', correctAnswer: currentProblem.answer });
        
        setTimeout(() => {
          if (!gameActiveRef.current) return;
          setFeedback(null);
          setUserAnswer('');
          setCurrentProblem(generateProblem());
          inputRef.current?.focus();
        }, 600);
      }
    }
  };

  const endGame = async () => {
    gameActiveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
    
    const accuracy = problemsAnswered > 0 ? Math.round((score / problemsAnswered) * 100) : 0;
    
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/math/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          correct_answers: score,
          total_problems: problemsAnswered,
          errors: errors,
          accuracy: accuracy,
          max_streak: maxStreak,
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
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 sm:py-16 text-center px-4">
          <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">🧮</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Математические задачи</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm sm:text-base">
            Решайте примеры как можно быстрее! Правильный ответ засчитывается автоматически.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-500">
            <span>⏱️ Время: {settings.duration}с</span>
            <span>🔢 Операции: {settings.operations.map(op => operatorSymbols[op]).join(' ')}</span>
          </div>
          <Button 
            onClick={startGame} 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
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
              <CardTitle className="text-lg sm:text-2xl mb-2">Математика</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-center">
                <div className="text-xs text-gray-600">Верно</div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Ошибки</div>
                <div className="text-lg sm:text-2xl font-bold text-red-600">{errors}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Серия</div>
                <div className="text-lg sm:text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
                  {streak > 0 && <Zap className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {streak}
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
        <CardContent>
          {/* Problem Display */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 shadow-2xl">
            {currentProblem && (
              <div className="text-center">
                <div className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 sm:mb-6 font-mono tracking-wider">
                  {currentProblem.num1} {operatorSymbols[currentProblem.operation]} {currentProblem.num2} = ?
                </div>
                
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <Input
                    ref={inputRef}
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userAnswer}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-28 sm:w-36 h-14 sm:h-16 text-2xl sm:text-3xl text-center font-bold bg-white border-4 border-slate-300 focus:border-emerald-500 rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="?"
                    autoComplete="off"
                    disabled={feedback !== null}
                  />
                </div>
                
                <p className="text-slate-400 text-xs sm:text-sm mt-4">
                  💡 Правильный ответ засчитается автоматически
                </p>
              </div>
            )}
            
            {/* Feedback overlay */}
            {feedback && (
              <div className={`absolute inset-0 flex items-center justify-center rounded-2xl ${
                feedback.type === 'correct' ? 'bg-green-500/90' : 'bg-red-500/90'
              }`}>
                <div className="text-center text-white">
                  {feedback.type === 'correct' ? (
                    <div className="flex flex-col items-center">
                      <Check className="w-16 h-16 sm:w-20 sm:h-20 mb-2" />
                      <span className="text-2xl sm:text-3xl font-bold">Верно!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <X className="w-16 h-16 sm:w-20 sm:h-20 mb-2" />
                      <span className="text-2xl sm:text-3xl font-bold">Неверно</span>
                      <span className="text-lg sm:text-xl mt-2">Ответ: {feedback.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
              <span>Прогресс</span>
              <span>{problemsAnswered} примеров</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${(timeLeft / settings.duration) * 100}%` }}
              />
            </div>
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
              Результаты игры
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Правильных ответов</div>
              <div className="text-4xl sm:text-5xl font-bold text-emerald-600">{score}</div>
              <div className="text-sm text-gray-600 mt-2">
                Точность: {problemsAnswered > 0 ? Math.round((score / problemsAnswered) * 100) : 0}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Всего</div>
                <div className="text-lg sm:text-xl font-bold text-blue-600">{problemsAnswered}</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Ошибки</div>
                <div className="text-lg sm:text-xl font-bold text-red-600">{errors}</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Серия</div>
                <div className="text-lg sm:text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  {maxStreak}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-sm sm:text-base">
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

export default MathGame;
