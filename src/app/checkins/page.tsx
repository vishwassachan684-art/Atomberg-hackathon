'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { computeProgressScore, getProgressColor, getProgressLabel, getUomLabel, type Goal, type CheckIn, type ProgressStatus, mockUsers } from '@/lib/mockData';
import { getGoals, getCheckIns, saveCheckIn } from '@/app/actions';

const quarters = [
  { key: 'Q1', label: 'Q1 Check-in', window: 'July 2026', active: true },
  { key: 'Q2', label: 'Q2 Check-in', window: 'October 2026', active: true },
  { key: 'Q3', label: 'Q3 Check-in', window: 'January 2027', active: true },
  { key: 'Q4', label: 'Q4 / Annual', window: 'March 2027', active: true },
] as const;

export default function CheckInsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [activeQuarter, setActiveQuarter] = useState<string>('Q1');
  
  const [achievements, setAchievements] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, ProgressStatus>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentUser = mockUsers[0];
  const userGoals = goals.filter((g) => g.userId === currentUser.id && (g.status === 'locked' || g.status === 'approved'));

  useEffect(() => {
    async function loadData() {
      const goalsData = await getGoals();
      const checkinsData = await getCheckIns();
      setGoals(goalsData);
      setCheckIns(checkinsData);
    }
    loadData();
  }, []);

  // Sync inputs when quarter, goals, or check-ins change
  useEffect(() => {
    if (userGoals.length === 0) return;
    const achs: Record<string, string> = {};
    const stats: Record<string, ProgressStatus> = {};
    
    userGoals.forEach((g) => {
      const ci = checkIns.find((c) => c.goalId === g.id && c.quarter === activeQuarter);
      achs[g.id] = ci ? ci.actualAchievement.toString() : '';
      stats[g.id] = ci ? ci.progressStatus : 'not_started';
    });
    
    setAchievements(achs);
    setStatuses(stats);
  }, [activeQuarter, goals, checkIns]);

  const handleSave = async (status: 'draft' | 'submitted') => {
    for (const g of userGoals) {
      const valStr = achievements[g.id];
      const valNum = valStr !== undefined && valStr !== '' ? Number(valStr) : 0;
      const progStatus = statuses[g.id] || 'not_started';

      await saveCheckIn({
        goalId: g.id,
        userId: currentUser.id,
        quarter: activeQuarter as any,
        actualAchievement: valNum,
        progressStatus: progStatus,
      });
    }

    const updatedCheckIns = await getCheckIns();
    const updatedGoals = await getGoals();
    setCheckIns(updatedCheckIns);
    setGoals(updatedGoals);
    
    setFeedback(`Check-in ${status === 'submitted' ? 'submitted' : 'draft saved'} successfully!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/checkins" />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-headline-lg text-gradient">Quarterly Check-ins</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">
              Log your actual achievements against planned targets for each quarter.
            </p>
          </div>

          {/* Quarter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {quarters.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => setActiveQuarter(q.key)}
                className={`px-4 py-2.5 rounded-lg text-label-sm whitespace-nowrap transition-all
                  ${activeQuarter === q.key ? 'bg-primary text-on-primary elevation-subtle' : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container'}
                `}
              >
                <span>{q.label}</span>
                <span className="ml-1.5 text-body-sm opacity-70">{q.window}</span>
              </button>
            ))}
          </div>



          {/* Goals Check-in Cards */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {userGoals.map((goal) => {
              const actual = parseFloat(achievements[goal.id] || '0') || 0;
              const score = computeProgressScore(goal, actual);
              const existingCheckIn = checkIns.find((c) => c.goalId === goal.id && c.quarter === activeQuarter);

              return (
                <div key={goal.id} className="card glass-panel elevation-subtle">
                  {/* Goal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>flag</span>
                      </div>
                      <div>
                        <h3 className="text-body-lg font-semibold text-on-surface">{goal.title}</h3>
                        <p className="text-body-sm text-on-surface-variant">
                          {goal.thrustArea} · {getUomLabel(goal.uom)} · Weight: {goal.weightage}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-headline-sm text-secondary">{Math.round(score)}%</span>
                    </div>
                  </div>

                  {/* Input Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-1.5">Planned Target</label>
                      <div className="input-field bg-surface-container cursor-not-allowed text-on-surface-variant">
                        {goal.uom === 'zero' ? '0 incidents' : goal.target}
                      </div>
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface block mb-1.5">Actual Achievement *</label>
                      <input
                        type="number"
                        value={achievements[goal.id] || ''}
                        onChange={(e) => setAchievements((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                        className="input-field"
                        placeholder="Enter actual value"
                      />
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface block mb-1.5">Status *</label>
                      <div className="relative">
                        <select
                          value={statuses[goal.id] || 'not_started'}
                          onChange={(e) => setStatuses((prev) => ({ ...prev, [goal.id]: e.target.value as ProgressStatus }))}
                          className="input-field appearance-none pr-10"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="on_track">On Track</option>
                          <option value="at_risk">At Risk</option>
                          <option value="completed">Completed</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-body-sm mb-1">
                      <span className="text-on-surface-variant">Progress</span>
                      <span className={`text-label-sm px-2 py-0.5 rounded ${getProgressColor(statuses[goal.id] || 'not_started')}`}>
                        {getProgressLabel(statuses[goal.id] || 'not_started')}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Math.round(score), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Manager Comment (if exists) */}
                  {existingCheckIn?.managerComment && (
                    <div className="mt-4 p-3 rounded-lg bg-surface-container-low/50 border-l-2 border-secondary">
                      <p className="text-body-sm text-on-surface-variant italic">&quot;{existingCheckIn.managerComment}&quot;</p>
                      <p className="text-label-sm text-on-surface-variant mt-1">— Manager feedback ({activeQuarter})</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <button 
              type="button" 
              onClick={() => handleSave('draft')}
              className="btn-secondary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
              Save Draft
            </button>
            <button 
              type="button" 
              onClick={() => handleSave('submitted')}
              className="btn-primary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
              Submit {activeQuarter} Check-in
            </button>
          </div>
        </div>
      </main>

      {/* Floating Success Notification Toast */}
      {feedback && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm p-4 rounded-xl bg-surface-container-highest border border-outline-variant shadow-lg flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[#15803d]">
            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div className="flex-1">
            <p className="text-body-md font-medium text-on-surface">{feedback}</p>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}
    </div>
  );
}

