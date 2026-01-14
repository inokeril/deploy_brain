import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Keyboard, Zap, Rocket } from 'lucide-react';
import TypingGame from '@/components/TypingGame';

const difficultyLevels = [
  {
    id: 'easy',
    name: 'Легко',
    description: 'Короткие простые предложения, 30 секунд',
    icon: Keyboard,
    color: 'from-green-500 to-emerald-600',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    settings: {
      texts: [
        'Быстрая коричневая лиса перепрыгнула через ленивую собаку.',
        'Программирование - это искусство решения проблем.',
        'Каждый день приносит новые возможности для роста.',
        'Практика делает мастера в любом деле.',
        'Знание - это сила, которая меняет мир.',
      ],
      duration: 30,
    },
  },
  {
    id: 'medium',
    name: 'Средне',
    description: 'Средние тексты, 45 секунд',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    settings: {
      texts: [
        'Тренировка скорости печати помогает не только быстрее работать за компьютером, но и развивает моторную память пальцев.',
        'Современные технологии позволяют нам общаться с людьми по всему миру за считанные секунды.',
        'Чтение книг расширяет кругозор и помогает развивать воображение и критическое мышление.',
        'Регулярные упражнения для мозга помогают сохранить ясность ума и улучшить концентрацию внимания.',
      ],
      duration: 45,
    },
  },
  {
    id: 'hard',
    name: 'Сложно',
    description: 'Длинные тексты с английскими словами, 60 секунд',
    icon: Rocket,
    color: 'from-red-500 to-pink-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    settings: {
      texts: [
        'The quick brown fox jumps over the lazy dog. Быстрая коричневая лиса перепрыгивает через ленивую собаку. This sentence contains every letter of the English alphabet.',
        'Programming languages like Python, JavaScript, and TypeScript have revolutionized software development. Языки программирования изменили мир технологий.',
        'Machine learning and artificial intelligence are transforming industries worldwide. Машинное обучение и искусственный интеллект меняют индустрии по всему миру.',
      ],
      duration: 60,
    },
  },
];

const TypingPage = () => {
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
          <TypingGame difficulty={selectedDifficulty} settings={diffConfig.settings} onBack={handleBackToDifficulty} />
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4">
            <Keyboard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Скорость печати</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Проверьте и улучшите свою скорость набора текста. Измеряется WPM (слов в минуту) и точность!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {difficultyLevels.map((level) => {
            const Icon = level.icon;
            return (
              <Card
                key={level.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-indigo-300"
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
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold mb-2 text-indigo-900">⌨️ Правила набора</h4>
                <p className="text-sm text-gray-700">
                  Печатайте текст точно как показано. Зелёным подсвечиваются правильные символы, красным - ошибки. Старайтесь не делать ошибок!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Читайте текст</h4>
                    <p className="text-sm text-gray-600">Внимательно смотрите на текст выше</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Печатайте быстро</h4>
                    <p className="text-sm text-gray-600">Набирайте символы в поле ввода</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Проверьте результат</h4>
                    <p className="text-sm text-gray-600">Узнайте свой WPM и точность</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">💡 WPM (Words Per Minute)</span> - количество слов в минуту. 
                  Хороший результат: 40-60 WPM. Отличный: 60-80+ WPM.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TypingPage;