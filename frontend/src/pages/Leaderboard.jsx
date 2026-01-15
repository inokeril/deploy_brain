import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegram } from '@/contexts/TelegramContext';

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-orange-600" />;
    default:
      return null;
  }
};

const getRankColor = (rank) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    case 2:
      return 'bg-gradient-to-r from-gray-300 to-gray-500';
    case 3:
      return 'bg-gradient-to-r from-orange-400 to-orange-600';
    default:
      return 'bg-gray-100';
  }
};

const LeaderboardRow = ({ player, rank, isCurrentUser, isTelegram, themeParams }) => {
  const textStyle = isTelegram ? { color: themeParams?.text_color } : {};
  const hintStyle = isTelegram ? { color: themeParams?.hint_color } : {};

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors ${
        isCurrentUser 
          ? isTelegram 
            ? 'border-2' 
            : 'bg-purple-50 border-2 border-purple-200' 
          : isTelegram ? '' : 'hover:bg-gray-50'
      }`}
      style={isCurrentUser && isTelegram ? {
        backgroundColor: `${themeParams?.button_color}20`,
        borderColor: themeParams?.button_color
      } : undefined}
    >
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
        {/* Rank */}
        <div className="w-8 sm:w-12 flex items-center justify-center flex-shrink-0">
          {rank <= 3 ? (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getRankColor(rank)} flex items-center justify-center text-white font-bold text-sm sm:text-base`}>
              {rank}
            </div>
          ) : (
            <span className="text-base sm:text-lg font-semibold" style={hintStyle}>#{rank}</span>
          )}
        </div>

        {/* Rank Icon - hidden on mobile */}
        <div className="hidden sm:block w-6 flex-shrink-0">
          {getRankIcon(rank)}
        </div>

        {/* Avatar and Name */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage src={player.picture} alt={player.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs sm:text-base">
              {player.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm sm:text-base" style={textStyle}>
              {player.name}
              {isCurrentUser && (
                <Badge className="ml-1 sm:ml-2 bg-purple-600 text-white text-xs">Вы</Badge>
              )}
            </p>
            <p className="text-xs sm:text-sm" style={hintStyle}>Ур. {player.level}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-2 sm:space-x-6 text-xs sm:text-sm flex-shrink-0">
          <div className="text-center">
            <p style={hintStyle} className="hidden sm:block">Лучшее</p>
            <p className="font-bold" style={{ color: isTelegram ? themeParams?.accent_text_color : '#9333ea' }}>
              {player.best_time.toFixed(1)}с
            </p>
          </div>
          <div className="text-center hidden sm:block">
            <p style={hintStyle}>Игр</p>
            <p className="font-semibold" style={textStyle}>{player.total_games}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const { user, isTelegram } = useAuth();
  const { themeParams, hapticImpact } = useTelegram();
  const [selectedExercise, setSelectedExercise] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      fetchLeaderboard();
    }
  }, [selectedExercise, limit]);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/exercises`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
        // Auto-select first exercise
        if (data.length > 0 && !selectedExercise) {
          setSelectedExercise(data[0].exercise_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/leaderboard/${selectedExercise}?limit=${limit}`,
        {
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentExercise = exercises.find(e => e.exercise_id === selectedExercise);

  const bgStyle = isTelegram ? { backgroundColor: themeParams?.bg_color } : {};
  const cardStyle = isTelegram ? { backgroundColor: themeParams?.secondary_bg_color || themeParams?.bg_color } : {};
  const textStyle = isTelegram ? { color: themeParams?.text_color } : {};
  const hintStyle = isTelegram ? { color: themeParams?.hint_color } : {};

  return (
    <div className={`min-h-screen ${!isTelegram ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50' : ''}`} style={bgStyle}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={textStyle}>
            Таблица лидеров 🏆
          </h1>
          <p className="text-sm sm:text-lg" style={hintStyle}>
            Лучшие игроки по каждому упражнению
          </p>
        </div>

        {/* Exercise Selection */}
        <Card className="mb-4 sm:mb-8" style={cardStyle}>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-xl" style={textStyle}>Выберите упражнение</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedExercise} 
              onValueChange={(value) => {
                if (isTelegram) hapticImpact?.('light');
                setSelectedExercise(value);
              }}
            >
              <SelectTrigger 
                className="w-full"
                style={isTelegram ? {
                  backgroundColor: themeParams?.bg_color,
                  color: themeParams?.text_color,
                  borderColor: themeParams?.hint_color
                } : undefined}
              >
                <SelectValue placeholder="Выберите упражнение" />
              </SelectTrigger>
              <SelectContent
                style={isTelegram ? {
                  backgroundColor: themeParams?.secondary_bg_color || themeParams?.bg_color,
                  color: themeParams?.text_color
                } : undefined}
              >
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.exercise_id} value={exercise.exercise_id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card style={cardStyle}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-2xl mb-1" style={textStyle}>
                  {currentExercise?.name || 'Загрузка...'}
                </CardTitle>
                <p className="text-xs sm:text-sm" style={hintStyle}>
                  {currentExercise?.description}
                </p>
              </div>
              <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div 
                  className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4"
                  style={{ borderColor: themeParams?.button_color || '#9333ea' }}
                ></div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: themeParams?.hint_color || '#d1d5db' }} />
                <p style={textStyle} className="mb-2">Пока нет результатов</p>
                <p className="text-sm" style={hintStyle}>
                  Станьте первым в таблице лидеров!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboardData.map((player, index) => (
                  <LeaderboardRow
                    key={player.user_id}
                    player={player}
                    rank={index + 1}
                    isCurrentUser={player.user_id === user?.user_id}
                    isTelegram={isTelegram}
                    themeParams={themeParams}
                  />
                ))}

                {/* Show More Button */}
                {limit === 10 && leaderboardData.length === 10 && (
                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        if (isTelegram) hapticImpact?.('light');
                        setLimit(100);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Показать топ-100
                    </Button>
                  </div>
                )}

                {limit === 100 && (
                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        if (isTelegram) hapticImpact?.('light');
                        setLimit(10);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Показать топ-10
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-8">
          <Card style={cardStyle}>
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm mb-1" style={hintStyle}>Игроков</p>
                <p className="text-xl sm:text-3xl font-bold" style={{ color: themeParams?.accent_text_color || '#9333ea' }}>
                  {leaderboardData.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card style={cardStyle}>
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm mb-1" style={hintStyle}>Лучший</p>
                <p className="text-xl sm:text-3xl font-bold" style={{ color: themeParams?.link_color || '#3b82f6' }}>
                  {leaderboardData.length > 0 ? `${leaderboardData[0].best_time.toFixed(1)}с` : '--'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card style={cardStyle}>
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm mb-1" style={hintStyle}>Вы</p>
                <p className="text-xl sm:text-3xl font-bold" style={{ color: '#ec4899' }}>
                  {leaderboardData.findIndex(p => p.user_id === user?.user_id) + 1 || '--'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
