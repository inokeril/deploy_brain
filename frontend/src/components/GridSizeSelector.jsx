import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GRID_SIZES = [4, 5, 6, 7];

const GridSizeSelector = ({ value, onChange, disabled }) => {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      {GRID_SIZES.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === size
              ? "bg-card text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={`Сетка ${size}×${size}`}
        >
          {size}×{size}
        </button>
      ))}
    </div>
  );
};

export default GridSizeSelector;
