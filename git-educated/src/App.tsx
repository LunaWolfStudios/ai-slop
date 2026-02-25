import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Terminal } from './components/Terminal';
import { Graph } from './components/Graph';
import { Sprite } from './components/Sprite';
import { LessonPanel } from './components/LessonPanel';
import { StagingArea } from './components/StagingArea';
import { useGame } from './hooks/useGame';
import { chapters } from './data/chapters';

export default function App() {
  const { gameState, currentChapterIndex, currentTaskIndex } = useGame();
  
  const currentChapter = chapters[currentChapterIndex];
  const currentTask = currentChapter?.tasks[currentTaskIndex];
  
  // Calculate progress
  const totalTasks = currentChapter?.tasks.length || 1;
  const progress = Math.round((currentTaskIndex / totalTasks) * 100);

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex flex-col relative">
          <Graph repo={gameState.repo} />
          <Sprite 
            message={currentTask?.description || "Chapter Complete!"} 
            emotion={currentTask ? 'neutral' : 'happy'}
          />
        </div>
        <div className="h-1/2 border-t border-green-900/30 flex flex-col">
          <Terminal />
        </div>
      </div>
      <div className="flex flex-col border-l border-green-900/30">
        <LessonPanel 
          title={currentChapter?.title || "Game Over"} 
          objective={currentTask?.description || "You have completed all chapters!"} 
          progress={progress}
          solution={currentTask?.solution}
          story={currentChapter?.story}
        />
        <div className="flex-1 border-t border-green-900/30 overflow-hidden">
           <StagingArea />
        </div>
      </div>
    </Layout>
  );
}
