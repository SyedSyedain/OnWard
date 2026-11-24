export const ROLES = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    description: 'Interfaces, state and accessibility.',
    available: true,
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    description: 'APIs, business logic and data consistency.',
    available: true,
  },
  { id: 'data-analyst', title: 'Data Analyst', description: 'Queries, dashboards and insights.', available: false },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'Pipelines, deployments and monitoring.',
    available: false,
  },
];

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', description: 'A focused fix in one function.' },
  { id: 'medium', label: 'Medium', description: 'Requires reproducing the bug first.' },
  { id: 'hard', label: 'Hard', description: 'A data consistency problem across steps.' },
];

export const DIFFICULTY_LABELS = Object.fromEntries(DIFFICULTIES.map(({ id, label }) => [id, label]));
