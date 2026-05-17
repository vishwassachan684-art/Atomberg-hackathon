'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { mockUsers, mockGoals, type User, type Goal } from '@/lib/mockData';
import { getAuditLogs, getGoals, getUsers } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const cycles = [
  { id: 'cy1', name: 'FY 2026-27', status: 'active', goalSettingOpen: '2026-05-01', q1: 'Jul 2026', q2: 'Oct 2026', q3: 'Jan 2027', q4: 'Mar 2027' },
  { id: 'cy2', name: 'FY 2025-26', status: 'closed', goalSettingOpen: '2025-05-01', q1: 'Jul 2025', q2: 'Oct 2025', q3: 'Jan 2026', q4: 'Mar 2026' },
];

export default function AdminCyclesPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { router.push('/login'); }
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState<'cycles' | 'audit' | 'completion'>('cycles');

  useEffect(() => {
    if (status === 'authenticated') {
      async function loadData() {
        const logsData = await getAuditLogs();
        const goalsData = await getGoals();
        const usersData = await getUsers();
        setAuditLogs(logsData);
        setGoals(goalsData);
        setUsers(usersData);
        setLoadingData(false);
      }
      loadData();
    }
  }, [status]);

  const adminUser = session?.user;

  const activeUsersList = users.length > 0 ? users : mockUsers;
  const employees = activeUsersList.filter((u) => u.role === 'employee');
  const completionData = employees.map((e) => {
    const userGoals = goals.filter((g) => g.userId === e.id);
    const submitted = userGoals.length > 0;
    const approved = userGoals.length > 0 && userGoals.every((g) => g.status === 'approved' || g.status === 'locked');
    return { ...e, goalCount: userGoals.length, submitted, approved };
  });

  if (status === 'loading' || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/admin/cycles" userRole="admin" userName={adminUser?.name || 'Admin'} />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-headline-lg text-gradient">Admin Console</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">Manage cycles, audit logs, and organization-wide completion.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {[
              { key: 'cycles' as const, label: 'Cycle Management', icon: 'event_repeat' },
              { key: 'audit' as const, label: 'Audit Trail', icon: 'history' },
              { key: 'completion' as const, label: 'Completion Tracker', icon: 'checklist' },
            ].map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-sm whitespace-nowrap transition-all ${tab === t.key ? 'bg-primary text-on-primary elevation-subtle' : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Cycles Tab */}
          {tab === 'cycles' && (
            <div className="space-y-4 animate-fade-in">
              {cycles.map((cy) => (
                <div key={cy.id} className="card glass-panel elevation-subtle">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cy.status === 'active' ? 'bg-[#f0fdf4]' : 'bg-surface-container'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: cy.status === 'active' ? '#15803d' : '#64748b' }}>
                          {cy.status === 'active' ? 'play_circle' : 'lock'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-body-lg font-semibold text-on-surface">{cy.name}</h3>
                        <span className={`text-label-sm px-2 py-0.5 rounded-md ${cy.status === 'active' ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-surface-container text-on-surface-variant'}`}>
                          {cy.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    {cy.status === 'active' && (
                      <button type="button" className="btn-secondary text-sm py-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings</span>
                        Configure
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: 'Goal Setting', value: cy.goalSettingOpen },
                      { label: 'Q1 Check-in', value: cy.q1 },
                      { label: 'Q2 Check-in', value: cy.q2 },
                      { label: 'Q3 Check-in', value: cy.q3 },
                      { label: 'Q4 / Annual', value: cy.q4 },
                    ].map((p) => (
                      <div key={p.label} className="p-3 rounded-lg bg-surface-container-low/50">
                        <p className="text-label-sm text-on-surface-variant">{p.label}</p>
                        <p className="text-body-md text-on-surface font-medium mt-0.5">{p.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Audit Tab */}
          {tab === 'audit' && (
            <div className="card glass-panel elevation-subtle animate-fade-in">
              <h2 className="text-headline-sm text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>history</span>
                Audit Trail
              </h2>
              <div className="space-y-0 divide-y divide-outline-variant/40">
                {auditLogs.map((log) => {
                  const getLogType = (actionStr: string) => {
                    const act = actionStr.toLowerCase();
                    if (act.includes('unlock')) return { icon: 'lock_open', color: '#b45309' };
                    if (act.includes('approve') || act.includes('approved')) return { icon: 'check_circle', color: '#15803d' };
                    if (act.includes('reject') || act.includes('rework') || act.includes('returned')) return { icon: 'undo', color: '#c2410c' };
                    if (act.includes('cycle') || act.includes('open')) return { icon: 'event_repeat', color: '#0ea5e9' };
                    if (act.includes('share') || act.includes('shared')) return { icon: 'share', color: '#8b5cf6' };
                    return { icon: 'info', color: '#64748b' };
                  };
                  const { icon, color } = getLogType(log.action);
                  return (
                    <div key={log.id} className="flex gap-3 py-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color }}>{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-md text-on-surface">
                          {log.action} {log.details && <span className="text-body-sm text-on-surface-variant font-normal">— {log.details}</span>}
                        </p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">
                          By {log.userName} · {log.createdAt}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completion Tab */}
          {tab === 'completion' && (
            <div className="card glass-panel elevation-subtle animate-fade-in">
              <h2 className="text-headline-sm text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>checklist</span>
                Goal Submission Tracker
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      {['Employee', 'Department', 'Goals', 'Submitted', 'Approved', 'Action'].map((h) => (
                        <th key={h} className="text-label-sm text-on-surface-variant uppercase pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {completionData.map((emp) => (
                      <tr key={emp.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-semibold text-xs">
                              {emp.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="text-body-md text-on-surface font-medium">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-body-sm text-on-surface-variant">{emp.department}</td>
                        <td className="py-3 pr-4 text-body-md text-on-surface">{emp.goalCount}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-label-sm px-2 py-0.5 rounded-md ${emp.submitted ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-surface-container text-on-surface-variant'}`}>
                            {emp.submitted ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-label-sm px-2 py-0.5 rounded-md ${emp.approved ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-[#fffbeb] text-[#b45309]'}`}>
                            {emp.approved ? 'Yes' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button type="button" className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-colors" title="Unlock goals">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_open</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
