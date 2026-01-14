import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Timer, Target } from 'lucide-react';
import ReactionGame from '@/components/ReactionGame';

const difficultyLevels = [
  {
    id: 'easy',
    name: 'Легко',
    description: 'Задержка 1-3 сек, большая цель',
    icon: Target,
    color: 'from-green-500 to-emerald-600',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    settings: {
      delayRange: [1000, 3000],
      targetSize: 100,
      randomPosition: false,
      rounds: 5,
    },
  },
  {
    id: 'medium',
    name: 'Средне',
    description: 'Задержка 0.5-2 сек, средняя цель в разных местах',
    icon: Timer,
    color: 'from-yellow-500 to-orange-600',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    settings: {
      delayRange: [500, 2000],
      targetSize: 70,
      randomPosition: true,
      rounds: 5,
    },
  },
  {
    id: 'hard',
    name: 'Сложно',
    description: 'Задержка 0.3-1.5 сек, маленькая цель, ложные старты',
    icon: Zap,
    color: 'from-red-500 to-pink-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    settings: {
      delayRange: [300, 1500],
      targetSize: 50,
      randomPosition: true,
      rounds: 5,
      fakeStarts: true,
    },
  },
];

const ReactionPage = () => {
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
          <Button
            variant="ghost"
            onClick={handleBackToDifficulty}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к выбору сложности
          </Button>
          
          <ReactionGame 
            difficulty={selectedDifficulty}
            settings={diffConfig.settings}
            onBack={handleBackToDifficulty}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к упражнениям
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 mb-4">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Скорость реакции
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Проверьте свою скорость реакции! Кликайте на цель как можно быстрее
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {difficultyLevels.map((level) => {
            const Icon = level.icon;
            return (
              <Card
                key={level.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-yellow-300"
                onClick={() => handleSelectDifficulty(level.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className={`${level.badgeColor} border`}>
                      {level.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{level.name}</CardTitle>
                  <CardDescription className="text-base">
                    {level.description}
                  </CardDescription>
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

        {/* How to Play */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Как играть?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Выберите сложность</h4>
                    <p className="text-sm text-gray-600">
                      Чем выше сложность, тем быстрее нужно реагировать
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Ждите зелёный круг</h4>
                    <p className="text-sm text-gray-600">
                      Экран станет красным - ждите появления зелёной цели
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Кликайте быстро!</h4>
                    <p className="text-sm text-gray-600">
                      Как только появится зелёный круг - кликайте на него максимально быстро
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">5 раундов</h4>
                    <p className="text-sm text-gray-600">
                      Пройдите 5 раундов и узнайте свою среднюю скорость реакции
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">⚠️ Важно:</span> Не кликайте раньше времени! 
                Если кликнете на красный экран до появления цели - попытка не засчитается.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReactionPage;
