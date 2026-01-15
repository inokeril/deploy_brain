import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
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

const ExerciseCard = ({ exercise, onPlay }) => {
  const Icon = iconMap[exercise.icon] || Grid3x3;
  const isAvailable = ['schulte', 'spot-difference', 'stroop', 'catch-letter', 'whack-mole', 'sequence', 'math'].includes(exercise.exercise_id);

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${!isAvailable ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isAvailable 
              ? 'bg-gradient-to-br from-purple-500 to-blue-500 group-hover:scale-110' 
              : 'bg-gray-300'
          } transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge className={`${difficultyColors[exercise.difficulty]} border`}>
            {difficultyLabels[exercise.difficulty]}
          </Badge>
        </div>
        <CardTitle className="text-xl">{exercise.name}</CardTitle>
        <CardDescription className="text-sm">
          {exercise.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAvailable ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
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
              onClick={() => onPlay(exercise.exercise_id)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Играть
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-gray-500 py-2">
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
    if (exerciseId === 'schulte') {
      navigate('/exercise/schulte');
    } else if (exerciseId === 'spot-difference') {
      navigate('/exercise/spot-difference');
    } else if (exerciseId === 'stroop') {
      navigate('/exercise/stroop');
    } else if (exerciseId === 'catch-letter') {
      navigate('/exercise/catch-letter');
    } else if (exerciseId === 'whack-mole') {
      navigate('/exercise/whack-mole');
    } else if (exerciseId === 'sequence') {
      navigate('/exercise/sequence');
    } else {
      // TODO: Navigate to other exercises when they're ready
      alert('Это упражнение скоро будет доступно!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Добро пожаловать! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Выберите упражнение и начните тренировку
          </p>
        </div>

        {/* Stats Cards */}
        {stats && stats.total_games > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Всего игр</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.total_games}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Упражнений</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.progress?.length || 0}</p>
                  </div>
                  <Grid3x3 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Средний уровень</p>
                    <p className="text-3xl font-bold text-pink-600">
                      {stats.progress?.length 
                        ? Math.round(stats.progress.reduce((sum, p) => sum + p.level, 0) / stats.progress.length)
                        : 1
                      }
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exercises Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Доступные упражнения</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exercise_id}
                exercise={exercise}
                onPlay={handlePlayExercise}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 to-blue-500 border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between text-white">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">Тренируйтесь каждый день!</h3>
                <p className="text-purple-100">
                  Регулярные тренировки улучшают внимание и скорость мышления
                </p>
              </div>
              <Button 
                onClick={() => navigate('/competitions')}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                Участвовать в соревнованиях
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
