import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Zap, Rocket } from 'lucide-react';
import WhackMoleGame from '@/components/WhackMoleGame';

const difficultyLevels = [
  {
    id: 'easy',
    name: 'Легко',
    description: '1 цель, медленное появление, 30 секунд',
    icon: Target,
    color: 'from-green-500 to-emerald-600',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    settings: {
      maxTargets: 1,
      targetLifetime: 2000,
      spawnInterval: 1500,
      targetSize: 80,
      duration: 30,
    },
  },
  {
    id: 'medium',
    name: 'Средне',
    description: '2-3 цели, среднее время, 45 секунд',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    settings: {
      maxTargets: 3,
      targetLifetime: 1500,
      spawnInterval: 1000,
      targetSize: 70,
      duration: 45,
    },
  },
  {
    id: 'hard',
    name: 'Сложно',
    description: '4-5 целей, быстрое появление, 60 секунд',
    icon: Rocket,
    color: 'from-red-500 to-pink-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    settings: {
      maxTargets: 5,
      targetLifetime: 1000,
      spawnInterval: 800,
      targetSize: 60,
      duration: 60,
    },
  },
];

const WhackMolePage = () => {
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
          <Button variant="ghost" onClick={handleBackToDifficulty} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к выбору сложности
          </Button>
          <WhackMoleGame difficulty={selectedDifficulty} settings={diffConfig.settings} onBack={handleBackToDifficulty} />
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mb-4">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Поймай крота</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Кликайте на появляющиеся цели как можно быстрее. Не дайте им исчезнуть!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {difficultyLevels.map((level) => {
            const Icon = level.icon;
            return (
              <Card
                key={level.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-300"
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
                    Начать игру
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
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold mb-2 text-orange-900">🎯 Цель игры</h4>
                <p className="text-sm text-gray-700">
                  Кликайте на появляющиеся круги мышкой. Чем быстрее и точнее - тем больше очков!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Следите за экраном</h4>
                    <p className="text-sm text-gray-600">Цели появляются в случайных местах</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Кликайте быстро</h4>
                    <p className="text-sm text-gray-600">Цели исчезают через пару секунд</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Набирайте очки</h4>
                    <p className="text-sm text-gray-600">Каждая пойманная цель = +1 очко</p>
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

export default WhackMolePage;