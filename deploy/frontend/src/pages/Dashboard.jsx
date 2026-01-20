import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { useTelegram } from '@/contexts/TelegramContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Grid3x3, 
  ListOrdered, 
  ScanSearch, 
  Zap, 
  Calculator,
  Clock,
  Trophy,
  TrendingUp,
  Palette,
  Type,
  Target,
  Keyboard,
  Brain
} from 'lucide-react';

const iconMap = {
  'grid-3x3': Grid3x3,
  'list-ordered': ListOrdered,
  'scan-search': ScanSearch,
  'zap': Zap,
  'calculator': Calculator,
  'palette': Palette,
  'type': Type,
  'target': Target,
  'keyboard': Keyboard,
  'brain': Brain,
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

const difficultyLabels = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

const ExerciseCard = ({ exercise, onPlay, isTelegram, themeParams, hapticImpact }) => {
  const Icon = iconMap[exercise.icon] || Grid3x3;
  const isAvailable = ['schulte', 'spot-difference', 'stroop', 'catch-letter', 'whack-mole', 'sequence', 'math', 'typing'].includes(exercise.exercise_id);

  const handleClick = () => {
    if (isTelegram && hapticImpact) {
      hapticImpact('light');
    }
    onPlay(exercise.exercise_id);
  };

  const cardStyle = isTelegram ? {
    backgroundColor: themeParams?.secondary_bg_color || themeParams?.bg_color,
  } : {};

  const textStyle = isTelegram ? {
    color: themeParams?.text_color,
  } : {};

  const hintStyle = isTelegram ? {
    color: themeParams?.hint_color,
  } : {};

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-300 ${!isAvailable ? 'opacity-60' : ''}`}
      style={cardStyle}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isAvailable 
              ? '' 
              : 'bg-gray-300'
          } transition-transform group-hover:scale-110`}
          style={isAvailable ? {
            background: isTelegram 
              ? `linear-gradient(135deg, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`
              : 'linear-gradient(135deg, #9333ea, #3b82f6)'
          } : undefined}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge className={`${difficultyColors[exercise.difficulty]} border`}>
            {difficultyLabels[exercise.difficulty]}
          </Badge>
        </div>
        <CardTitle className="text-xl" style={textStyle}>{exercise.name}</CardTitle>
        <CardDescription className="text-sm" style={hintStyle}>
          {exercise.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAvailable ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm" style={hintStyle}>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Лучшее: --</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Уровень: 1</span>
              </div>
            </div>
            <Button 
              onClick={handleClick}
              className="w-full"
              style={{
                background: isTelegram 
                  ? `linear-gradient(to right, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`
                  : 'linear-gradient(to right, #9333ea, #3b82f6)',
                color: themeParams?.button_text_color || '#ffffff'
              }}
            >
              Играть
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm py-2" style={hintStyle}>
              <span>Скоро доступно</span>
            </div>
            <Button disabled className="w-full">
              Недоступно
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isTelegram } = useAuth();
  const { themeParams, colorScheme, hapticImpact } = useTelegram();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchExercises();
    fetchStats();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/exercises`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile/stats`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handlePlayExercise = (exerciseId) => {
    const routes = {
      'schulte': '/exercise/schulte',
      'spot-difference': '/exercise/spot-difference',
      'stroop': '/exercise/stroop',
      'catch-letter': '/exercise/catch-letter',
      'whack-mole': '/exercise/whack-mole',
      'sequence': '/exercise/sequence',
      'math': '/exercise/math',
      'typing': '/exercise/typing',
    };
    
    if (routes[exerciseId]) {
      navigate(routes[exerciseId]);
    } else {
      alert('Это упражнение скоро будет доступно!');
    }
  };

  // Styles for Telegram
  const bgStyle = isTelegram ? {
    backgroundColor: themeParams?.bg_color,
  } : {};

  const textStyle = isTelegram ? {
    color: themeParams?.text_color,
  } : {};

  const hintStyle = isTelegram ? {
    color: themeParams?.hint_color,
  } : {};

  const cardStyle = isTelegram ? {
    backgroundColor: themeParams?.secondary_bg_color || themeParams?.bg_color,
  } : {};

  if (loading) {
    return (
      <div className={`min-h-screen ${!isTelegram ? 'bg-gray-50' : ''}`} style={bgStyle}>
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
            style={{ borderColor: themeParams?.button_color || '#9333ea' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${!isTelegram ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50' : ''}`}
      style={bgStyle}
    >
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={textStyle}>
            {isTelegram && user ? `Привет, ${user.name?.split(' ')[0]}! 👋` : 'Добро пожаловать! 👋'}
          </h1>
          <p className="text-base sm:text-lg" style={hintStyle}>
            Выберите упражнение и начните тренировку
          </p>
        </div>

        {/* Stats Cards */}
        {stats && stats.total_games > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <Card style={cardStyle}>
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm" style={hintStyle}>Всего игр</p>
                    <p 
                      className="text-xl sm:text-3xl font-bold"
                      style={{ color: themeParams?.accent_text_color || '#9333ea' }}
                    >
                      {stats.total_games}
                    </p>
                  </div>
                  <TrendingUp 
                    className="hidden sm:block w-8 h-8" 
                    style={{ color: themeParams?.accent_text_color || '#9333ea' }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card style={cardStyle}>
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm" style={hintStyle}>Упражнений</p>
                    <p 
                      className="text-xl sm:text-3xl font-bold"
                      style={{ color: themeParams?.link_color || '#3b82f6' }}
                    >
                      {stats.progress?.length || 0}
                    </p>
                  </div>
                  <Grid3x3 
                    className="hidden sm:block w-8 h-8"
                    style={{ color: themeParams?.link_color || '#3b82f6' }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card style={cardStyle}>
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm" style={hintStyle}>Уровень</p>
                    <p 
                      className="text-xl sm:text-3xl font-bold"
                      style={{ color: '#ec4899' }}
                    >
                      {stats.progress?.length 
                        ? Math.round(stats.progress.reduce((sum, p) => sum + p.level, 0) / stats.progress.length)
                        : 1
                      }
                    </p>
                  </div>
                  <Trophy 
                    className="hidden sm:block w-8 h-8"
                    style={{ color: '#ec4899' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exercises Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={textStyle}>
            Доступные упражнения
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exercise_id}
                exercise={exercise}
                onPlay={handlePlayExercise}
                isTelegram={isTelegram}
                themeParams={themeParams}
                hapticImpact={hapticImpact}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card 
          className="mt-6 sm:mt-8 border-0"
          style={{
            background: isTelegram 
              ? `linear-gradient(to right, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`
              : 'linear-gradient(to right, #9333ea, #3b82f6)'
          }}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between text-white">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Тренируйтесь каждый день!</h3>
                <p className="text-sm sm:text-base opacity-90">
                  Регулярные тренировки улучшают внимание и скорость мышления
                </p>
              </div>
              <Button 
                onClick={() => {
                  if (isTelegram) hapticImpact('light');
                  navigate('/competitions');
                }}
                className="bg-white hover:bg-gray-100"
                style={{ color: themeParams?.button_color || '#9333ea' }}
              >
                Соревнования
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
