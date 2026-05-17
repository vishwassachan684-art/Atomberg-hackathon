// ─── Types ───
export type GoalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'locked';
export type ProgressStatus = 'not_started' | 'on_track' | 'at_risk' | 'completed';
export type UomType = 'min_numeric' | 'min_percent' | 'max_numeric' | 'max_percent' | 'timeline' | 'zero';
export type UserRole = 'employee' | 'manager' | 'admin';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
  avatar?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: UomType;
  target: number;
  weightage: number;
  status: GoalStatus;
  progressStatus: ProgressStatus;
  isShared: boolean;
  createdAt: string;
  approvedAt?: string;
}

export interface CheckIn {
  id: string;
  goalId: string;
  quarter: Quarter;
  actualAchievement: number;
  progressStatus: ProgressStatus;
  managerComment?: string;
  updatedAt: string;
}

// ─── Mock Users ───
export const mockUsers: User[] = [
  { id: 'u1', name: 'Arjun Mehta', email: 'arjun@company.com', role: 'employee', department: 'Engineering', managerId: 'u4' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@company.com', role: 'employee', department: 'Sales', managerId: 'u4' },
  { id: 'u3', name: 'Ravi Kumar', email: 'ravi@company.com', role: 'employee', department: 'Engineering', managerId: 'u4' },
  { id: 'u4', name: 'Neha Gupta', email: 'neha@company.com', role: 'manager', department: 'Engineering' },
  { id: 'u5', name: 'Vikram Singh', email: 'vikram@company.com', role: 'admin', department: 'HR' },
];

// ─── Mock Goals ───
export const mockGoals: Goal[] = [
  {
    id: 'g1', userId: 'u1', title: 'Increase API Response Time by 40%',
    description: 'Optimize backend services to reduce average API response time from 250ms to 150ms.',
    thrustArea: 'Operational Efficiency', uom: 'max_numeric', target: 150, weightage: 30,
    status: 'locked', progressStatus: 'on_track', isShared: false, createdAt: '2026-05-01', approvedAt: '2026-05-05',
  },
  {
    id: 'g2', userId: 'u1', title: 'Launch Mobile App v2.0',
    description: 'Ship the redesigned mobile application with offline support and push notifications.',
    thrustArea: 'Product Development', uom: 'timeline', target: 0, weightage: 25,
    status: 'locked', progressStatus: 'on_track', isShared: false, createdAt: '2026-05-01', approvedAt: '2026-05-05',
  },
  {
    id: 'g3', userId: 'u1', title: 'Achieve Zero Production Incidents',
    description: 'Maintain zero critical production incidents through Q4.',
    thrustArea: 'Safety & Compliance', uom: 'zero', target: 0, weightage: 20,
    status: 'locked', progressStatus: 'completed', isShared: true, createdAt: '2026-05-01', approvedAt: '2026-05-05',
  },
  {
    id: 'g4', userId: 'u1', title: 'Improve Unit Test Coverage to 85%',
    description: 'Increase test coverage across all microservices from 62% to 85%.',
    thrustArea: 'Operational Efficiency', uom: 'min_percent', target: 85, weightage: 15,
    status: 'locked', progressStatus: 'at_risk', isShared: false, createdAt: '2026-05-01', approvedAt: '2026-05-05',
  },
  {
    id: 'g5', userId: 'u1', title: 'Complete AWS Solutions Architect Cert',
    description: 'Achieve AWS Solutions Architect Professional certification.',
    thrustArea: 'Professional Development', uom: 'timeline', target: 0, weightage: 10,
    status: 'locked', progressStatus: 'not_started', isShared: false, createdAt: '2026-05-01', approvedAt: '2026-05-05',
  },
  // Priya's goals (pending approval)
  {
    id: 'g6', userId: 'u2', title: 'Grow Enterprise Revenue by 25%',
    description: 'Expand enterprise client base and increase ARR by 25% YoY.',
    thrustArea: 'Financial Performance', uom: 'min_percent', target: 25, weightage: 35,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: '2026-05-10',
  },
  {
    id: 'g7', userId: 'u2', title: 'Close 12 New Enterprise Deals',
    description: 'Sign 12 new enterprise contracts with ACV > $50K each.',
    thrustArea: 'Financial Performance', uom: 'min_numeric', target: 12, weightage: 30,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: '2026-05-10',
  },
  {
    id: 'g8', userId: 'u2', title: 'Reduce Sales Cycle to 45 Days',
    description: 'Streamline the sales process to reduce average deal cycle from 60 to 45 days.',
    thrustArea: 'Operational Efficiency', uom: 'max_numeric', target: 45, weightage: 20,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: '2026-05-10',
  },
  {
    id: 'g9', userId: 'u2', title: 'Achieve 95% Customer Satisfaction',
    description: 'Maintain a CSAT score of 95% or above across all enterprise accounts.',
    thrustArea: 'Customer Satisfaction', uom: 'min_percent', target: 95, weightage: 10,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: '2026-05-10',
  },
  // Ravi's goals
  {
    id: 'g10', userId: 'u3', title: 'Reduce Deployment Downtime to < 5min',
    description: 'Implement blue-green deployments to achieve near-zero downtime releases.',
    thrustArea: 'Operational Efficiency', uom: 'max_numeric', target: 5, weightage: 40,
    status: 'approved', progressStatus: 'on_track', isShared: false, createdAt: '2026-05-02', approvedAt: '2026-05-06',
  },
  {
    id: 'g11', userId: 'u3', title: 'Migrate 3 Services to Kubernetes',
    description: 'Containerize and migrate legacy services to the K8s cluster.',
    thrustArea: 'Product Development', uom: 'min_numeric', target: 3, weightage: 35,
    status: 'approved', progressStatus: 'on_track', isShared: false, createdAt: '2026-05-02', approvedAt: '2026-05-06',
  },
  {
    id: 'g12', userId: 'u3', title: 'Achieve Zero Security Vulnerabilities',
    description: 'Resolve all critical and high CVEs in production dependencies.',
    thrustArea: 'Safety & Compliance', uom: 'zero', target: 0, weightage: 25,
    status: 'approved', progressStatus: 'completed', isShared: true, createdAt: '2026-05-02', approvedAt: '2026-05-06',
  },
];

// ─── Mock Check-ins ───
export const mockCheckIns: CheckIn[] = [
  { id: 'c1', goalId: 'g1', quarter: 'Q1', actualAchievement: 190, progressStatus: 'on_track', managerComment: 'Good progress, keep optimizing DB queries.', updatedAt: '2026-07-15' },
  { id: 'c2', goalId: 'g2', quarter: 'Q1', actualAchievement: 40, progressStatus: 'on_track', managerComment: 'On schedule for August launch.', updatedAt: '2026-07-15' },
  { id: 'c3', goalId: 'g3', quarter: 'Q1', actualAchievement: 0, progressStatus: 'completed', managerComment: 'Excellent, zero incidents this quarter!', updatedAt: '2026-07-15' },
  { id: 'c4', goalId: 'g4', quarter: 'Q1', actualAchievement: 68, progressStatus: 'at_risk', managerComment: 'Coverage is behind target. Need dedicated sprint.', updatedAt: '2026-07-15' },
  { id: 'c5', goalId: 'g5', quarter: 'Q1', actualAchievement: 0, progressStatus: 'not_started', updatedAt: '2026-07-15' },
];

// ─── Helper: Compute Progress Score ───
export function computeProgressScore(goal: Goal, actual: number): number {
  switch (goal.uom) {
    case 'min_numeric':
    case 'min_percent':
      return goal.target > 0 ? Math.min((actual / goal.target) * 100, 100) : 0;
    case 'max_numeric':
    case 'max_percent':
      return actual > 0 ? Math.min((goal.target / actual) * 100, 100) : 100;
    case 'timeline':
      // Simplified: % complete based on actual value (0-100)
      return Math.min(actual, 100);
    case 'zero':
      return actual === 0 ? 100 : 0;
    default:
      return 0;
  }
}

// ─── Helper: Status Color / Label ───
export function getStatusColor(status: GoalStatus): string {
  const map: Record<GoalStatus, string> = {
    draft: 'bg-surface-container text-on-surface-variant',
    pending_approval: 'bg-[#fffbeb] text-[#b45309]',
    approved: 'bg-[#f0fdf4] text-[#15803d]',
    rejected: 'bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]',
    locked: 'bg-surface-container-high text-on-surface',
  };
  return map[status] || '';
}

export function getStatusLabel(status: GoalStatus): string {
  const map: Record<GoalStatus, string> = {
    draft: 'Draft',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Returned for Rework',
    locked: 'Locked',
  };
  return map[status] || status;
}

export function getProgressColor(status: ProgressStatus): string {
  const map: Record<ProgressStatus, string> = {
    not_started: 'bg-surface-container text-on-surface-variant',
    on_track: 'bg-[#f0fdf4] text-[#15803d]',
    at_risk: 'bg-[#fff7ed] text-[#c2410c]',
    completed: 'bg-[#eff6ff] text-[#1d4ed8]',
  };
  return map[status] || '';
}

export function getProgressLabel(status: ProgressStatus): string {
  const map: Record<ProgressStatus, string> = {
    not_started: 'Not Started',
    on_track: 'On Track',
    at_risk: 'At Risk',
    completed: 'Completed',
  };
  return map[status] || status;
}

export function getStoredGoals(): Goal[] {
  if (typeof window === 'undefined') return mockGoals;
  try {
    const stored = localStorage.getItem('goal_align_goals');
    if (!stored) {
      localStorage.setItem('goal_align_goals', JSON.stringify(mockGoals));
      return mockGoals;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to read stored goals from localStorage:", e);
    return mockGoals;
  }
}

export function saveStoredGoals(goals: Goal[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('goal_align_goals', JSON.stringify(goals));
    } catch (e) {
      console.error("Failed to save goals to localStorage:", e);
    }
  }
}

export function getStoredCheckIns(): CheckIn[] {
  if (typeof window === 'undefined') return mockCheckIns;
  try {
    const stored = localStorage.getItem('goal_align_checkins');
    if (!stored) {
      localStorage.setItem('goal_align_checkins', JSON.stringify(mockCheckIns));
      return mockCheckIns;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to read stored checkins from localStorage:", e);
    return mockCheckIns;
  }
}

export function saveStoredCheckIns(checkins: CheckIn[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('goal_align_checkins', JSON.stringify(checkins));
    } catch (e) {
      console.error("Failed to save checkins to localStorage:", e);
    }
  }
}

export function getUomLabel(uom: UomType): string {
  const map: Record<UomType, string> = {
    min_numeric: 'Numeric ↑',
    min_percent: 'Percent ↑',
    max_numeric: 'Numeric ↓',
    max_percent: 'Percent ↓',
    timeline: 'Timeline',
    zero: 'Zero-based',
  };
  return map[uom] || uom;
}

