import React from 'react';
import { motion } from 'framer-motion';
import type { Agent } from './types';

interface CharacterProps {
  agent: Agent;
  gridSize: number;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const characterDesigns = [
  'bg-blue-400', // Design 0
  'bg-pink-400', // Design 1
  'bg-emerald-400', // Design 2
  'bg-amber-400', // Design 3
  'bg-purple-400', // Design 4
  'bg-red-400', // Design 5
];

export const Character: React.FC<CharacterProps> = ({ agent, gridSize, isSelected, onClick }) => {
  const { state, position, name, designIndex, parentId } = agent;
  const x = position.x * gridSize;
  const y = position.y * gridSize;

  // Animation variants based on state
  const getAnimation = () => {
    switch (state) {
      case 'Walking':
        return {
          y: [0, -gridSize/4, 0],
          transition: { repeat: Infinity, duration: 0.5 }
        };
      case 'Typing':
        return {
          rotate: [-5, 5, -5],
          scale: [1, 1.05, 1],
          transition: { repeat: Infinity, duration: 0.2 }
        };
      case 'Reading':
        return {
          x: [0, gridSize/8, -gridSize/8, 0],
          transition: { repeat: Infinity, duration: 1.5 }
        };
      case 'Waiting':
        return {
          opacity: [0.5, 1, 0.5],
          transition: { repeat: Infinity, duration: 2 }
        };
      default:
        return {};
    }
  };

  const colorClass = characterDesigns[designIndex % characterDesigns.length];

  return (
    <motion.div
      initial={false}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`absolute w-[${gridSize}px] h-[${gridSize}px] flex flex-col justify-end items-center cursor-pointer z-10`}
      style={{ width: gridSize, height: gridSize }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(agent.id);
      }}
    >
      {/* Name and State Label */}
      <div className="absolute -top-8 whitespace-nowrap bg-zinc-800 text-xs px-2 py-1 rounded-md text-white border border-zinc-700 font-mono shadow-md z-20 pointer-events-none">
        <span className="font-bold">{name}</span> {parentId && <span className="text-[10px] text-zinc-400">(Sub)</span>}
        <br />
        <span className="text-[10px] uppercase text-zinc-400">{state}</span>
      </div>

      {isSelected && (
        <div className="absolute -top-1 w-full h-full border-2 border-white rounded-md animate-pulse pointer-events-none z-10" />
      )}

      {/* Body parts for animation */}
      <motion.div
        animate={getAnimation()}
        className={`w-3/4 h-3/4 ${colorClass} rounded-t-full rounded-b-md shadow-lg border-2 border-zinc-900 relative`}
      >
        {/* Simple face */}
        <div className="absolute top-1/4 left-1/4 w-1/2 flex justify-between">
            <div className={`w-1.5 h-1.5 rounded-full ${state === 'Waiting' ? 'bg-amber-200' : 'bg-zinc-900'}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${state === 'Waiting' ? 'bg-amber-200' : 'bg-zinc-900'}`} />
        </div>
        {state === 'Reading' && (
           <div className="absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-zinc-900" />
        )}
      </motion.div>
    </motion.div>
  );
};
