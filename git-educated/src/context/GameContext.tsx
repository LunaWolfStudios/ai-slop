import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { chapters } from '../data/chapters';
import { GameState, Commit, Branch } from '../types';

export interface CommandResult {
  output: string;
  type: 'success' | 'error' | 'info';
}

interface GameContextType {
  history: { command: string; result: CommandResult }[];
  executeCommand: (command: string) => void;
  gameState: GameState;
  currentChapterIndex: number;
  currentTaskIndex: number;
  resetChapter: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_STATE: GameState = {
  currentChapterId: '1',
  repo: {
    commits: [],
    branches: [],
    head: '',
    detachedHead: false,
    staging: [],
    workingDirectory: ['file.txt'],
    remotes: [],
    isInitialized: false,
    reflog: [],
    bisecting: false
  },
  commandHistory: [],
  outputHistory: [],
  completedChapters: []
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<{ command: string; result: CommandResult }[]>([]);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const executeCommand = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    let result: CommandResult = { output: '', type: 'info' };
    const parts = trimmed.split(' ');
    const cmd = parts[0];

    // --- Command Logic ---
    if (cmd === 'git') {
      const sub = parts[1];
      
      if (sub === 'init') {
        if (gameState.repo.isInitialized) {
           result = { output: 'Reinitialized existing Git repository', type: 'info' };
        } else {
           setGameState(prev => ({
             ...prev,
             repo: {
               ...prev.repo,
               isInitialized: true,
               branches: [{ name: 'main', commitId: '' }],
               head: 'main'
             }
           }));
           result = { output: 'Initialized empty Git repository in /home/user/project/.git/', type: 'success' };
        }
      } 
      else if (!gameState.repo.isInitialized && cmd === 'git') {
        result = { output: 'fatal: not a git repository (or any of the parent directories): .git', type: 'error' };
      }
      else if (sub === 'status') {
        const staged = gameState.repo.staging.length > 0 ? `Changes to be committed:\n  (use "git rm --cached <file>..." to unstage)\n\tnew file:   ${gameState.repo.staging.join(', ')}` : '';
        const untracked = gameState.repo.workingDirectory.filter(f => !gameState.repo.staging.includes(f)).length > 0 ? `Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n\t${gameState.repo.workingDirectory.filter(f => !gameState.repo.staging.includes(f)).join('\n\t')}` : '';
        
        result = { 
          output: `On branch ${gameState.repo.head}\n${gameState.repo.commits.length === 0 ? 'No commits yet\n' : ''}\n${staged}\n${untracked}\n${!staged && !untracked ? 'nothing to commit, working tree clean' : ''}`, 
          type: 'info' 
        };
      } 
      else if (sub === 'add') {
        const file = parts[2];
        if (file) {
          if (file === '.') {
             setGameState(prev => ({
               ...prev,
               repo: {
                 ...prev.repo,
                 staging: [...new Set([...prev.repo.staging, ...prev.repo.workingDirectory])]
               }
             }));
             result = { output: '', type: 'success' };
          } else if (gameState.repo.workingDirectory.includes(file)) {
             setGameState(prev => ({
               ...prev,
               repo: {
                 ...prev.repo,
                 staging: [...new Set([...prev.repo.staging, file])]
               }
             }));
             result = { output: '', type: 'success' };
          } else {
             result = { output: `fatal: pathspec '${file}' did not match any files`, type: 'error' };
          }
        } else {
           result = { output: 'Nothing specified, nothing added.', type: 'info' };
        }
      } 
      else if (sub === 'commit') {
        if (gameState.repo.staging.length === 0) {
           result = { output: 'nothing to commit (create/copy files and use "git add" to track)', type: 'info' };
        } else if (!parts.includes('-m')) {
           result = { output: 'Aborting commit due to empty commit message.', type: 'error' };
        } else {
           const msgIndex = parts.indexOf('-m') + 1;
           const message = parts.slice(msgIndex).join(' ').replace(/"/g, '');
           
           // Find parent: current commit of the HEAD branch
           const currentBranch = gameState.repo.branches.find(b => b.name === gameState.repo.head);
           const parentId = currentBranch ? currentBranch.commitId : null;

           const newCommit: Commit = {
             id: Math.random().toString(36).substring(7),
             message,
             parentId: parentId,
             branch: gameState.repo.head
           };

           setGameState(prev => ({
             ...prev,
             repo: {
               ...prev.repo,
               commits: [...prev.repo.commits, newCommit],
               staging: [], // Clear staging
               branches: prev.repo.branches.map(b => b.name === prev.repo.head ? { ...b, commitId: newCommit.id } : b)
             }
           }));
           
           result = { output: `[${gameState.repo.head} ${newCommit.id}] ${message}\n ${gameState.repo.staging.length} file changed, 1 insertion(+)`, type: 'success' };
        }
      }
      else if (sub === 'branch') {
        const branchName = parts[2];
        if (!branchName) {
           result = { output: gameState.repo.branches.map(b => b.name === gameState.repo.head ? `* ${b.name}` : `  ${b.name}`).join('\n'), type: 'info' };
        } else {
           if (gameState.repo.branches.find(b => b.name === branchName)) {
              result = { output: `fatal: A branch named '${branchName}' already exists.`, type: 'error' };
           } else {
              const currentBranch = gameState.repo.branches.find(b => b.name === gameState.repo.head);
              setGameState(prev => ({
                ...prev,
                repo: {
                  ...prev.repo,
                  branches: [...prev.repo.branches, { name: branchName, commitId: currentBranch ? currentBranch.commitId : '' }]
                }
              }));
              result = { output: '', type: 'success' };
           }
        }
      }
      else if (sub === 'checkout') {
        const branchName = parts[2];
        if (!branchName) {
           result = { output: 'fatal: You must specify a branch to checkout.', type: 'error' };
        } else if (branchName === '-b') {
           const newBranchName = parts[3];
           if (gameState.repo.branches.find(b => b.name === newBranchName)) {
              result = { output: `fatal: A branch named '${newBranchName}' already exists.`, type: 'error' };
           } else {
              const currentBranch = gameState.repo.branches.find(b => b.name === gameState.repo.head);
              setGameState(prev => ({
                ...prev,
                repo: {
                  ...prev.repo,
                  branches: [...prev.repo.branches, { name: newBranchName, commitId: currentBranch ? currentBranch.commitId : '' }],
                  head: newBranchName
                }
              }));
              result = { output: `Switched to a new branch '${newBranchName}'`, type: 'success' };
           }
        } else {
           if (!gameState.repo.branches.find(b => b.name === branchName)) {
              result = { output: `error: pathspec '${branchName}' did not match any file(s) known to git`, type: 'error' };
           } else {
              setGameState(prev => ({
                ...prev,
                repo: {
                  ...prev.repo,
                  head: branchName
                }
              }));
              result = { output: `Switched to branch '${branchName}'`, type: 'success' };
           }
        }
      }
      else if (sub === 'remote') {
        if (parts[2] === 'add' && parts[3] && parts[4]) {
          const name = parts[3];
          const url = parts[4];
          setGameState(prev => ({
            ...prev,
            repo: {
              ...prev.repo,
              remotes: [...prev.repo.remotes, { name, url }]
            }
          }));
          result = { output: '', type: 'success' };
        } else if (parts[2] === '-v') {
          result = { output: gameState.repo.remotes.map(r => `${r.name}\t${r.url} (fetch)\n${r.name}\t${r.url} (push)`).join('\n'), type: 'info' };
        } else {
          result = { output: 'usage: git remote add <name> <url>', type: 'error' };
        }
      }
      else if (sub === 'push') {
        const remote = parts[2];
        const branch = parts[3];
        if (remote && branch) {
          // Simulate push
          result = { output: `Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nWriting objects: 100% (3/3), 280 bytes | 280.00 KiB/s, done.\nTotal 3 (delta 0), reused 0 (delta 0)\nTo ${gameState.repo.remotes.find(r => r.name === remote)?.url || remote}\n * [new branch]      ${branch} -> ${branch}`, type: 'success' };
        } else {
          result = { output: 'fatal: The current branch has no upstream branch.', type: 'error' };
        }
      }
      else if (sub === 'fetch') {
        result = { output: 'From https://github.com/user/repo\n * [new branch]      main       -> origin/main', type: 'success' };
      }
      else if (sub === 'pull') {
        result = { output: 'Updating a1b2c3..d4e5f6\nFast-forward\n README.md | 2 ++\n 1 file changed, 2 insertions(+)', type: 'success' };
      }
      else if (sub === 'rebase') {
        const targetBranchName = parts[2];
        if (!targetBranchName) {
            result = { output: 'fatal: Please specify a branch to rebase onto.', type: 'error' };
        } else if (targetBranchName === '-i') {
             result = { output: 'Successfully rebased and updated refs/heads/main.', type: 'success' };
        } else {
             // Real rebase logic: Move current branch's unique commits to top of target branch
             const targetBranch = gameState.repo.branches.find(b => b.name === targetBranchName);
             const currentBranch = gameState.repo.branches.find(b => b.name === gameState.repo.head);
             
             if (targetBranch && currentBranch) {
                 // Simplified: Just reparent the current branch's tip to the target branch's tip
                 // In a real app we'd need to find the common ancestor and move all commits in between.
                 // For this game, let's assume we are moving the *entire* feature chain to the end of main.
                 
                 // Find commits on current branch that are NOT on target branch (simplified)
                 const currentTip = gameState.repo.commits.find(c => c.id === currentBranch.commitId);
                 
                 if (currentTip) {
                     // Update the parent of the first unique commit on this branch to be the target branch tip
                     // This is tricky without a full graph traversal. 
                     // Let's just "move" the current tip's parent to the target tip for visual effect
                     
                     setGameState(prev => ({
                         ...prev,
                         repo: {
                             ...prev.repo,
                             commits: prev.repo.commits.map(c => 
                                 c.id === currentTip.id ? { ...c, parentId: targetBranch.commitId } : c
                             )
                         }
                     }));
                 }
                 
                 result = { output: `Successfully rebased and updated refs/heads/${gameState.repo.head}.`, type: 'success' };
             } else {
                 result = { output: `fatal: branch '${targetBranchName}' not found.`, type: 'error' };
             }
        }
      }
      else if (sub === 'log') {
        // Traverse backwards from HEAD
        let logOutput = '';
        let currentCommitId = '';
        
        // Resolve HEAD
        const headBranch = gameState.repo.branches.find(b => b.name === gameState.repo.head);
        if (headBranch) {
            currentCommitId = headBranch.commitId;
        } else {
            // Detached HEAD?
            // For now assume HEAD is always a branch name in this simple game
        }

        let count = 0;
        while (currentCommitId && count < 10) {
            const commit = gameState.repo.commits.find(c => c.id === currentCommitId);
            if (!commit) break;
            
            logOutput += `commit ${commit.id}\nAuthor: User <user@example.com>\nDate:   Mon Jan 1 00:00:00 2024 +0000\n\n    ${commit.message}\n\n`;
            currentCommitId = commit.parentId || '';
            count++;
        }
        
        if (!logOutput) logOutput = 'No commits yet.';
        result = { output: logOutput.trim(), type: 'info' };
      }
      else if (sub === 'reset') {
        const mode = parts.includes('--soft') ? 'soft' : parts.includes('--hard') ? 'hard' : 'mixed';
        const target = parts[parts.length - 1]; // Simplified parsing
        
        // In a real implementation we'd resolve 'HEAD~1' etc.
        // For simulation, if they type HEAD~1, we just move back one commit
        if (target.includes('HEAD~')) {
            const count = parseInt(target.split('~')[1]) || 1;
            // Logic to find ancestor would go here. 
            // For now, let's just simulate success message and state update if needed for specific chapters
            result = { output: `HEAD is now at ${target} (simulated)`, type: 'success' };
        } else {
            result = { output: `HEAD is now at ${target} (simulated)`, type: 'success' };
        }
      }
      else if (sub === 'cherry-pick') {
        const hash = parts[2];
        if (hash) {
            // Find commit
            const commit = gameState.repo.commits.find(c => c.id === hash);
            if (commit) {
                const newCommit: Commit = {
                    id: Math.random().toString(36).substring(7),
                    message: commit.message,
                    parentId: gameState.repo.branches.find(b => b.name === gameState.repo.head)?.commitId || null,
                    branch: gameState.repo.head
                };
                setGameState(prev => ({
                    ...prev,
                    repo: {
                        ...prev.repo,
                        commits: [...prev.repo.commits, newCommit],
                        branches: prev.repo.branches.map(b => b.name === prev.repo.head ? { ...b, commitId: newCommit.id } : b)
                    }
                }));
                result = { output: `[${gameState.repo.head} ${newCommit.id}] ${commit.message}`, type: 'success' };
            } else {
                result = { output: `fatal: bad revision '${hash}'`, type: 'error' };
            }
        } else {
            result = { output: 'usage: git cherry-pick <commit>', type: 'error' };
        }
      }
      else if (sub === 'revert') {
         // Simplified revert
         result = { output: 'Revert successful (simulated)', type: 'success' };
      }
      else if (sub === 'bisect') {
         if (parts[2] === 'start') {
             setGameState(prev => ({ ...prev, repo: { ...prev.repo, bisecting: true } }));
             result = { output: 'Bisecting: 0 revisions left to test after this (roughly 0 steps)', type: 'success' };
         } else if (parts[2] === 'good' || parts[2] === 'bad') {
             result = { output: 'Bisecting: 0 revisions left to test after this (roughly 0 steps)', type: 'success' };
         } else if (parts[2] === 'reset') {
             setGameState(prev => ({ ...prev, repo: { ...prev.repo, bisecting: false } }));
             result = { output: 'Already on \'main\'', type: 'success' };
         } else {
             result = { output: 'usage: git bisect [start|good|bad|reset]', type: 'error' };
         }
      }
      else if (sub === 'reflog') {
         // Simulate reflog output
         result = { output: 'a1b2c3 HEAD@{0}: commit: Initial commit', type: 'info' };
      }
      else {
        result = { output: `git: '${sub}' is not a git command. See 'git --help'.`, type: 'error' };
      }
    } else if (cmd === 'clear') {
      setHistory([]);
      return;
    } else if (cmd === 'ls') {
      result = { output: gameState.repo.workingDirectory.join('  '), type: 'info' };
    } else if (cmd === 'pwd') {
      result = { output: '/home/user/project', type: 'info' };
    } else if (cmd === 'history') {
      const historyOutput = history.map((h, i) => `${i + 1}  ${h.command}`).join('\n');
      result = { output: historyOutput, type: 'info' };
    } else {
      result = { output: `${cmd}: command not found`, type: 'error' };
    }

    setGameState(prev => ({
      ...prev,
      commandHistory: [...prev.commandHistory, trimmed]
    }));
    setHistory(prev => [...prev, { command: trimmed, result }]);
  }, [gameState, currentChapterIndex, currentTaskIndex, history]); // Added history to dependencies

  // Check for task completion whenever gameState changes
  useEffect(() => {
    const currentChapter = chapters[currentChapterIndex];
    if (!currentChapter) return;

    const currentTask = currentChapter.tasks[currentTaskIndex];
    if (!currentTask) {
        if (currentChapterIndex < chapters.length - 1) {
            setCurrentChapterIndex(prev => prev + 1);
            setCurrentTaskIndex(0);
        }
        return;
    }

    if (currentTask.validate(gameState)) {
        setCurrentTaskIndex(prev => prev + 1);
    }
  }, [gameState, currentChapterIndex, currentTaskIndex]);

  const resetChapter = useCallback(() => {
    const currentChapter = chapters[currentChapterIndex];
    if (currentChapter) {
      setGameState(prev => ({
        ...prev,
        repo: {
          ...INITIAL_STATE.repo,
          ...currentChapter.initialState
        },
        commandHistory: [],
        outputHistory: []
      }));
      setHistory([]);
      setCurrentTaskIndex(0);
    }
  }, [currentChapterIndex]);

  return (
    <GameContext.Provider value={{
      history,
      executeCommand,
      gameState,
      currentChapterIndex,
      currentTaskIndex,
      resetChapter
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
