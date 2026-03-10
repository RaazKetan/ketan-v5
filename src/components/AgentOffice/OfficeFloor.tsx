import React from 'react';
import type { Furniture, Position } from './types';

interface OfficeFloorProps {
  furniture: Furniture[];
  gridSize: number;
  width: number;
  height: number;
  onTileClick: (pos: Position) => void;
  selectedFurnitureId?: string | null;
  onFurnitureClick?: (id: string) => void;
}

export const OfficeFloor: React.FC<OfficeFloorProps> = ({ furniture, gridSize, width, height, onTileClick, selectedFurnitureId, onFurnitureClick }) => {
  const getFurnitureIcon = (type: string) => {
    switch(type) {
        case 'desk': return '💻';
        case 'plant': return '🪴';
        case 'server': return '🗄️';
        default: return '📦';
    }
  };

  const getFurnitureColor = (type: string) => {
      switch(type) {
        case 'desk': return 'bg-zinc-700 border-zinc-600';
        case 'plant': return 'bg-emerald-800/50 border-emerald-700/50';
        case 'server': return 'bg-blue-900/50 border-blue-800/50';
        default: return 'bg-zinc-800 border-zinc-700';
      }
  }

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden cursor-crosshair" 
      style={{
          width: width * gridSize,
          height: height * gridSize,
          backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`
      }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / gridSize);
        const y = Math.floor((e.clientY - rect.top) / gridSize);
        if (x >= 0 && x < width && y >= 0 && y < height) {
           onTileClick({ x, y });
        }
      }}
    >
      {/* Furniture */}
      {furniture.map((item) => {
        const isSelected = item.id === selectedFurnitureId;
        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onFurnitureClick?.(item.id);
            }}
            className={`absolute flex items-center justify-center text-xl rounded-md border text-zinc-400 cursor-pointer ${getFurnitureColor(item.type)} ${isSelected ? 'ring-2 ring-amber-400 z-10 animate-pulse' : 'z-0'}`}
            style={{
              left: item.position.x * gridSize + 2,
              top: item.position.y * gridSize + 2,
              width: gridSize - 4,
              height: gridSize - 4,
            }}
          >
            {getFurnitureIcon(item.type)}
          </div>
        );
      })}
    </div>
  );
};
