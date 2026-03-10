export type AgentState = "Walking" | "Typing" | "Reading" | "Waiting";

export interface Position {
  x: number;
  y: number;
}

export interface Agent {
  id: string;
  name: string;
  state: AgentState;
  position: Position;
  targetPosition: Position | null;
  designIndex: number;
  parentId?: string; // For sub-agents
}

export interface Furniture {
  id: string;
  type: "desk" | "plant" | "server";
  position: Position;
}

export interface OfficeData {
  agents: Agent[];
  furniture: Furniture[];
}
