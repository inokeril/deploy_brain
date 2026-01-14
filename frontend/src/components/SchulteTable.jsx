import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

const SchulteTable = ({
  size,
  numbers,
  completedCells,
  wrongCell,
  onCellClick,
  gameState
}) => {
  // Generate cell background colors
  const cellColors = useMemo(() => {
    const colors = [
      'bg-cell-1',
      'bg-cell-2', 
      'bg-cell-3',
      'bg-cell-4',
      'bg-cell-5',
      'bg-cell-6',
      'bg-cell-7',
      'bg-cell-8',
    ];
    
    return numbers.map((_, index) => colors[index % colors.length]);
  }, [numbers]);

  // Calculate cell size based on grid size and screen
  const getCellSize = () => {
    switch (size) {
      case 4:
        return 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl';
      case 5:
        return 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl';
      case 6:
        return 'w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg';
      case 7:
        return 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base';
      default:
        return 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl';
    }
  };

  // Calculate gap size
  const getGapSize = () => {
    switch (size) {
      case 4:
        return 'gap-2 sm:gap-3';
      case 5:
        return 'gap-1.5 sm:gap-2';
      case 6:
        return 'gap-1 sm:gap-1.5';
      case 7:
        return 'gap-1 sm:gap-1.5';
      default:
        return 'gap-1.5 sm:gap-2';
    }
  };

  return (
    <div 
      className={cn(
        "grid p-3 sm:p-4 rounded-xl bg-muted/30",
        getGapSize()
      )}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {numbers.map((number, index) => {
        const isCompleted = completedCells.has(index);
        const isWrong = wrongCell === index;
        const staggerClass = `stagger-${Math.min((index % 10) + 1, 10)}`;

        return (
          <button
            key={`${index}-${number}`}
            onClick={() => onCellClick(number, index)}
            disabled={isCompleted || gameState !== 'playing'}
            className={cn(
              "flex items-center justify-center rounded-lg font-medium",
              "transition-all duration-200 ease-smooth",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              getCellSize(),
              // Default state with cell colors
              !isCompleted && !isWrong && cellColors[index],
              // Hover state
              !isCompleted && gameState === 'playing' && "hover:scale-105 hover:shadow-soft cursor-pointer",
              // Completed state
              isCompleted && "bg-success text-success-foreground animate-cell-correct",
              // Wrong state
              isWrong && "bg-destructive/30 animate-cell-wrong",
              // Idle/paused state - slightly muted
              gameState !== 'playing' && !isCompleted && "opacity-80",
              // Animation stagger
              gameState === 'idle' && "animate-scale-in",
              gameState === 'idle' && staggerClass
            )}
            aria-label={`Число ${number}`}
          >
            <span className={cn(
              "select-none",
              isCompleted && "text-success-foreground",
              !isCompleted && "text-foreground"
            )}>
              {number}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SchulteTable;
