import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users, Clock } from 'lucide-react';

const Competitions = () => {
  // Mock data for upcoming feature
  const upcomingCompetition = {
    name: "Еженедельный чемпионат: Таблицы Шульте",
    description: "Соревнуйтесь с другими игроками в решении таблиц Шульте 5×5",
    startDate: "Понедельник, 20 января",
    endDate: "Воскресенье, 26 января",
    participants: 0,
    prize: "Значок 'Мастер Шульте'"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Соревнования 🏆
          </h1>
          <p className="text-lg text-gray-600">
            Участвуйте в еженедельных турнирах и выигрывайте призы
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Скоро доступно!</CardTitle>
              <Badge className="bg-purple-600 text-white">В разработке</Badge>
            </div>
            <CardDescription className="text-base mt-2">
              Мы работаем над системой соревнований. Скоро вы сможете участвовать в еженедельных турнирах!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Preview of upcoming feature */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Competition Preview */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>{upcomingCompetition.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {upcomingCompetition.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-gray-600">Начало</p>
                    <p className="font-medium">{upcomingCompetition.startDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-gray-600">Окончание</p>
                    <p className="font-medium">{upcomingCompetition.endDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{upcomingCompetition.participants} участников</span>
                </div>
                <div className="text-sm font-medium text-purple-600">
                  🏆 {upcomingCompetition.prize}
                </div>
              </div>

              <Button disabled className="w-full">
                Присоединиться (скоро)
              </Button>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Как это работает?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Регистрация</h4>
                    <p className="text-sm text-gray-600">
                      Зарегистрируйтесь на соревнование до его начала
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Играйте</h4>
                    <p className="text-sm text-gray-600">
                      Выполняйте упражнения в течение недели. Засчитывается лучший результат
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Получите приз</h4>
                    <p className="text-sm text-gray-600">
                      Топ-3 игрока получают специальные значки и награды
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  💡 <span className="font-medium">Совет:</span> Тренируйтесь заранее, чтобы улучшить свои навыки перед соревнованием!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features list */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Планируемые возможности</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Еженедельные турниры по разным упражнениям',
                'Таблица результатов в реальном времени',
                'Система призов и достижений',
                'История участия в соревнованиях',
                'Специальные тематические чемпионаты',
                'Командные соревнования',
              ].map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Competitions;
