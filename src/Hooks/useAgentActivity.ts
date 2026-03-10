import { useState, useEffect } from 'react';
import type { Agent, AgentState, Position, Furniture } from '../components/AgentOffice/types';

// Mock generator for testing
const generateMockAgents = (): Agent[] => [
  {
    id: "agent-1",
    name: "Architect",
    state: "Waiting",
    position: { x: 2, y: 2 },
    targetPosition: null,
    designIndex: 0,
  },
  {
    id: "agent-2",
    name: "Coder",
    state: "Typing",
    position: { x: 5, y: 3 },
    targetPosition: null,
    designIndex: 1,
  },
  {
    id: "agent-3",
    name: "Researcher",
    state: "Reading",
    position: { x: 1, y: 5 },
    targetPosition: null,
    designIndex: 2,
  }
];

const mockFurniture: Furniture[] = [
  { id: "desk-1", type: "desk", position: { x: 5, y: 3 } },
  { id: "desk-2", type: "desk", position: { x: 2, y: 2 } },
  { id: "desk-3", type: "desk", position: { x: 8, y: 2 } },
  { id: "plant-1", type: "plant", position: { x: 0, y: 0 } },
  { id: "plant-2", type: "plant", position: { x: 9, y: 0 } },
  { id: "server-1", type: "server", position: { x: 0, y: 5 } },
];

const STORAGE_KEY = 'agent_office_furniture';

export const useAgentActivity = () => {
  const [agents, setAgents] = useState<Agent[]>(generateMockAgents());
  const [furniture, setFurniture] = useState<Furniture[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing layout from localStorage", e);
    }
    return mockFurniture;
  });

  // Save furniture to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(furniture));
  }, [furniture]);

  // Simulate real-time data stream
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prevAgents => prevAgents.map(agent => {
        // Randomly change state and position for demonstration
        if (Math.random() > 0.7) {
          const states: AgentState[] = ["Walking", "Typing", "Reading", "Waiting"];
          const newState = states[Math.floor(Math.random() * states.length)];
          
          let newPosition = agent.position;
          let newTarget = agent.targetPosition;

          if (newState === "Walking") {
            // Pick a new random target position
            newTarget = {
              x: Math.floor(Math.random() * 10),
              y: Math.floor(Math.random() * 10)
            };
          } else if (newState === "Typing") {
            // Find a desk to type at
            const desk = furniture.find(f => f.type === "desk");
            if (desk) {
              newPosition = desk.position;
            }
          }

          return { ...agent, state: newState, targetPosition: newTarget, position: newPosition };
        }
        
        // If walking, move towards target
        if (agent.state === "Walking" && agent.targetPosition) {
          const { x: tx, y: ty } = agent.targetPosition;
          let newX = agent.position.x;
          let newY = agent.position.y;
          
          if (newX < tx) newX++;
          else if (newX > tx) newX--;
          else if (newY < ty) newY++;
          else if (newY > ty) newY--;

          if (newX === tx && newY === ty) {
             return { ...agent, position: { x: newX, y: newY }, targetPosition: null, state: "Waiting" };
          }
           return { ...agent, position: { x: newX, y: newY } };
        }

        return agent;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [furniture]);

  // Sub-agent spawning mock
  useEffect(() => {
    const timer = setTimeout(() => {
      setAgents(prev => {
        if (prev.some(a => a.id === "sub-agent-1")) return prev;
        
        const parentAgent = prev.find(a => a.id === "agent-1");
        if (!parentAgent) return prev;
        
        const newSubAgent: Agent = {
          id: "sub-agent-1",
          name: "Test Runner",
          state: "Waiting",
          position: { x: Math.max(0, parentAgent.position.x - 1), y: parentAgent.position.y },
          targetPosition: null,
          designIndex: 4,
          parentId: parentAgent.id
        };
        return [...prev, newSubAgent];
      });
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const updateFurniturePosition = (id: string, newPosition: Position) => {
    setFurniture(prev => prev.map(f => f.id === id ? { ...f, position: newPosition } : f));
  };

  const updateAgentPosition = (id: string, newPosition: Position) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, position: newPosition, targetPosition: newPosition, state: "Walking" } : a));
  }

  return { agents, furniture, updateFurniturePosition, updateAgentPosition };
};
