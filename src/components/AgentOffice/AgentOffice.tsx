import React, { useState } from 'react';
import { OfficeFloor } from './OfficeFloor';
import { Character } from './Character';
import { useAgentActivity } from '../../Hooks/useAgentActivity';
import type { Position } from './types';

const GRID_SIZE = 64;
const OFFICE_WIDTH = 15;
const OFFICE_HEIGHT = 10;

export const AgentOffice: React.FC = () => {
  const { agents, furniture, updateAgentPosition, updateFurniturePosition } = useAgentActivity();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  const handleTileClick = (pos: Position) => {
    if (selectedAgentId) {
       // Command the selected agent to move here
       updateAgentPosition(selectedAgentId, pos);
       setSelectedAgentId(null);
    } else if (selectedFurnitureId) {
       updateFurniturePosition(selectedFurnitureId, pos);
       setSelectedFurnitureId(null);
    }
  };

  const handleCharacterClick = (id: string) => {
    setSelectedAgentId(id === selectedAgentId ? null : id);
    setSelectedFurnitureId(null);
  };
  
  const handleFurnitureClick = (id: string) => {
    setSelectedFurnitureId(id === selectedFurnitureId ? null : id);
    setSelectedAgentId(null);
  };

  return (
    <div className="relative w-full h-[80vh] bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
      {/* Top Bar for Office */}
      <div className="absolute top-0 left-0 w-full h-12 bg-zinc-950/80 backdrop-blur-md z-30 flex items-center px-6 border-b border-zinc-800 justify-between">
         <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-wider text-xl">AGENT OFFICE</span>
            <div className="h-4 w-[1px] bg-zinc-700" />
            <span className="text-zinc-400 text-sm font-mono tracking-widest">{agents.length} AGENTS ACTIVE</span>
         </div>
         {(selectedAgentId || selectedFurnitureId) && (
            <span className="text-amber-400 text-sm animate-pulse">Select destination on floor</span>
         )}
      </div>

      {/* Main Office Area */}
      <div className="absolute inset-0 pt-12 overflow-auto custom-scrollbar flex items-center justify-center bg-zinc-950">
        <div 
           className="relative shadow-2xl" 
           style={{ width: OFFICE_WIDTH * GRID_SIZE, height: OFFICE_HEIGHT * GRID_SIZE }}
        >
          <OfficeFloor 
             furniture={furniture} 
             gridSize={GRID_SIZE} 
             width={OFFICE_WIDTH} 
             height={OFFICE_HEIGHT} 
             onTileClick={handleTileClick} 
             selectedFurnitureId={selectedFurnitureId}
             onFurnitureClick={handleFurnitureClick}
          />
          
          {agents.map(agent => (
            <Character 
               key={agent.id} 
               agent={agent} 
               gridSize={GRID_SIZE} 
               isSelected={agent.id === selectedAgentId}
               onClick={handleCharacterClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
