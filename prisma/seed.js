require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const mockUsers = [
  { id: 'u1', name: 'Arjun Mehta', email: 'arjun@company.com', role: 'employee', department: 'Engineering', managerId: 'u4' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@company.com', role: 'employee', department: 'Sales', managerId: 'u4' },
  { id: 'u3', name: 'Ravi Kumar', email: 'ravi@company.com', role: 'employee', department: 'Engineering', managerId: 'u4' },
  { id: 'u4', name: 'Neha Gupta', email: 'neha@company.com', role: 'manager', department: 'Engineering' },
  { id: 'u5', name: 'Vikram Singh', email: 'vikram@company.com', role: 'admin', department: 'HR' },
];

const mockGoals = [
  {
    id: 'g1', userId: 'u1', title: 'Increase API Response Time by 40%',
    description: 'Optimize backend services to reduce average API response time from 250ms to 150ms.',
    thrustArea: 'Operational Efficiency', uom: 'max_numeric', target: 150, weightage: 30,
    status: 'locked', progressStatus: 'on_track', isShared: false, createdAt: new Date('2026-05-01T00:00:00Z'), approvedAt: new Date('2026-05-05T00:00:00Z'),
  },
  {
    id: 'g2', userId: 'u1', title: 'Launch Mobile App v2.0',
    description: 'Ship the redesigned mobile application with offline support and push notifications.',
    thrustArea: 'Product Development', uom: 'timeline', target: 0, weightage: 25,
    status: 'locked', progressStatus: 'on_track', isShared: false, createdAt: new Date('2026-05-01T00:00:00Z'), approvedAt: new Date('2026-05-05T00:00:00Z'),
  },
  {
    id: 'g3', userId: 'u1', title: 'Achieve Zero Production Incidents',
    description: 'Maintain zero critical production incidents through Q4.',
    thrustArea: 'Safety & Compliance', uom: 'zero', target: 0, weightage: 20,
    status: 'locked', progressStatus: 'completed', isShared: true, createdAt: new Date('2026-05-01T00:00:00Z'), approvedAt: new Date('2026-05-05T00:00:00Z'),
  },
  {
    id: 'g4', userId: 'u1', title: 'Improve Unit Test Coverage to 85%',
    description: 'Increase test coverage across all microservices from 62% to 85%.',
    thrustArea: 'Operational Efficiency', uom: 'min_percent', target: 85, weightage: 15,
    status: 'locked', progressStatus: 'at_risk', isShared: false, createdAt: new Date('2026-05-01T00:00:00Z'), approvedAt: new Date('2026-05-05T00:00:00Z'),
  },
  {
    id: 'g5', userId: 'u1', title: 'Complete AWS Solutions Architect Cert',
    description: 'Achieve AWS Solutions Architect Professional certification.',
    thrustArea: 'Professional Development', uom: 'timeline', target: 0, weightage: 10,
    status: 'locked', progressStatus: 'not_started', isShared: false, createdAt: new Date('2026-05-01T00:00:00Z'), approvedAt: new Date('2026-05-05T00:00:00Z'),
  },
  // Priya's goals (pending approval)
  {
    id: 'g6', userId: 'u2', title: 'Grow Enterprise Revenue by 25%',
    description: 'Expand enterprise client base and increase ARR by 25% YoY.',
    thrustArea: 'Financial Performance', uom: 'min_percent', target: 25, weightage: 35,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: new Date('2026-05-10T00:00:00Z'),
  },
  {
    id: 'g7', userId: 'u2', title: 'Close 12 New Enterprise Deals',
    description: 'Sign 12 new enterprise contracts with ACV > $50K each.',
    thrustArea: 'Financial Performance', uom: 'min_numeric', target: 12, weightage: 30,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: new Date('2026-05-10T00:00:00Z'),
  },
  {
    id: 'g8', userId: 'u2', title: 'Reduce Sales Cycle to 45 Days',
    description: 'Streamline the sales process to reduce average deal cycle from 60 to 45 days.',
    thrustArea: 'Operational Efficiency', uom: 'max_numeric', target: 45, weightage: 20,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: new Date('2026-05-10T00:00:00Z'),
  },
  {
    id: 'g9', userId: 'u2', title: 'Achieve 95% Customer Satisfaction',
    description: 'Maintain a CSAT score of 95% or above across all enterprise accounts.',
    thrustArea: 'Customer Satisfaction', uom: 'min_percent', target: 95, weightage: 10,
    status: 'pending_approval', progressStatus: 'not_started', isShared: false, createdAt: new Date('2026-05-10T00:00:00Z'),
  },
  // Ravi's goals
  {
    id: 'g10', userId: 'u3', title: 'Reduce Deployment Downtime to < 5min',
    description: 'Implement blue-green deployments to achieve near-zero downtime releases.',
    thrustArea: 'Operational Efficiency', uom: 'max_numeric', target: 5, weightage: 40,
    status: 'approved', progressStatus: 'on_track', isShared: false, createdAt: new Date('2026-05-02T00:00:00Z'), approvedAt: new Date('2026-05-06T00:00:00Z'),
  },
  {
    id: 'g11', userId: 'u3', title: 'Migrate 3 Services to Kubernetes',
    description: 'Containerize and migrate legacy services to the K8s cluster.',
    thrustArea: 'Product Development', uom: 'min_numeric', target: 3, weightage: 35,
    status: 'approved', progressStatus: 'on_track', isShared: false, createdAt: new Date('2026-05-02T00:00:00Z'), approvedAt: new Date('2026-05-06T00:00:00Z'),
  },
  {
    id: 'g12', userId: 'u3', title: 'Achieve Zero Security Vulnerabilities',
    description: 'Resolve all critical and high CVEs in production dependencies.',
    thrustArea: 'Safety & Compliance', uom: 'zero', target: 0, weightage: 25,
    status: 'approved', progressStatus: 'completed', isShared: true, createdAt: new Date('2026-05-02T00:00:00Z'), approvedAt: new Date('2026-05-06T00:00:00Z'),
  },
];

const mockCheckIns = [
  { id: 'c1', goalId: 'g1', userId: 'u1', quarter: 'Q1', actualAchievement: 190, progressStatus: 'on_track', managerComment: 'Good progress, keep optimizing DB queries.', updatedAt: new Date('2026-07-15T00:00:00Z') },
  { id: 'c2', goalId: 'g2', userId: 'u1', quarter: 'Q1', actualAchievement: 40, progressStatus: 'on_track', managerComment: 'On schedule for August launch.', updatedAt: new Date('2026-07-15T00:00:00Z') },
  { id: 'c3', goalId: 'g3', userId: 'u1', quarter: 'Q1', actualAchievement: 0, progressStatus: 'completed', managerComment: 'Excellent, zero incidents this quarter!', updatedAt: new Date('2026-07-15T00:00:00Z') },
  { id: 'c4', goalId: 'g4', userId: 'u1', quarter: 'Q1', actualAchievement: 68, progressStatus: 'at_risk', managerComment: 'Coverage is behind target. Need dedicated sprint.', updatedAt: new Date('2026-07-15T00:00:00Z') },
  { id: 'c5', goalId: 'g5', userId: 'u1', quarter: 'Q1', actualAchievement: 0, progressStatus: 'not_started', updatedAt: new Date('2026-07-15T00:00:00Z') },
];

async function main() {
  console.log('Clearing database tables...');
  await prisma.auditLog.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users...');
  const neha = mockUsers.find(u => u.id === 'u4');
  const vikram = mockUsers.find(u => u.id === 'u5');
  await prisma.user.create({ data: neha });
  await prisma.user.create({ data: vikram });

  const employees = mockUsers.filter(u => u.managerId === 'u4');
  for (const emp of employees) {
    await prisma.user.create({ data: emp });
  }

  console.log('Seeding Goals...');
  for (const goal of mockGoals) {
    await prisma.goal.create({ data: goal });
  }

  console.log('Seeding Checkins...');
  for (const checkIn of mockCheckIns) {
    await prisma.checkIn.create({ data: checkIn });
  }

  console.log('Seeding Audit Logs...');
  await prisma.auditLog.create({
    data: {
      userId: 'u4',
      goalId: 'g1',
      action: 'Goal Approved',
      details: 'Approved goal "Increase API Response Time by 40%" during general performance cycle.',
      createdAt: new Date('2026-05-05T00:00:00Z')
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: 'u4',
      goalId: 'g3',
      action: 'Goal Shared',
      details: 'Shared goal "Achieve Zero Production Incidents" globally across the Engineering department.',
      createdAt: new Date('2026-05-05T00:00:00Z')
    }
  });

  console.log('Database seeding successfully completed.');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
