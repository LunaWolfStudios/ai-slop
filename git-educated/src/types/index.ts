export interface Commit {
  id: string;
  message: string;
  parentId: string | null;
  branch?: string; // If this commit is the tip of a branch
}

export interface Branch {
  name: string;
  commitId: string;
}

export interface Remote {
  name: string;
  url: string;
}

export interface ReflogEntry {
  id: string;
  command: string;
  commitId: string;
}

export interface GameState {
  currentChapterId: string;
  repo: {
    commits: Commit[];
    branches: Branch[];
    head: string; // commit ID or branch name
    detachedHead: boolean;
    staging: string[]; // list of files
    workingDirectory: string[]; // list of files
    remotes: Remote[];
    isInitialized: boolean;
    reflog: ReflogEntry[];
    bisecting: boolean;
  };
  commandHistory: string[];
  outputHistory: { type: 'command' | 'output' | 'error' | 'success'; content: string }[];
  completedChapters: string[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  story?: string; // Background context
  tasks: Task[];
  initialState?: Partial<GameState['repo']>;
}

export interface Task {
  id: string;
  description: string;
  hint?: string;
  solution?: string;
  validate: (state: GameState) => boolean;
}
