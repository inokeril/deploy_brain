import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Keyboard, Zap, Rocket, Sparkles } from 'lucide-react';
import TypingGame from '@/components/TypingGame';

const difficultyLevels = [
  {
    id: 'easy',
    name: 'Легко',
    description: 'Простые предложения на русском, 60 секунд',
    icon: Keyboard,
    color: 'from-green-500 to-emerald-600',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    settings: {
      duration: 60,
      wordCount: 25,
      fallbackTexts: [
        'Солнце светит ярко над горизонтом. Птицы поют весёлые песни. Деревья качаются на ветру. Сегодня прекрасный день для прогулки.',
        'Кошка спит на мягком диване. Она видит интересные сны. За окном падает снег. Зима пришла в наш город.',
      ],
    },
  },
  {
    id: 'medium',
    name: 'Средне',
    description: 'Познавательные тексты, цифры, 90 секунд',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    settings: {
      duration: 90,
      wordCount: 40,
      fallbackTexts: [
        'Программирование - это искусство создания программ. Разработчики пишут код на разных языках: Python, JavaScript, C++. Каждый язык имеет свои особенности и применения.',
        'Человеческий мозг содержит около 86 миллиардов нейронов. Эти клетки образуют сложную сеть связей. Мозг потребляет около 20% всей энергии организма.',
      ],
    },
  },
  {
    id: 'hard',
    name: 'Сложно',
    description: 'Технические тексты с английскими терминами, 120 секунд',
    icon: Rocket,
    color: 'from-red-500 to-pink-600',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    settings: {
      duration: 120,
      wordCount: 50,
      fallbackTexts: [
        'Machine Learning и Deep Learning революционизировали IT-индустрию. Python frameworks такие как TensorFlow и PyTorch используются для создания neural networks. DevOps практики включают CI/CD pipelines.',
        'RESTful API архитектура использует HTTP методы: GET, POST, PUT, DELETE. Frontend frameworks (React, Vue.js, Angular) взаимодействуют с backend через JSON. WebSocket обеспечивает real-time communication.',
      ],
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="outline" onClick={handleBackToDifficulty} className="mb-4 bg-white/90 hover:bg-white shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к выбору сложности
          </Button>
          <TypingGame difficulty={selectedDifficulty} settings={diffConfig.settings} onBack={handleBackToDifficulty} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к упражнениям
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-lg">
            <Keyboard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Скорость печати</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Проверьте и улучшите свою скорость набора текста!
          </p>
          <div className="inline-flex items-center gap-2 text-indigo-600 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Тексты генерируются с помощью AI</span>
          </div>
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
                    <span>📝 ~{level.settings.wordCount} слов</span>
                    <span>⏱️ {level.settings.duration}с</span>
                  </div>
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
            <CardTitle className="flex items-center gap-2">
              <span>🎮</span> Как играть?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold mb-2 text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-генерация текста
                </h4>
                <p className="text-sm text-gray-700">
                  После нажатия "Начать" у вас будет 10 секунд на подготовку. За это время AI сгенерирует уникальный текст специально для вас!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 text-xl">
                    ⏱️
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">10 секунд</h4>
                    <p className="text-sm text-gray-600">Время на подготовку и генерацию текста</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-xl">
                    ⌨️
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Печатайте</h4>
                    <p className="text-sm text-gray-600">Повторяйте текст максимально точно</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-xl">
                    📊
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Результат</h4>
                    <p className="text-sm text-gray-600">Узнайте свой WPM и точность</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">💡 WPM (Words Per Minute)</span> - количество слов в минуту. 
                  Средний результат: 30-40 WPM. Хороший: 50-60 WPM. Отличный: 70+ WPM.
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
