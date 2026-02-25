import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-green-400 font-mono flex flex-col overflow-hidden selection:bg-green-900 selection:text-green-100">
      <header className="border-b border-green-900/50 p-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          <h1 className="ml-4 text-xl font-bold tracking-wider text-green-500 glow-text">GIT EDUCATED</h1>
        </div>
        <div className="text-xs text-green-700">v1.0.0-alpha</div>
      </header>
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {children}
        <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-10 z-50"></div>
      </main>
    </div>
  );
};
