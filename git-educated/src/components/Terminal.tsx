import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { motion } from 'motion/react';

export const Terminal: React.FC = () => {
  const { history, executeCommand, gameState } = useGame();
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Reset history index when input is manually changed (optional, but good UX)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHistoryIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
      setHistoryIndex(null);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      
      const newIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex].command);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;

      const newIndex = historyIndex + 1;
      if (newIndex >= history.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(history[newIndex].command);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.split(' ');
      const lastPart = parts[parts.length - 1];
      
      // Basic autocomplete logic
      const commands = ['git', 'ls', 'pwd', 'clear', 'history'];
      const gitSubcommands = ['init', 'status', 'add', 'commit', 'branch', 'checkout'];
      const files = gameState.repo.workingDirectory;

      let matches: string[] = [];
      let prefix = '';

      if (parts.length === 1) {
        matches = commands.filter(c => c.startsWith(lastPart));
        prefix = '';
      } else if (parts[0] === 'git' && parts.length === 2) {
        matches = gitSubcommands.filter(c => c.startsWith(lastPart));
        prefix = 'git ';
      } else if (parts[0] === 'git' && parts[1] === 'add' && parts.length === 3) {
        matches = files.filter(f => f.startsWith(lastPart));
        prefix = 'git add ';
      }

      if (matches.length === 1) {
        setInput(prefix + matches[0] + (parts.length === 1 || (parts[0] === 'git' && parts.length === 2) ? ' ' : ''));
      }
    }
  };

  return (
    <div 
      className="flex-1 bg-black/80 p-4 font-mono text-sm overflow-y-auto min-h-[300px] border-r border-green-900/30"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="space-y-2">
        <div className="text-zinc-500 mb-4">
          Welcome to GIT EDUCATED v1.0.0<br/>
          Type 'help' for available commands.
        </div>
        
        {history.map((entry, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-green-500">➜</span>
              <span className="text-blue-400">~/project</span>
              <span className="text-zinc-600">$</span>
              <span className="text-zinc-100">{entry.command}</span>
            </div>
            {entry.result.output && (
              <div className={`pl-4 whitespace-pre-wrap ${
                entry.result.type === 'error' ? 'text-red-400' : 
                entry.result.type === 'success' ? 'text-green-300' : 'text-zinc-300'
              }`}>
                {entry.result.output}
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 text-zinc-400 pt-2">
          <span className="text-green-500">➜</span>
          <span className="text-blue-400">~/project</span>
          <span className="text-zinc-600">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-700"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
