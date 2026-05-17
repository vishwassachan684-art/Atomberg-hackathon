'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { computeProgressScore, getProgressLabel, getProgressColor, type Goal, type CheckIn, type User, mockUsers } from '@/lib/mockData';
import { getGoals, getCheckIns, getUsers } from '@/app/actions';

const barColors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

export default function ReportsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  useEffect(() => {
    async function loadData() {
      const goalsData = await getGoals();
      const checkinsData = await getCheckIns();
      const usersData = await getUsers();
      setGoals(goalsData);
      setCheckIns(checkinsData);
      setUsers(usersData);
    }
    loadData();
  }, []);

  const allGoals = goals;
  const allUsers = (users.length > 0 ? users : mockUsers).filter((u) => u.role === 'employee');
  const totalGoals = allGoals.length;
  const thrustAreas = [...new Set(allGoals.map((g) => g.thrustArea))];

  const thrustAreaData = thrustAreas.map((area) => {
    const ag = allGoals.filter((g) => g.thrustArea === area);
    const avg = ag.reduce((s, g) => {
      const ci = checkIns.find((c) => c.goalId === g.id);
      return s + (ci ? computeProgressScore(g, ci.actualAchievement) : 0);
    }, 0) / ag.length;
    return { area, count: ag.length, avg: Math.round(avg) };
  }).sort((a, b) => b.count - a.count);

  const empData = allUsers.map((u) => {
    const userGoals = allGoals.filter((g) => g.userId === u.id);
    const cis = userGoals.map((g) => checkIns.find((c) => c.goalId === g.id)).filter(Boolean);
    const prog = userGoals.reduce((s, g) => {
      const ci = checkIns.find((c) => c.goalId === g.id);
      return s + ((ci ? computeProgressScore(g, ci.actualAchievement) : 0) * g.weightage) / 100;
    }, 0);
    return { user: u, goals: userGoals.length, cis: cis.length, prog: Math.round(prog), done: userGoals.filter((g) => g.progressStatus === 'completed').length };
  });

  function handleExport() {
    try {
      const h = ['Employee','Dept','Goal','Thrust Area','Target','Actual','Progress','Status'];
      const rows = allGoals.map((g) => {
        const u = (users.length > 0 ? users : mockUsers).find((x) => x.id === g.userId);
        const ci = checkIns.find((c) => c.goalId === g.id);
        const sc = ci ? computeProgressScore(g, ci.actualAchievement) : 0;
        return [
          u?.name || '',
          u?.department || '',
          g.title || '',
          g.thrustArea || '',
          g.target !== undefined && g.target !== null ? g.target.toString() : '0',
          ci?.actualAchievement !== undefined && ci?.actualAchievement !== null ? ci.actualAchievement.toString() : '-',
          Math.round(sc) + '%',
          g.progressStatus ? getProgressLabel(g.progressStatus) : 'Not Started'
        ];
      });
      const csv = [h, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.position = 'absolute';
      a.style.left = '-9999px';
      a.style.top = '-9999px';
      a.style.width = '1px';
      a.style.height = '1px';
      a.href = url;
      a.download = 'goal_report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("CSV Export crashed", e);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/reports" />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-headline-lg text-gradient">Reports & Analytics</h1>
              <p className="text-body-lg text-on-surface-variant mt-1">Organization-wide goal performance insights.</p>
            </div>
            <button type="button" onClick={handleExport} className="btn-primary shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {[
              { l: 'Total Goals', v: totalGoals, i: 'flag', c: '#0ea5e9' },
              { l: 'Approved', v: allGoals.filter((g) => g.status === 'approved' || g.status === 'locked').length, i: 'verified', c: '#15803d' },
              { l: 'Pending', v: allGoals.filter((g) => g.status === 'pending_approval').length, i: 'pending', c: '#b45309' },
              { l: 'Completed', v: allGoals.filter((g) => g.progressStatus === 'completed').length, i: 'check_circle', c: '#1d4ed8' },
              { l: 'At Risk', v: allGoals.filter((g) => g.progressStatus === 'at_risk').length, i: 'warning', c: '#c2410c' },
            ].map((s) => (
              <div key={s.l} className="card glass-panel elevation-subtle text-center">
                <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${s.c}15` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: s.c }}>{s.i}</span>
                </div>
                <p className="text-headline-md text-on-surface">{s.v}</p>
                <p className="text-body-sm text-on-surface-variant">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            <div className="xl:col-span-8 space-y-6">
              {/* Thrust Area */}
              <div className="card glass-panel elevation-subtle animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-headline-sm text-on-surface mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>donut_large</span>
                  Goal Distribution by Thrust Area
                </h2>
                <div className="space-y-4">
                  {thrustAreaData.map((d, i) => (
                    <div key={d.area}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-body-md text-on-surface font-medium">{d.area}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-body-sm text-on-surface-variant">{d.count} goals</span>
                          <span className="text-label-sm font-semibold" style={{ color: barColors[i % barColors.length] }}>{d.avg}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.avg}%`, backgroundColor: barColors[i % barColors.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Table */}
              <div className="card glass-panel elevation-subtle animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <h2 className="text-headline-sm text-on-surface mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>people</span>
                  Employee Achievement Summary
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        {['Employee', 'Goals', 'Completed', 'Progress'].map((h) => (
                          <th key={h} className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/40">
                      {empData.map((d) => (
                        <tr key={d.user.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-semibold text-xs">
                                {d.user.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <span className="text-body-md text-on-surface font-medium">{d.user.name}</span>
                                <span className="text-body-sm text-on-surface-variant block">{d.user.department}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-body-md text-on-surface">{d.goals}</td>
                          <td className="py-3 pr-4 text-body-md text-on-surface">{d.done}/{d.goals}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-surface-container rounded-full overflow-hidden">
                                <div className="h-full bg-secondary rounded-full" style={{ width: `${d.prog}%` }} />
                              </div>
                              <span className="text-label-sm text-secondary w-10">{d.prog}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-4 space-y-6">
              <div className="card glass-panel elevation-subtle animate-fade-in" style={{ animationDelay: '0.12s' }}>
                <h3 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>fact_check</span>
                  Q1 Check-in Status
                </h3>
                <div className="space-y-3">
                  {empData.map((d) => (
                    <div key={d.user.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-xs">
                          {d.user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-body-md text-on-surface">{d.user.name.split(' ')[0]}</span>
                      </div>
                      <span className={`text-label-sm px-2 py-0.5 rounded-md ${d.cis === d.goals && d.goals > 0 ? 'bg-[#f0fdf4] text-[#15803d]' : d.cis > 0 ? 'bg-[#fffbeb] text-[#b45309]' : 'bg-surface-container text-on-surface-variant'}`}>
                        {d.cis === d.goals && d.goals > 0 ? 'Complete' : d.cis > 0 ? `${d.cis}/${d.goals}` : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card glass-panel elevation-subtle animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <h3 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>pie_chart</span>
                  Progress Breakdown
                </h3>
                <div className="space-y-3">
                  {(['completed', 'on_track', 'at_risk', 'not_started'] as const).map((st) => {
                    const cnt = allGoals.filter((g) => g.progressStatus === st).length;
                    const pct = totalGoals > 0 ? Math.round((cnt / totalGoals) * 100) : 0;
                    return (
                      <div key={st}>
                        <div className="flex justify-between mb-1">
                          <span className={`text-label-sm px-2 py-0.5 rounded-md ${getProgressColor(st)}`}>{getProgressLabel(st)}</span>
                          <span className="text-body-sm text-on-surface-variant">{cnt} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full bg-secondary/60 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
