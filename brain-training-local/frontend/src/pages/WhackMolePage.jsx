import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Leaf, Zap, Flame } from 'lucide-react';
import WhackMoleGame from '@/components/WhackMoleGame';

const difficultyLevels = [
  {
    id: 'easy',
    name: 'Легко',
    description: 'Поле 2×2, 1 крот, медленное появление',
    icon: Leaf,
    color: 'from-green-500 to-emerald-600',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    settings: {
      gridSize: 2,
      maxMoles: 1,
      moleVisibleTime: 2500,
      spawnInterval: 2000,
      duration: 30,
    },
  },
  {
    id: 'medium',
    name: 'Средне',
    description: 'Поле 3×3, до 2 кротов, средняя скорость',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    settings: {
      gridSize: 3,
      maxMoles: 2,
      moleVisibleTime: 1800,
      spawnInterval: 1400,
      duration: 45,
    },
  },
  {
    id: 'hard',
    name: 'Сложно',
    description: 'Поле 4×4, до 3 кротов, быстрое появление',
    icon: Flame,
    color: 'from-red-500 to-pink-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    settings: {
      gridSize: 4,
      maxMoles: 3,
      moleVisibleTime: 1200,
      spawnInterval: 900,
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
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-amber-50">
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-amber-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к упражнениям
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mb-4 shadow-lg">
            <span className="text-4xl">🦔</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Поймай крота</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Кроты выглядывают из норок! Кликайте по ним, пока они не спрятались обратно!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {difficultyLevels.map((level) => {
            const Icon = level.icon;
            const gridDesc = `${level.settings.gridSize}×${level.settings.gridSize}`;
            return (
              <Card
                key={level.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-amber-300"
                onClick={() => handleSelectDifficulty(level.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className={`${level.badgeColor} border`}>{level.name}</Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{level.name}</CardTitle>
                  <CardDescription className="text-base">{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>🕳️ Поле {gridDesc}</span>
                    <span>⏱️ {level.settings.duration}с</span>
                  </div>
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
            <CardTitle className="flex items-center gap-2">
              <span>🎮</span> Как играть?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold mb-2 text-amber-900">🦔 Цель игры</h4>
                <p className="text-sm text-gray-700">
                  Кроты выглядывают из норок на короткое время. Успейте кликнуть по ним мышкой, пока они не спрятались!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-xl">
                    👀
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Следите за норками</h4>
                    <p className="text-sm text-gray-600">Кроты появляются в случайных норках</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-xl">
                    🖱️
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Кликайте быстро</h4>
                    <p className="text-sm text-gray-600">Кроты прячутся через пару секунд</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-xl">
                    🏆
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Набирайте очки</h4>
                    <p className="text-sm text-gray-600">Каждый пойманный крот = +1 очко</p>
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
