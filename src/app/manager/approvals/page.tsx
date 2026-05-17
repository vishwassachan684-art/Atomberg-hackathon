'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { mockUsers, getStatusColor, getStatusLabel, getUomLabel, type Goal, type GoalStatus, type User } from '@/lib/mockData';
import { getGoals, getUsers, updateGoalStatus, batchUpdateGoalStatus } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ManagerApprovalsPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { router.push('/login'); }
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ goalId: string; action: string } | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      async function loadData() {
        const activeGoals = await getGoals();
        const activeUsers = await getUsers();
        setGoals(activeGoals);
        setUsers(activeUsers);
        setLoadingData(false);
      }
      loadData();
    }
  }, [status]);

  useEffect(() => {
    const activeUsersList = users.length > 0 ? users : mockUsers;
    const arjun = activeUsersList.find((u) => u.name === 'Arjun Mehta');
    if (arjun) {
      setExpandedEmployee(arjun.id);
    }
  }, [users]);

  const managerUser = session?.user;
  const activeUsersList = users.length > 0 ? users : mockUsers;
  const teamMembers = activeUsersList.filter((u) => u.managerId === managerUser?.id);
  const teamGoals = goals.filter((g) => teamMembers.some((m) => m.id === g.userId));

  // Group goals by employee
  const goalsByEmployee = teamMembers.map((member) => ({
    member,
    goals: teamGoals.filter((g) => g.userId === member.id),
  }));

  const pendingCount = teamGoals.filter((g) => g.status === 'pending_approval').length;
  const approvedCount = teamGoals.filter((g) => g.status === 'approved' || g.status === 'locked').length;

  const handleAction = async (goalId: string, action: 'approve' | 'reject') => {
    const newStatus: GoalStatus = action === 'approve' ? 'approved' : 'rejected';
    await updateGoalStatus(goalId, newStatus, managerUser?.email || 'neha@company.com');
    
    const activeGoals = await getGoals();
    setGoals(activeGoals);

    setActionFeedback({ goalId, action: action === 'approve' ? 'approved' : 'returned for rework' });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const filteredByEmployee = goalsByEmployee.map((group) => ({
    ...group,
    goals: group.goals.filter((g) => {
      if (filter === 'pending') return g.status === 'pending_approval';
      if (filter === 'approved') return g.status === 'approved' || g.status === 'locked';
      return true;
    }),
  })).filter((group) => group.goals.length > 0);

  if (status === 'loading' || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/manager/approvals" userRole="manager" userName={managerUser?.name || 'Manager'} />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-headline-lg text-gradient">Team Goal Approvals</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">
              Review, edit, and approve goal sheets submitted by your team members.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="card glass-panel elevation-subtle text-center">
              <p className="text-headline-md text-on-surface">{teamMembers.length}</p>
              <p className="text-body-sm text-on-surface-variant">Team Members</p>
            </div>
            <div className="card glass-panel elevation-subtle text-center">
              <p className="text-headline-md text-on-surface">{teamGoals.length}</p>
              <p className="text-body-sm text-on-surface-variant">Total Goals</p>
            </div>
            <div className="card glass-panel elevation-subtle text-center">
              <p className="text-headline-md text-[#b45309]">{pendingCount}</p>
              <p className="text-body-sm text-on-surface-variant">Pending</p>
            </div>
            <div className="card glass-panel elevation-subtle text-center">
              <p className="text-headline-md text-[#15803d]">{approvedCount}</p>
              <p className="text-body-sm text-on-surface-variant">Approved</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 animate-fade-in" style={{ animationDelay: '0.08s' }}>
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-label-sm capitalize transition-all ${
                  filter === f ? 'bg-primary text-on-primary elevation-subtle' : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                {f === 'all' ? 'All Goals' : f === 'pending' ? `Pending (${pendingCount})` : `Approved (${approvedCount})`}
              </button>
            ))}
          </div>

          {/* Action Feedback */}
          {actionFeedback && (
            <div className="mb-4 p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-body-md flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Goal has been {actionFeedback.action} successfully.
            </div>
          )}

          {/* Employee Goal Groups */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {filteredByEmployee.map(({ member, goals }) => {
              const isExpanded = expandedEmployee === member.id;
              const memberPending = goals.filter((g) => g.status === 'pending_approval' || g.status === 'locked').length;
              const totalWeight = goals.reduce((s, g) => s + g.weightage, 0);
              const isWeightInvalid = totalWeight !== 100;

              return (
                <div key={member.id} className="card glass-panel elevation-subtle overflow-hidden">
                  {/* Employee Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedEmployee(isExpanded ? null : member.id)}
                    className="w-full flex items-center justify-between p-0 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-semibold text-sm">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-body-lg font-semibold text-on-surface">{member.name}</h3>
                        <p className="text-body-sm text-on-surface-variant">
                          {member.department} · {goals.length} goals · {totalWeight}% weight
                          {memberPending > 0 && (
                            <span className="ml-2 text-label-sm px-2 py-0.5 rounded bg-[#fffbeb] text-[#b45309]">
                              {memberPending} pending
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Goals Table */}
                  {isExpanded && (
                    <div className="mt-5 border-t border-outline-variant/50 pt-5">
                      {/* Weightage validation warning */}
                      {isWeightInvalid && (
                        <div className="mb-4 p-3 rounded-lg bg-[#fef2f2] border border-[#fca5a5] text-[#991b1b] text-body-sm flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
                          Weights must total 100% (currently {totalWeight}%). Approval unavailable: sheet approvals are blocked because the total weightage must equal exactly 100%.
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-outline-variant">
                              <th className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4">Goal</th>
                              <th className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4 hidden sm:table-cell">Thrust Area</th>
                              <th className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4 hidden md:table-cell">UoM</th>
                              <th className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4">Target</th>
                              <th className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4">Weight</th>
                              <th className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4">Status</th>
                              <th className="text-label-sm text-on-surface-variant uppercase pb-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/40">
                            {goals.map((goal) => (
                              <tr key={goal.id} className="hover:bg-surface-container-low/30 transition-colors">
                                <td className="py-3 pr-4">
                                  <p className="text-body-md font-medium text-on-surface">{goal.title}</p>
                                  <p className="text-body-sm text-on-surface-variant sm:hidden">{goal.thrustArea}</p>
                                </td>
                                <td className="py-3 pr-4 text-body-sm text-on-surface-variant hidden sm:table-cell">{goal.thrustArea}</td>
                                <td className="py-3 pr-4 text-body-sm text-on-surface-variant hidden md:table-cell">{getUomLabel(goal.uom)}</td>
                                <td className="py-3 pr-4 text-body-md text-on-surface font-medium">{goal.uom === 'zero' ? '0' : goal.target}</td>
                                <td className="py-3 pr-4 text-body-md text-on-surface font-medium">{goal.weightage}%</td>
                                <td className="py-3 pr-4">
                                  <span className={`text-label-sm px-2 py-1 rounded-md ${getStatusColor(goal.status)}`}>
                                    {getStatusLabel(goal.status)}
                                  </span>
                                </td>
                                <td className="py-3">
                                  {goal.status === 'pending_approval' || goal.status === 'locked' ? (
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        disabled={isWeightInvalid}
                                        onClick={() => handleAction(goal.id, 'approve')}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                          isWeightInvalid 
                                            ? 'opacity-30 cursor-not-allowed bg-surface-container text-on-surface-variant' 
                                            : 'bg-[#f0fdf4] text-[#15803d] hover:bg-[#dcfce7]'
                                        }`}
                                        title={isWeightInvalid ? "Approvals are blocked until sheet weight totals 100%" : "Approve"}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAction(goal.id, 'reject')}
                                        className="p-1.5 rounded-lg bg-error-container/30 text-error hover:bg-error-container/50 transition-colors"
                                        title="Return for rework"
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-body-sm text-on-surface-variant">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Bulk Actions */}
                      {memberPending > 0 && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/50 flex flex-col sm:flex-row gap-3 justify-end">
                          <button 
                            type="button" 
                            onClick={async () => {
                              const pendingIds = goals.filter((g) => g.userId === member.id && (g.status === 'pending_approval' || g.status === 'locked')).map((g) => g.id);
                              await batchUpdateGoalStatus(pendingIds, 'rejected', managerUser?.email || 'neha@company.com');
                              const activeGoals = await getGoals();
                              setGoals(activeGoals);
                              setActionFeedback({ goalId: 'bulk', action: 'returned for rework' });
                              setTimeout(() => setActionFeedback(null), 3000);
                            }}
                            className="btn-secondary text-sm py-2"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>undo</span>
                            Return All for Rework
                          </button>
                          <button
                            type="button"
                            disabled={isWeightInvalid}
                            onClick={async () => {
                              const pendingIds = goals.filter((g) => g.userId === member.id && (g.status === 'pending_approval' || g.status === 'locked')).map((g) => g.id);
                              await batchUpdateGoalStatus(pendingIds, 'approved', managerUser?.email || 'neha@company.com');
                              const activeGoals = await getGoals();
                              setGoals(activeGoals);
                              setActionFeedback({ goalId: 'bulk', action: 'approved' });
                              setTimeout(() => setActionFeedback(null), 3000);
                            }}
                            className={`btn-primary text-sm py-2 ${
                              isWeightInvalid ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                            }`}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>done_all</span>
                            Approve All ({memberPending})
                          </button>
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


