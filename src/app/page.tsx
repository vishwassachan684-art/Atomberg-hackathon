'use client';

import Sidebar from '@/components/Sidebar';
import { computeProgressScore, getProgressColor, getProgressLabel, getStatusColor, getStatusLabel, Goal, CheckIn } from '@/lib/mockData';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getGoals, getCheckIns } from './actions';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { router.push('/login'); }
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      async function load() {
        const dbGoals = await getGoals();
        const dbCheckIns = await getCheckIns();
        setGoals(dbGoals);
        setCheckIns(dbCheckIns);
        setLoadingData(false);
      }
      load();
    }
  }, [status]);

  if (status === 'loading' || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-secondary animate-spin" />
      </div>
    );
  }

  const currentUser = session?.user;
  const userGoals = goals.filter((g) => g.userId === currentUser?.id);
  const totalWeightage = userGoals.reduce((sum, g) => sum + g.weightage, 0);

  const overallProgress = userGoals.reduce((sum, g) => {
    const checkIn = checkIns.find((c) => c.goalId === g.id && c.quarter === 'Q1');
    const score = checkIn ? computeProgressScore(g, checkIn.actualAchievement) : 0;
    return sum + (score * g.weightage) / 100;
  }, 0);

  const completedGoals = userGoals.filter((g) => g.progressStatus === 'completed').length;
  const atRiskGoals = userGoals.filter((g) => g.progressStatus === 'at_risk').length;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/" />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-headline-lg text-gradient">
              Welcome back, {currentUser?.name.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-1">
              Here&apos;s your goal performance overview for FY 2026-27.
            </p>
          </div>

          {/* ─── Stat Cards ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <StatCard icon="flag" label="Total Goals" value={userGoals.length.toString()} accent="secondary" />
            <StatCard icon="trending_up" label="Overall Progress" value={`${Math.round(overallProgress)}%`} accent="secondary" />
            <StatCard icon="check_circle" label="Completed" value={completedGoals.toString()} accent="success" />
            <StatCard icon="warning" label="At Risk" value={atRiskGoals.toString()} accent={atRiskGoals > 0 ? 'warning' : 'success'} />
          </div>

          {/* ─── Content Grid ─── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* Goals Table */}
            <div className="xl:col-span-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="card glass-panel elevation-subtle">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>flag</span>
                    My Goals
                  </h2>
                  <a href="/goals/create" className="btn-primary text-xs py-2 px-4">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                    New Goal
                  </a>
                </div>

                {/* Weightage bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-body-sm text-on-surface-variant mb-1.5">
                    <span>Total Weightage</span>
                    <span className={totalWeightage === 100 ? 'text-[#15803d] font-semibold' : 'text-error font-semibold'}>
                      {totalWeightage}% / 100%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${totalWeightage === 100 ? 'bg-secondary' : 'bg-error'}`}
                      style={{ width: `${Math.min(totalWeightage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Goals List */}
                <div className="space-y-3">
                  {userGoals.map((goal) => {
                    const checkIn = checkIns.find((c) => c.goalId === goal.id && c.quarter === 'Q1');
                    const score = checkIn ? computeProgressScore(goal, checkIn.actualAchievement) : 0;

                    return (
                      <div key={goal.id} className="p-4 rounded-lg border border-outline-variant/60 hover:border-secondary/40 hover:elevation-subtle transition-all group">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-body-md font-semibold text-on-surface truncate group-hover:text-secondary transition-colors">
                                {goal.title}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
                              <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>category</span>
                                {goal.thrustArea}
                              </span>
                              <span>·</span>
                              <span>{goal.weightage}% weight</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-label-sm px-2.5 py-1 rounded-md ${getProgressColor(goal.progressStatus)}`}>
                              {getProgressLabel(goal.progressStatus)}
                            </span>
                            <div className="w-16 text-right">
                              <span className="text-headline-sm text-secondary">{Math.round(score)}%</span>
                            </div>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full transition-all duration-700"
                            style={{ width: `${Math.round(score)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-4 space-y-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              {/* Current Cycle */}
              <div className="card glass-panel elevation-subtle">
                <h3 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>calendar_today</span>
                  Current Cycle
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Period</span>
                    <span className="text-on-surface font-medium">FY 2026-27</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Phase</span>
                    <span className="text-on-surface font-medium">Q1 Check-in</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Window</span>
                    <span className="text-on-surface font-medium">July 2026</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Goal Status</span>
                    <span className={`text-label-sm px-2 py-0.5 rounded ${getStatusColor('locked')}`}>
                      {getStatusLabel('locked')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card glass-panel">
                <h3 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>bolt</span>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <a href="/checkins" className="sidebar-link hover:bg-surface-container">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>fact_check</span>
                    <span>Submit Q1 Check-in</span>
                  </a>
                  <a href="/goals/create" className="sidebar-link hover:bg-surface-container">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
                    <span>Create New Goal</span>
                  </a>
                  <a href="/reports" className="sidebar-link hover:bg-surface-container">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bar_chart</span>
                    <span>View Reports</span>
                  </a>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card glass-panel">
                <h3 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>history</span>
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    { text: 'Q1 check-in submitted for "API Response Time"', time: '2 hours ago', icon: 'check' },
                    { text: 'Manager approved all 5 goals', time: '3 days ago', icon: 'thumb_up' },
                    { text: 'Goal sheet submitted for approval', time: '1 week ago', icon: 'send' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-body-sm text-on-surface">{item.text}</p>
                        <p className="text-body-sm text-on-surface-variant">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  const accentMap: Record<string, string> = {
    secondary: 'text-secondary bg-secondary/10',
    success: 'text-[#15803d] bg-[#f0fdf4]',
    warning: 'text-[#b45309] bg-[#fffbeb]',
  };

  return (
    <div className="card glass-panel elevation-subtle">
      <div className={`w-10 h-10 rounded-lg ${accentMap[accent] || accentMap.secondary} flex items-center justify-center mb-3`}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{icon}</span>
      </div>
      <p className="text-headline-md text-on-surface">{value}</p>
      <p className="text-body-sm text-on-surface-variant mt-0.5">{label}</p>
    </div>
  );
}
