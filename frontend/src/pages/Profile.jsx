import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Target,
  Grid3x3,
  Award
} from 'lucide-react';

const ProfileStat = ({ icon: Icon, label, value, color, isTelegram, themeParams }) => {
  const hintStyle = isTelegram ? { color: themeParams?.hint_color } : {};
  const textStyle = isTelegram ? { color: themeParams?.text_color } : {};

  return (
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: color }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm" style={hintStyle}>{label}</p>
        <p className="text-xl font-bold" style={textStyle}>{value}</p>
      </div>
    </div>
  );
};

const ExerciseProgress = ({ exercise, progress, isTelegram, themeParams }) => {
  const levelProgress = ((progress.total_games % 10) / 10) * 100;
  const cardStyle = isTelegram ? { backgroundColor: themeParams?.secondary_bg_color || themeParams?.bg_color } : {};
  const textStyle = isTelegram ? { color: themeParams?.text_color } : {};
  const hintStyle = isTelegram ? { color: themeParams?.hint_color } : {};

  return (
    <Card style={cardStyle}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold" style={textStyle}>{exercise.name}</h4>
            <p className="text-sm" style={hintStyle}>Уровень {progress.level}</p>
          </div>
          <Badge 
            className="text-white"
            style={{ background: `linear-gradient(to right, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})` }}
          >
            {progress.total_games} игр
          </Badge>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1" style={hintStyle}>
            <span>Прогресс до уровня {progress.level + 1}</span>
            <span>{progress.total_games % 10}/10 игр</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: isTelegram ? themeParams?.hint_color + '40' : '#e5e7eb' }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${levelProgress}%`,
                background: `linear-gradient(to right, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p style={hintStyle}>Лучший результат</p>
            <p className="font-bold" style={{ color: themeParams?.accent_text_color || '#9333ea' }}>
              {progress.best_score ? `${progress.best_score.toFixed(2)}с` : '--'}
            </p>
          </div>
          <div>
            <p style={hintStyle}>Средний результат</p>
            <p className="font-bold" style={{ color: themeParams?.link_color || '#3b82f6' }}>
              {progress.average_score ? `${progress.average_score.toFixed(2)}с` : '--'}
            </p>
          </div>
        </div>

        {progress.last_played && (
          <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: isTelegram ? themeParams?.hint_color + '40' : undefined, color: themeParams?.hint_color || '#6b7280' }}>
            Последняя игра: {new Date(progress.last_played).toLocaleDateString('ru-RU')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const { user, isTelegram } = useAuth();
  const { themeParams } = useTelegram();
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

  const bgStyle = isTelegram ? { backgroundColor: themeParams?.bg_color } : {};
  const cardStyle = isTelegram ? { backgroundColor: themeParams?.secondary_bg_color || themeParams?.bg_color } : {};
  const textStyle = isTelegram ? { color: themeParams?.text_color } : {};
  const hintStyle = isTelegram ? { color: themeParams?.hint_color } : {};

  if (loading) {
    return (
      <div className={`min-h-screen ${!isTelegram ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50' : ''}`} style={bgStyle}>
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

  const totalGames = stats?.total_games || 0;
  const totalExercises = stats?.progress?.length || 0;
  const averageLevel = stats?.progress?.length
    ? Math.round(stats.progress.reduce((sum, p) => sum + p.level, 0) / stats.progress.length)
    : 1;
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '--';

  return (
    <div className={`min-h-screen ${!isTelegram ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50' : ''}`} style={bgStyle}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Header */}
        <Card className="mb-4 sm:mb-8" style={cardStyle}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback 
                  className="text-white text-2xl sm:text-3xl"
                  style={{ background: `linear-gradient(135deg, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})` }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={textStyle}>{user?.name}</h1>
                <p className="mb-4" style={hintStyle}>
                  {user?.telegram_username ? `@${user.telegram_username}` : user?.email}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge 
                    className="text-white"
                    style={{ background: `linear-gradient(to right, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})` }}
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    Уровень {averageLevel}
                  </Badge>
                  <Badge variant="outline" style={isTelegram ? { borderColor: themeParams?.hint_color, color: themeParams?.text_color } : undefined}>
                    <Calendar className="w-3 h-3 mr-1" />
                    С {joinDate}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card style={cardStyle}>
            <CardContent className="pt-4 sm:pt-6">
              <ProfileStat
                icon={Target}
                label="Всего игр"
                value={totalGames}
                color={themeParams?.button_color || '#9333ea'}
                isTelegram={isTelegram}
                themeParams={themeParams}
              />
            </CardContent>
          </Card>
          
          <Card style={cardStyle}>
            <CardContent className="pt-4 sm:pt-6">
              <ProfileStat
                icon={Grid3x3}
                label="Упражнений"
                value={totalExercises}
                color={themeParams?.link_color || '#3b82f6'}
                isTelegram={isTelegram}
                themeParams={themeParams}
              />
            </CardContent>
          </Card>
          
          <Card style={cardStyle}>
            <CardContent className="pt-4 sm:pt-6">
              <ProfileStat
                icon={TrendingUp}
                label="Ср. уровень"
                value={averageLevel}
                color="#ec4899"
                isTelegram={isTelegram}
                themeParams={themeParams}
              />
            </CardContent>
          </Card>
          
          <Card style={cardStyle}>
            <CardContent className="pt-4 sm:pt-6">
              <ProfileStat
                icon={Award}
                label="Достижений"
                value="Скоро"
                color="#eab308"
                isTelegram={isTelegram}
                themeParams={themeParams}
              />
            </CardContent>
          </Card>
        </div>

        {/* Exercise Progress */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={textStyle}>Прогресс по упражнениям</h2>
          
          {stats?.progress && stats.progress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stats.progress.map((progress) => {
                const exercise = exercises.find(e => e.exercise_id === progress.exercise_id);
                if (!exercise) return null;
                
                return (
                  <ExerciseProgress
                    key={progress.exercise_id}
                    exercise={exercise}
                    progress={progress}
                    isTelegram={isTelegram}
                    themeParams={themeParams}
                  />
                );
              })}
            </div>
          ) : (
            <Card style={cardStyle}>
              <CardContent className="py-12 text-center">
                <Grid3x3 className="w-16 h-16 mx-auto mb-4" style={{ color: themeParams?.hint_color || '#d1d5db' }} />
                <p className="mb-2" style={textStyle}>Вы ещё не играли</p>
                <p className="text-sm" style={hintStyle}>
                  Начните с любого упражнения
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Achievements Section */}
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between" style={textStyle}>
              <span>Достижения</span>
              <Badge style={{ backgroundColor: themeParams?.button_color || '#9333ea' }} className="text-white">Скоро</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: themeParams?.hint_color || '#d1d5db' }} />
              <p className="mb-2" style={textStyle}>Система достижений в разработке</p>
              <p className="text-sm" style={hintStyle}>
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
