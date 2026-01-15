import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

const LeaderboardRow = ({ player, rank, isCurrentUser }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
        isCurrentUser ? 'bg-purple-50 border-2 border-purple-200' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-4 flex-1">
        {/* Rank */}
        <div className="w-12 flex items-center justify-center">
          {rank <= 3 ? (
            <div className={`w-10 h-10 rounded-full ${getRankColor(rank)} flex items-center justify-center text-white font-bold`}>
              {rank}
            </div>
          ) : (
            <span className="text-lg font-semibold text-gray-600">#{rank}</span>
          )}
        </div>

        {/* Rank Icon */}
        <div className="w-6">
          {getRankIcon(rank)}
        </div>

        {/* Avatar and Name */}
        <div className="flex items-center space-x-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={player.picture} alt={player.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              {player.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {player.name}
              {isCurrentUser && (
                <Badge className="ml-2 bg-purple-600 text-white">Вы</Badge>
              )}
            </p>
            <p className="text-sm text-gray-500">Уровень {player.level}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center space-x-8 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Лучшее время</p>
            <p className="font-bold text-purple-600">{player.best_time.toFixed(2)}с</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Игр</p>
            <p className="font-semibold text-gray-900">{player.total_games}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState('schulte');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Таблица лидеров 🏆
          </h1>
          <p className="text-lg text-gray-600">
            Лучшие игроки по каждому упражнению
          </p>
        </div>

        {/* Exercise Tabs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Выберите упражнение</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedExercise} onValueChange={setSelectedExercise}>
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                {exercises.map((exercise) => (
                  <TabsTrigger key={exercise.exercise_id} value={exercise.exercise_id}>
                    {exercise.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">
                  {currentExercise?.name || 'Загрузка...'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {currentExercise?.description}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Пока нет результатов</p>
                <p className="text-sm text-gray-500">
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
                  />
                ))}

                {/* Show More Button */}
                {limit === 10 && leaderboardData.length === 10 && (
                  <div className="pt-4">
                    <Button
                      onClick={() => setLimit(100)}
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
                      onClick={() => setLimit(10)}
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

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Всего игроков</p>
                <p className="text-3xl font-bold text-purple-600">{leaderboardData.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Лучший результат</p>
                <p className="text-3xl font-bold text-blue-600">
                  {leaderboardData.length > 0 ? `${leaderboardData[0].best_time.toFixed(2)}с` : '--'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Ваша позиция</p>
                <p className="text-3xl font-bold text-pink-600">
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
