'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getAuditLogs } from '@/app/actions';
import { mockUsers } from '@/lib/mockData';

interface AuditLogRecord {
  id: string;
  goalId?: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
  userName: string;
  goalTitle?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // We hardcode the user role/name for testing purposes
  const adminUser = mockUsers.find(u => u.role === 'admin') || mockUsers[0];

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to load audit logs", error);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]';
    if (action.includes('Approved')) return 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]';
    if (action.includes('Rejected')) return 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]';
    if (action.includes('Check-in')) return 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
    return 'bg-surface-container text-on-surface-variant border-outline-variant';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Created')) return 'add_circle';
    if (action.includes('Approved')) return 'check_circle';
    if (action.includes('Rejected')) return 'cancel';
    if (action.includes('Check-in')) return 'fact_check';
    return 'update';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/admin/audit" userRole="admin" userName={adminUser.name} />
      
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-headline-lg text-gradient">System Audit Logs</h1>
              <p className="text-body-lg text-on-surface-variant mt-1">
                Monitor platform usage, goal approvals, and check-in history.
              </p>
            </div>
            
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full sm:w-64 bg-surface-container-low border-none"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="card glass-panel elevation-subtle animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-surface-container border-t-secondary animate-spin mb-4" />
                <p className="text-body-md text-on-surface-variant">Fetching secure logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>history_toggle_off</span>
                </div>
                <h3 className="text-headline-sm text-on-surface mb-1">No Logs Found</h3>
                <p className="text-body-md text-on-surface-variant max-w-sm">
                  {searchTerm ? 'Try adjusting your search filters.' : 'System activity will appear here once goals are created.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-lowest">
                      <th className="text-label-sm text-on-surface-variant uppercase py-4 px-4 font-semibold w-32">Date</th>
                      <th className="text-label-sm text-on-surface-variant uppercase py-4 px-4 font-semibold w-48">Actor</th>
                      <th className="text-label-sm text-on-surface-variant uppercase py-4 px-4 font-semibold w-48">Action Type</th>
                      <th className="text-label-sm text-on-surface-variant uppercase py-4 px-4 font-semibold">Activity Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-low/30 transition-colors group">
                        <td className="py-4 px-4 text-body-sm text-on-surface-variant whitespace-nowrap">
                          {log.createdAt}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-semibold text-xs shrink-0">
                              {log.userName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="text-body-md text-on-surface font-medium truncate">{log.userName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${getActionColor(log.action)}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{getActionIcon(log.action)}</span>
                            <span className="text-label-sm font-medium">{log.action}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-body-md text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                            {log.details}
                          </p>
                          {log.goalTitle && (
                            <p className="text-label-sm text-on-surface-variant mt-1 flex items-center gap-1 truncate">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>flag</span>
                              {log.goalTitle}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
