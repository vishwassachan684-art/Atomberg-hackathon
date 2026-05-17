'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { computeProgressScore, getStatusColor, getStatusLabel, getProgressColor, getProgressLabel, getUomLabel, type Goal, type CheckIn } from '@/lib/mockData';
import { getGoals, getCheckIns } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MyGoalsPage() {
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
      async function loadData() {
        const goalsData = await getGoals();
        const checkinsData = await getCheckIns();
        setGoals(goalsData);
        setCheckIns(checkinsData);
        setLoadingData(false);
      }
      loadData();
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
  const totalWeightage = userGoals.reduce((s, g) => s + g.weightage, 0);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/goals" />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-headline-lg text-gradient">My Goals</h1>
              <p className="text-body-lg text-on-surface-variant mt-1">
                {userGoals.length} goals · {totalWeightage}% total weightage
              </p>
            </div>
            <a href="/goals/create" className="btn-primary shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Create Goal
            </a>
          </div>

          {/* Weightage Summary Bar */}
          <div className="card glass-panel elevation-subtle mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase">Total Weightage Allocation</p>
                <p className="text-headline-md text-on-surface mt-1">
                  {totalWeightage}%
                  <span className={`text-body-md ml-2 ${totalWeightage === 100 ? 'text-[#15803d]' : 'text-error'}`}>
                    {totalWeightage === 100 ? '✓ Valid' : `⚠ Must equal 100%`}
                  </span>
                </p>
              </div>
              <div className="flex gap-4">
                {['Financial Performance', 'Operational Efficiency', 'Product Development', 'Safety & Compliance', 'Professional Development'].map((area) => {
                  const areaGoals = userGoals.filter((g) => g.thrustArea === area);
                  if (areaGoals.length === 0) return null;
                  const areaWeight = areaGoals.reduce((s, g) => s + g.weightage, 0);
                  return (
                    <div key={area} className="text-center hidden lg:block">
                      <p className="text-headline-sm text-secondary">{areaWeight}%</p>
                      <p className="text-body-sm text-on-surface-variant truncate max-w-[100px]">{area.split(' ')[0]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 h-3 bg-surface-container rounded-full overflow-hidden flex">
              {userGoals.map((g, i) => {
                const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
                return (
                  <div
                    key={g.id}
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${g.weightage}%`,
                      backgroundColor: colors[i % colors.length],
                      borderRight: i < userGoals.length - 1 ? '2px solid white' : undefined,
                    }}
                    title={`${g.title}: ${g.weightage}%`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {userGoals.map((g, i) => {
                const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
                return (
                  <div key={g.id} className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                    <span className="truncate max-w-[120px]">{g.title.split(' ').slice(0, 3).join(' ')}…</span>
                    <span className="font-medium">{g.weightage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goals Grid */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {userGoals.map((goal) => {
              const checkIn = checkIns.find((c) => c.goalId === goal.id && c.quarter === 'Q1');
              const score = checkIn ? computeProgressScore(goal, checkIn.actualAchievement) : 0;

              return (
                <div key={goal.id} className="card glass-panel elevation-subtle hover:border-secondary/40 transition-all group">
                  {/* Top Row */}
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>flag</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-body-lg font-semibold text-on-surface group-hover:text-secondary transition-colors">
                            {goal.title}
                          </h3>
                          <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{goal.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-label-sm px-2.5 py-1 rounded-md ${getStatusColor(goal.status)}`}>
                        {getStatusLabel(goal.status)}
                      </span>
                      <span className={`text-label-sm px-2.5 py-1 rounded-md ${getProgressColor(goal.progressStatus)}`}>
                        {getProgressLabel(goal.progressStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetaItem label="Thrust Area" value={goal.thrustArea} />
                    <MetaItem label="UoM" value={getUomLabel(goal.uom)} />
                    <MetaItem label="Target" value={goal.uom === 'zero' ? '0 incidents' : goal.target.toString()} />
                    <MetaItem label="Weightage" value={`${goal.weightage}%`} />
                  </div>

                  {/* Progress */}
                  {checkIn && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-body-sm text-on-surface-variant">Q1 Progress</span>
                        <span className="text-label-sm text-secondary">{Math.round(score)}%</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${Math.round(score)}%` }} />
                      </div>
                      {checkIn.managerComment && (
                        <div className="mt-3 p-3 rounded-lg bg-surface-container-low/50 border-l-2 border-secondary">
                          <p className="text-body-sm text-on-surface-variant italic">&quot;{checkIn.managerComment}&quot;</p>
                          <p className="text-label-sm text-on-surface-variant mt-1">— Manager feedback</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label-sm text-on-surface-variant uppercase">{label}</p>
      <p className="text-body-md text-on-surface font-medium mt-0.5">{value}</p>
    </div>
  );
}
