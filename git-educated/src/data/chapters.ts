import { Chapter } from '../types';

export const chapters: Chapter[] = [
  {
    id: '1',
    title: 'Chapter 1: What is Git?',
    description: 'Git is a version control system that tracks changes in your files. Let\'s start by initializing a repository.',
    tasks: [
      {
        id: 'init',
        description: 'Initialize a new git repository.',
        solution: 'git init',
        validate: (state) => state.repo.isInitialized
      }
    ],
    initialState: {
      commits: [],
      branches: [],
      head: '',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: false
    }
  },
  {
    id: '2',
    title: 'Chapter 2: First Commit',
    description: 'Learn to stage and commit changes. Git tracks content, not just files.',
    tasks: [
      {
        id: 'status',
        description: 'Check the status of your repository.',
        solution: 'git status',
        validate: (state) => true
      },
      {
        id: 'add',
        description: 'Stage the file "file.txt".',
        solution: 'git add file.txt',
        validate: (state) => state.repo.staging.includes('file.txt')
      },
      {
        id: 'commit',
        description: 'Commit the staged changes with a message.',
        solution: 'git commit -m "Initial commit"',
        validate: (state) => state.repo.commits.length > 0
      }
    ],
    initialState: {
      commits: [],
      branches: [{ name: 'main', commitId: '' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: ['file.txt'],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '3',
    title: 'Chapter 3: Origin & Pushing',
    description: 'Learn about remote repositories. "origin" is just a name for a remote URL.',
    tasks: [
      {
        id: 'remote',
        description: 'Add a remote named "origin" with url "https://github.com/user/repo.git".',
        solution: 'git remote add origin https://github.com/user/repo.git',
        validate: (state) => state.repo.remotes.some(r => r.name === 'origin')
      },
      {
        id: 'push',
        description: 'Push your commits to the "origin" remote on branch "main".',
        solution: 'git push origin main',
        validate: (state) => true // We don't track remote state fully yet, so just running it is success
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' }
      ],
      branches: [{ name: 'main', commitId: 'a1b2c3' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: ['file.txt'],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '4',
    title: 'Chapter 4: Fetch vs Pull',
    description: 'Understand the difference between fetching and pulling. Fetching is safe; pulling merges immediately.',
    tasks: [
      {
        id: 'fetch',
        description: 'Fetch changes from origin.',
        solution: 'git fetch origin',
        validate: (state) => true
      },
      {
        id: 'rebase',
        description: 'Rebase your changes on top of origin/main (simulated).',
        solution: 'git rebase origin/main',
        validate: (state) => true
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' }
      ],
      branches: [{ name: 'main', commitId: 'a1b2c3' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: ['file.txt'],
      remotes: [{ name: 'origin', url: 'https://github.com/user/repo.git' }],
      isInitialized: true
    }
  },
  {
    id: '5',
    title: 'Chapter 5: Branching Out',
    description: 'Learn to create and switch branches.',
    tasks: [
      {
        id: 'branch',
        description: 'Create a new branch named "feature".',
        solution: 'git branch feature',
        validate: (state) => state.repo.branches.some(b => b.name === 'feature')
      },
      {
        id: 'checkout',
        description: 'Switch to the "feature" branch.',
        solution: 'git checkout feature',
        validate: (state) => state.repo.head === 'feature'
      },
      {
        id: 'commit-branch',
        description: 'Make a commit on the new branch.',
        solution: 'git add file.txt\ngit commit -m "Feature work"',
        validate: (state) => {
            const featureBranch = state.repo.branches.find(b => b.name === 'feature');
            const mainBranch = state.repo.branches.find(b => b.name === 'main');
            return !!(featureBranch && mainBranch && featureBranch.commitId !== mainBranch.commitId);
        }
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'd4e5f6', message: 'Update README', parentId: 'a1b2c3', branch: 'main' }
      ],
      branches: [{ name: 'main', commitId: 'd4e5f6' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: ['file.txt'], // Changed from feature.txt to file.txt per user request
      remotes: [{ name: 'origin', url: 'https://github.com/user/repo.git' }],
      isInitialized: true
    }
  },
  {
    id: '6',
    title: 'Chapter 6: Resetting Branches',
    description: 'Learn how to undo changes using git reset. Be careful with --hard!',
    tasks: [
      {
        id: 'reset-soft',
        description: 'Perform a soft reset to the previous commit.',
        solution: 'git reset --soft HEAD~1',
        validate: (state) => state.commandHistory.some(c => c.includes('git reset --soft'))
      },
      {
        id: 'reset-mixed',
        description: 'Perform a mixed reset (default).',
        solution: 'git reset --mixed',
        validate: (state) => state.commandHistory.some(c => c.includes('git reset --mixed') || c === 'git reset')
      },
      {
        id: 'reset-hard',
        description: 'Perform a hard reset. Warning: this deletes work!',
        solution: 'git reset --hard',
        validate: (state) => state.commandHistory.some(c => c.includes('git reset --hard'))
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'd4e5f6', message: 'WIP feature', parentId: 'a1b2c3', branch: 'main' }
      ],
      branches: [{ name: 'main', commitId: 'd4e5f6' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: ['file.txt'],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '7',
    title: 'Chapter 7: Linear vs Non-Linear History',
    description: 'Understand the difference between merge commits and rebase.',
    story: 'When working in teams, history can get messy with many merge commits (loops in the graph). Some teams prefer a "linear history" where every change appears to happen sequentially, making it easier to track changes and debug.',
    tasks: [
      {
        id: 'log',
        description: 'View the commit log to see the history.',
        solution: 'git log',
        validate: (state) => state.commandHistory.some(c => c === 'git log')
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'f1', message: 'Feature commit', parentId: 'a1b2c3', branch: 'feature' },
        { id: 'm1e2r3', message: 'Merge branch feature', parentId: 'a1b2c3', branch: 'main' } // Simplified merge representation
      ],
      branches: [{ name: 'main', commitId: 'm1e2r3' }, { name: 'feature', commitId: 'f1' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '8',
    title: 'Chapter 8: Rebasing',
    description: 'Rebase a feature branch onto main to keep history linear.',
    story: 'Imagine you started a feature branch a week ago. Since then, the main branch has moved forward. If you merge now, you get a merge commit. If you "rebase", you essentially pick up your work and move it to the tip of the new main branch, as if you started working today.',
    tasks: [
      {
        id: 'rebase',
        description: 'Rebase the current feature branch onto main.',
        solution: 'git rebase main',
        validate: (state) => state.commandHistory.some(c => c.includes('git rebase'))
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'm1', message: 'Main update 1', parentId: 'a1b2c3', branch: 'main' },
        { id: 'm2', message: 'Main update 2', parentId: 'm1', branch: 'main' },
        { id: 'f1', message: 'Feature work', parentId: 'a1b2c3', branch: 'feature' }
      ],
      branches: [
        { name: 'main', commitId: 'm2' },
        { name: 'feature', commitId: 'f1' }
      ],
      head: 'feature',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '9',
    title: 'Chapter 9: Interactive Rebase',
    description: 'Use interactive rebase to squash, reword, or drop commits.',
    story: 'Sometimes you make "wip" (work in progress) commits or typos. Interactive rebase lets you clean up your local history before sharing it with others, making you look like a disciplined coder.',
    tasks: [
      {
        id: 'rebase-i',
        description: 'Start an interactive rebase for the last 3 commits.',
        solution: 'git rebase -i HEAD~3',
        validate: (state) => state.commandHistory.some(c => c.includes('git rebase -i'))
      }
    ],
    initialState: {
      commits: [
        { id: 'c1', message: 'Commit 1', parentId: null, branch: 'main' },
        { id: 'c2', message: 'Commit 2 (typo)', parentId: 'c1', branch: 'main' },
        { id: 'c3', message: 'Commit 3 (wip)', parentId: 'c2', branch: 'main' }
      ],
      branches: [{ name: 'main', commitId: 'c3' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '10',
    title: 'Chapter 10: Cherry Picking',
    description: 'Apply a specific commit from another branch to your current branch.',
    story: 'You are working on main, but you realize a specific bug fix from the "feature" branch is needed right now. You don\'t want the whole branch, just that one commit. Cherry-pick lets you copy a commit to your current branch.',
    tasks: [
      {
        id: 'cherry-pick',
        description: 'Cherry-pick commit "f1e2a3" from the feature branch.',
        solution: 'git cherry-pick f1e2a3',
        validate: (state) => state.commandHistory.some(c => c.includes('git cherry-pick'))
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'f1e2a3', message: 'Important fix', parentId: 'a1b2c3', branch: 'feature' }
      ],
      branches: [
        { name: 'main', commitId: 'a1b2c3' },
        { name: 'feature', commitId: 'f1e2a3' }
      ],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '11',
    title: 'Chapter 11: Staging Specific Lines',
    description: 'Stage only parts of a file using patch mode.',
    tasks: [
      {
        id: 'add-p',
        description: 'Stage changes interactively.',
        solution: 'git add -p',
        validate: (state) => state.commandHistory.some(c => c.includes('git add -p'))
      }
    ],
    initialState: {
      commits: [{ id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' }],
      branches: [{ name: 'main', commitId: 'a1b2c3' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: ['file.txt'],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '12',
    title: 'Chapter 12: Reverting',
    description: 'Undo a commit by creating a new commit that reverses the changes.',
    tasks: [
      {
        id: 'revert',
        description: 'Revert the last commit.',
        solution: 'git revert HEAD',
        validate: (state) => state.commandHistory.some(c => c.includes('git revert'))
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'b2c3d4', message: 'Bad commit', parentId: 'a1b2c3', branch: 'main' }
      ],
      branches: [{ name: 'main', commitId: 'b2c3d4' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '13',
    title: 'Chapter 13: Conflict Resolution',
    description: 'Resolve merge conflicts when branches have diverging changes.',
    tasks: [
      {
        id: 'merge',
        description: 'Merge feature branch into main (simulated conflict).',
        solution: 'git merge feature',
        validate: (state) => state.commandHistory.some(c => c.includes('git merge'))
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'm1', message: 'Main change', parentId: 'a1b2c3', branch: 'main' },
        { id: 'f1', message: 'Feature change', parentId: 'a1b2c3', branch: 'feature' }
      ],
      branches: [
        { name: 'main', commitId: 'm1' },
        { name: 'feature', commitId: 'f1' }
      ],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: ['file.txt'],
      remotes: [],
      isInitialized: true
    }
  },
  {
    id: '14',
    title: 'Chapter 14: Git Bisect & Debugging',
    description: 'Use binary search to find the commit that introduced a bug.',
    tasks: [
      {
        id: 'bisect-start',
        description: 'Start git bisect.',
        solution: 'git bisect start',
        validate: (state) => state.repo.bisecting
      },
      {
        id: 'bisect-bad',
        description: 'Mark the current commit as bad.',
        solution: 'git bisect bad',
        validate: (state) => state.commandHistory.some(c => c === 'git bisect bad')
      },
      {
        id: 'bisect-good',
        description: 'Mark an older commit as good.',
        solution: 'git bisect good a1b2c3',
        validate: (state) => state.commandHistory.some(c => c.includes('git bisect good'))
      }
    ],
    initialState: {
      commits: [
        { id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' },
        { id: 'b1', message: 'Commit 1', parentId: 'a1b2c3', branch: 'main' },
        { id: 'b2', message: 'Commit 2', parentId: 'b1', branch: 'main' },
        { id: 'b3', message: 'Commit 3', parentId: 'b2', branch: 'main' }
      ],
      branches: [{ name: 'main', commitId: 'b3' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: true,
      bisecting: false
    }
  },
  {
    id: '15',
    title: 'Chapter 15: Git Reflog',
    description: 'Recover lost commits using the reflog.',
    tasks: [
      {
        id: 'reflog',
        description: 'View the reflog.',
        solution: 'git reflog',
        validate: (state) => state.commandHistory.some(c => c === 'git reflog')
      },
      {
        id: 'reset-reflog',
        description: 'Reset to a previous state using reflog.',
        solution: 'git reset --hard HEAD@{1}',
        validate: (state) => state.commandHistory.some(c => c.includes('git reset --hard HEAD@{'))
      }
    ],
    initialState: {
      commits: [{ id: 'a1b2c3', message: 'Initial commit', parentId: null, branch: 'main' }],
      branches: [{ name: 'main', commitId: 'a1b2c3' }],
      head: 'main',
      detachedHead: false,
      staging: [],
      workingDirectory: [],
      remotes: [],
      isInitialized: true,
      reflog: []
    }
  }
];
