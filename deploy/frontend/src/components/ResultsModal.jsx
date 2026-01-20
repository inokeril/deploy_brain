import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, RotateCcw, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const ResultsModal = ({ isOpen, onClose, time, gridSize, bestTime, onPlayAgain }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const isNewRecord = bestTime === time && time > 0;

  useEffect(() => {
    if (isOpen && isNewRecord) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isNewRecord]);

  // Format time display
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${centiseconds.toString().padStart(2, '0')} сек`;
  };

  // Get performance message
  const getPerformanceMessage = () => {
    const totalCells = gridSize * gridSize;
    const avgTimePerCell = time / totalCells;
    
    if (avgTimePerCell < 500) {
      return { text: 'Невероятно быстро!', icon: Sparkles, color: 'text-primary' };
    } else if (avgTimePerCell < 800) {
      return { text: 'Отличный результат!', icon: Star, color: 'text-primary' };
    } else if (avgTimePerCell < 1200) {
      return { text: 'Хороший результат!', icon: Trophy, color: 'text-accent-foreground' };
    } else {
      return { text: 'Продолжайте практиковаться!', icon: Clock, color: 'text-muted-foreground' };
    }
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        {/* Confetti effect for new records */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: [
                    'hsl(var(--primary))',
                    'hsl(var(--accent))',
                    'hsl(var(--secondary))',
                    'hsl(var(--success))'
                  ][i % 4],
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={cn(
              "p-4 rounded-full",
              isNewRecord ? "bg-success/20" : "bg-primary/10"
            )}>
              {isNewRecord ? (
                <Trophy size={40} className="text-success-foreground" />
              ) : (
                <PerformanceIcon size={40} className={performance.color} />
              )}
            </div>
          </div>

          <DialogTitle className="text-2xl font-semibold text-foreground">
            {isNewRecord ? 'Новый рекорд!' : 'Упражнение завершено!'}
          </DialogTitle>
          
          <DialogDescription className={cn("text-base", performance.color)}>
            {performance.text}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Time Result */}
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Ваше время</p>
            <p className="text-4xl font-semibold text-foreground tabular-nums">
              {formatTime(time)}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Размер сетки</p>
              <p className="text-lg font-medium text-secondary-foreground">
                {gridSize}×{gridSize}
              </p>
            </div>
            <div className="p-3 bg-accent/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Найдено чисел</p>
              <p className="text-lg font-medium text-accent-foreground">
                {gridSize * gridSize}
              </p>
            </div>
          </div>

          {/* Best Time */}
          {bestTime && !isNewRecord && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Лучшее время:{' '}
                <span className="font-medium text-primary">
                  {formatTime(bestTime)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onPlayAgain}
            className="flex-1 gap-2"
            size="lg"
          >
            <RotateCcw size={18} />
            Играть снова
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
