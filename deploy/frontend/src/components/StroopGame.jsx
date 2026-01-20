import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const COLOR_MAP = {
  'красный': '#ef4444',
  'синий': '#3b82f6',
  'зелёный': '#10b981',
  'жёлтый': '#eab308',
  'фиолетовый': '#a855f7',
  'оранжевый': '#f97316',
  'розовый': '#ec4899',
  'коричневый': '#92400e'
};

const StroopGame = ({ difficulty, settings, onBack }) => {
  const [gameState, setGameState] = useState('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const questionStartTimeRef = useRef(null);
  const [questionTimes, setQuestionTimes] = useState([]);

  const difficultyNames = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateQuestions = () => {
    const qs = [];
    const colors = settings.colors;
    
    for (let i = 0; i < settings.questions; i++) {
      const word = colors[Math.floor(Math.random() * colors.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      qs.push({ word, color, correctAnswer: color });
    }
    
    return qs;
  };

  const startGame = () => {
    const qs = generateQuestions();
    setQuestions(qs);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(settings.timeLimit);
    setQuestionTimes([]);
    setGameState('playing');
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
    
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

  const handleAnswer = (selectedColor) => {
    const question = questions[currentQuestion];
    const isCorrect = selectedColor === question.correctAnswer;
    const questionTime = (Date.now() - questionStartTimeRef.current) / 1000;
    
    setQuestionTimes(prev => [...prev, questionTime]);
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestion + 1 >= settings.questions) {
        endGame();
      } else {
        setCurrentQuestion(currentQuestion + 1);
        questionStartTimeRef.current = Date.now();
      }
    }, 500);
  };

  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
    
    const avgTime = questionTimes.length > 0 
      ? questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length 
      : 0;

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stroop/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          difficulty,
          correct_answers: score,
          total_questions: settings.questions,
          average_time: avgTime,
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
        <CardContent className="py-12 sm:py-24 text-center px-4">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🎨</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Тест Струпа</h3>
          <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
            Выбирайте ЦВЕТ текста, а не значение слова. Это сложнее, чем кажется!
          </p>
          <Button onClick={startGame} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
            Начать тест
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'playing' && questions[currentQuestion]) {
    const question = questions[currentQuestion];
    
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-2xl mb-2">Тест Струпа</CardTitle>
              <Badge className="bg-pink-100 text-pink-700 text-xs">{difficultyNames[difficulty]}</Badge>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="text-center">
                <div className="text-xs text-gray-600">Вопрос</div>
                <div className="text-lg sm:text-2xl font-bold">{currentQuestion + 1}/{settings.questions}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">Счёт</div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">{score}</div>
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
        <CardContent className="px-3 sm:px-6">
          <div className="text-center py-6 sm:py-12">
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-8">Какого ЦВЕТА этот текст?</p>
            <div 
              className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 sm:mb-12 break-words px-2" 
              style={{ color: COLOR_MAP[question.color] }}
            >
              {question.word.toUpperCase()}
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-2xl mx-auto">
              {settings.colors.map(color => (
                <Button
                  key={color}
                  onClick={() => handleAnswer(color)}
                  disabled={feedback !== null}
                  className="h-12 sm:h-16 text-sm sm:text-lg font-semibold"
                  style={{ 
                    backgroundColor: COLOR_MAP[color],
                    color: 'white'
                  }}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="animate-ping">
                {feedback === 'correct' ? (
                  <CheckCircle2 className="w-16 h-16 sm:w-24 sm:h-24 text-green-500" />
                ) : (
                  <X className="w-16 h-16 sm:w-24 sm:h-24 text-red-500" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={showResults} onOpenChange={setShowResults}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center mb-2">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mx-auto mb-2" />
            Тест завершён!
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Результаты теста Струпа
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Точность</div>
            <div className="text-3xl sm:text-4xl font-bold text-pink-600">
              {Math.round((score / settings.questions) * 100)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {score} из {settings.questions} правильных
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Правильно</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{score}</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Ошибок</div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{settings.questions - score}</div>
            </div>
          </div>

          <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
            <Button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-sm sm:text-base">
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
  );
};

export default StroopGame;
