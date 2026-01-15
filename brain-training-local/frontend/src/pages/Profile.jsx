import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Target,
  Grid3x3,
  Clock,
  Award
} from 'lucide-react';

const ProfileStat = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ExerciseProgress = ({ exercise, progress }) => {
  const levelProgress = ((progress.total_games % 10) / 10) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
            <p className="text-sm text-gray-600">Уровень {progress.level}</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            {progress.total_games} игр
          </Badge>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Прогресс до уровня {progress.level + 1}</span>
            <span>{progress.total_games % 10}/10 игр</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Лучший результат</p>
            <p className="font-bold text-purple-600">
              {progress.best_score ? `${progress.best_score.toFixed(2)}с` : '--'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Средний результат</p>
            <p className="font-bold text-blue-600">
              {progress.average_score ? `${progress.average_score.toFixed(2)}с` : '--'}
            </p>
          </div>
        </div>

        {progress.last_played && (
          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            Последняя игра: {new Date(progress.last_played).toLocaleDateString('ru-RU')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, exercisesResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile/stats`, {
          credentials: 'include',
        }),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/exercises`, {
          credentials: 'include',
        }),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (exercisesResponse.ok) {
        const exercisesData = await exercisesResponse.json();
        setExercises(exercisesData);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const totalGames = stats?.total_games || 0;
  const totalExercises = stats?.progress?.length || 0;
  const averageLevel = stats?.progress?.length
    ? Math.round(stats.progress.reduce((sum, p) => sum + p.level, 0) / stats.progress.length)
    : 1;
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '--';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-3xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name}</h1>
                <p className="text-gray-600 mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <Trophy className="w-3 h-3 mr-1" />
                    Уровень {averageLevel}
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    С {joinDate}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <ProfileStat
                icon={Target}
                label="Всего игр"
                value={totalGames}
                color="bg-purple-500"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <ProfileStat
                icon={Grid3x3}
                label="Упражнений освоено"
                value={totalExercises}
                color="bg-blue-500"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <ProfileStat
                icon={TrendingUp}
                label="Средний уровень"
                value={averageLevel}
                color="bg-pink-500"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <ProfileStat
                icon={Award}
                label="Достижений"
                value="Скоро"
                color="bg-yellow-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Exercise Progress */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Прогресс по упражнениям</h2>
          
          {stats?.progress && stats.progress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.progress.map((progress) => {
                const exercise = exercises.find(e => e.exercise_id === progress.exercise_id);
                if (!exercise) return null;
                
                return (
                  <ExerciseProgress
                    key={progress.exercise_id}
                    exercise={exercise}
                    progress={progress}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Grid3x3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Вы ещё не играли</p>
                <p className="text-sm text-gray-500">
                  Начните с упражнения "Таблицы Шульте"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Achievements Section (Coming Soon) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Достижения</span>
              <Badge className="bg-purple-600 text-white">Скоро</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Система достижений в разработке</p>
              <p className="text-sm text-gray-500">
                Скоро вы сможете получать награды за выполнение различных задач!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
