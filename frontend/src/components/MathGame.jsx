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
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong', answer: number }
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };
  
  const operatorSymbols = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  useEffect(() => {
    return () => {
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
        // Ensure positive result
        num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        num2 = Math.floor(Math.random() * num1) + minNumber;
        if (num2 > num1) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case '*':
        // Use smaller numbers for multiplication
        const maxMult = Math.min(maxNumber, settings.maxMultiplier || 12);
        num1 = Math.floor(Math.random() * maxMult) + 1;
        num2 = Math.floor(Math.random() * maxMult) + 1;
        answer = num1 * num2;
        break;
      case '/':
        // Ensure clean division
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
    
    // Focus input after a short delay
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (gameState !== 'playing' || !currentProblem || userAnswer === '') return;
    
    const numericAnswer = parseInt(userAnswer, 10);
    const isCorrect = numericAnswer === currentProblem.answer;
    
    setProblemsAnswered(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
      setFeedback({ type: 'correct' });
    } else {
      setErrors(prev => prev + 1);
      setStreak(0);
      setFeedback({ type: 'wrong', correctAnswer: currentProblem.answer });
    }
    
    // Show feedback briefly, then next problem
    const feedbackDuration = isCorrect ? 300 : 800;
    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      setCurrentProblem(generateProblem());
      // Use requestAnimationFrame to ensure DOM is updated before focusing
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, feedbackDuration);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const endGame = async () => {
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
        <CardContent className="py-16 text-center">
          <div className="text-7xl mb-6">🧮</div>
          <h3 className="text-2xl font-bold mb-4">Математические задачи</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Решайте примеры как можно быстрее! Правильные ответы увеличивают серию побед.
          </p>
          <div className="flex justify-center gap-4 mb-8 text-sm text-gray-500">
            <span>⏱️ Время: {settings.duration}с</span>
            <span>🔢 Операции: {settings.operations.map(op => operatorSymbols[op]).join(' ')}</span>
          </div>
          <Button 
            onClick={startGame} 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg"
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
              <CardTitle className="text-2xl mb-2">Математические задачи</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Верно</div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Ошибки</div>
                <div className="text-2xl font-bold text-red-600">{errors}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Серия</div>
                <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
                  {streak > 0 && <Zap className="w-4 h-4" />}
                  {streak}
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
        <CardContent>
          {/* Problem Display */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-6 shadow-2xl">
            {currentProblem && (
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold text-white mb-6 font-mono tracking-wider">
                  {currentProblem.num1} {operatorSymbols[currentProblem.operation]} {currentProblem.num2} = ?
                </div>
                
                <form onSubmit={handleSubmit} className="flex items-center justify-center gap-4">
                  <Input
                    ref={inputRef}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-32 h-16 text-3xl text-center font-bold bg-white border-4 border-slate-300 focus:border-emerald-500 rounded-xl"
                    placeholder="?"
                    autoComplete="off"
                    disabled={feedback !== null}
                  />
                  <Button 
                    type="submit" 
                    className="h-16 px-8 bg-emerald-500 hover:bg-emerald-600 text-xl"
                    disabled={userAnswer === '' || feedback !== null}
                  >
                    ✓
                  </Button>
                </form>
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
                      <Check className="w-20 h-20 mb-2" />
                      <span className="text-3xl font-bold">Верно!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <X className="w-20 h-20 mb-2" />
                      <span className="text-3xl font-bold">Неверно</span>
                      <span className="text-xl mt-2">Правильный ответ: {feedback.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
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
          
          <div className="text-center text-sm text-gray-600">
            💡 Используйте клавишу Enter для быстрой отправки ответа
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
              Результаты игры "Математические задачи"
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Правильных ответов</div>
              <div className="text-5xl font-bold text-emerald-600">{score}</div>
              <div className="text-sm text-gray-600 mt-2">
                Точность: {problemsAnswered > 0 ? Math.round((score / problemsAnswered) * 100) : 0}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Всего</div>
                <div className="text-xl font-bold text-blue-600">{problemsAnswered}</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Ошибки</div>
                <div className="text-xl font-bold text-red-600">{errors}</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Макс. серия</div>
                <div className="text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  {maxStreak}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
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

export default MathGame;
