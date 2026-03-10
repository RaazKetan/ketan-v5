import React from "react";
import { AgentOffice } from "../../AgentOffice/AgentOffice";

export const OfficePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-8 pb-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-bold tracking-tight text-white mb-2 font-mono uppercase">Agent Operations</h1>
            <p className="text-zinc-400 max-w-2xl text-lg relative pl-4 border-l-2 border-amber-500">
              Real-time visualization of AI agents working autonomously across repositories. Select an agent and click the floor to reassign tasks.
            </p>
        </div>
        
        <AgentOffice />
      </div>
    </div>
  );
};
