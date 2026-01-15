import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Palette, Brain, Zap } from 'lucide-react';
import StroopGame from '@/components/StroopGame';

const difficultyLevels = [
  {
    id: 'easy',
    name: 'Легко',
    description: '10 вопросов, 4 цвета, больше времени',
    icon: Palette,
    color: 'from-green-500 to-emerald-600',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    settings: {
      questions: 10,
      colors: ['красный', 'синий', 'зелёный', 'жёлтый'],
      timeLimit: 60,
    },
  },
  {
    id: 'medium',
    name: 'Средне',
    description: '15 вопросов, 6 цветов, среднее время',
    icon: Brain,
    color: 'from-yellow-500 to-orange-600',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    settings: {
      questions: 15,
      colors: ['красный', 'синий', 'зелёный', 'жёлтый', 'фиолетовый', 'оранжевый'],
      timeLimit: 45,
    },
  },
  {
    id: 'hard',
    name: 'Сложно',
    description: '20 вопросов, 8 цветов, мало времени',
    icon: Zap,
    color: 'from-red-500 to-pink-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    settings: {
      questions: 20,
      colors: ['красный', 'синий', 'зелёный', 'жёлтый', 'фиолетовый', 'оранжевый', 'розовый', 'коричневый'],
      timeLimit: 30,
    },
  },
];

const StroopPage = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleSelectDifficulty = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setGameStarted(true);
  };

  const handleBackToDifficulty = () => {
    setGameStarted(false);
    setSelectedDifficulty(null);
  };

  if (gameStarted && selectedDifficulty) {
    const diffConfig = difficultyLevels.find(d => d.id === selectedDifficulty);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="outline" onClick={handleBackToDifficulty} className="mb-4 bg-white/90 hover:bg-white shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к выбору сложности
          </Button>
          <StroopGame difficulty={selectedDifficulty} settings={diffConfig.settings} onBack={handleBackToDifficulty} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к упражнениям
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mb-4">
            <Palette className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Цветная реакция</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Тест Струпа: выберите ЦВЕТ текста, а не значение слова!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {difficultyLevels.map((level) => {
            const Icon = level.icon;
            return (
              <Card
                key={level.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-pink-300"
                onClick={() => handleSelectDifficulty(level.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className={`${level.badgeColor} border`}>{level.name}</Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{level.name}</CardTitle>
                  <CardDescription className="text-base">{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full bg-gradient-to-r ${level.color} hover:opacity-90 text-white`}>
                    Начать тест
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Как играть?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h4 className="font-semibold mb-2 text-pink-900">⚠️ Внимание!</h4>
                <p className="text-sm text-gray-700">
                  Это известный психологический тест. Ваша задача - выбрать <strong>ЦВЕТ</strong> текста,
                  а НЕ значение слова. Например, если слово "КРАСНЫЙ" написано синим цветом, нужно выбрать "синий".
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Читайте цвет</h4>
                    <p className="text-sm text-gray-600">Не значение слова, а цвет текста!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Быстрее!</h4>
                    <p className="text-sm text-gray-600">Отвечайте как можно быстрее</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Концентрация</h4>
                    <p className="text-sm text-gray-600">Не дайте словам сбить вас!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StroopPage;