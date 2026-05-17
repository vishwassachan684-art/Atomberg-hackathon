'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { type Goal } from '@/lib/mockData';
import { createGoal } from '@/app/actions';

interface KpiRow {
  id: number;
  name: string;
  target: string;
}

const thrustAreas = [
  'Financial Performance',
  'Operational Efficiency',
  'Product Development',
  'Customer Satisfaction',
  'People & Culture',
  'Safety & Compliance',
];

const uomTypes = [
  { value: 'min_numeric', label: 'Numeric (Higher is better)' },
  { value: 'min_percent', label: 'Percentage (Higher is better)' },
  { value: 'max_numeric', label: 'Numeric (Lower is better)' },
  { value: 'max_percent', label: 'Percentage (Lower is better)' },
  { value: 'timeline', label: 'Timeline (Date-based)' },
  { value: 'zero', label: 'Zero-based (0 = Success)' },
];

export default function GoalCreationPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [thrustArea, setThrustArea] = useState('');
  const [uom, setUom] = useState('');
  const [target, setTarget] = useState('');
  const [weightage, setWeightage] = useState('');
  const [description, setDescription] = useState('');
  const [kpis, setKpis] = useState<KpiRow[]>([{ id: 1, name: '', target: '' }]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const maxTitleLength = 120;

  const addKpi = () => {
    setKpis((prev) => [...prev, { id: Date.now(), name: '', target: '' }]);
  };

  const removeKpi = (id: number) => {
    if (kpis.length > 1) {
      setKpis((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const updateKpi = (id: number, field: 'name' | 'target', value: string) => {
    setKpis((prev) => prev.map((k) => (k.id === id ? { ...k, [field]: value } : k)));
  };

  const handleSubmit = async (status: 'draft' | 'pending_approval') => {
    if (!title || !thrustArea || !uom || !target || !weightage) {
      setFeedback({ message: 'Please fill out all required fields marked with an asterisk (*).', type: 'error' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    const weight = Number(weightage);
    if (weight < 10 || weight > 100) {
      setFeedback({ message: 'Weightage for an individual goal must be between 10% and 100%.', type: 'error' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    try {
      const result = await createGoal({
        userId: 'u1',
        title,
        description,
        thrustArea,
        uom: uom as any,
        target: Number(target) || 0,
        weightage: weight,
        status,
        progressStatus: 'not_started',
        isShared: false,
      });

      if (!result) {
        throw new Error("Failed to write goal to SQLite");
      }
      
      setFeedback({
        message: status === 'pending_approval' 
          ? 'Goal submitted for manager approval successfully!' 
          : 'Goal draft saved successfully!',
        type: 'success'
      });

      setTimeout(() => {
        setFeedback(null);
        router.push('/goals');
      }, 1500);
    } catch (err) {
      setFeedback({ message: 'Failed to create goal. Please try again.', type: 'error' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath="/goals/create" />

      {/* Main Content — offset by sidebar on desktop */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* ─── Page Header ─── */}
          <div className="mb-8 animate-fade-in">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-body-md text-on-surface-variant hover:text-secondary transition-colors mb-3"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              <span>Back to Goals</span>
            </button>
            <h1 className="text-headline-lg text-gradient">Create New Goal</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">
              Define your SMART goal parameters to align with organizational objectives.
            </p>
          </div>

          {/* Feedback Toast */}
          {feedback && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${
              feedback.type === 'success' 
                ? 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]' 
                : 'bg-error-container border border-error/20 text-on-error-container'
            }`}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                {feedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="text-body-md font-medium">{feedback.message}</p>
            </div>
          )}

          {/* ─── Grid: Form + Sidebar ─── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* ─── Left: Form ─── */}
            <div className="xl:col-span-8 space-y-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
              {/* Goal Details Card */}
              <div className="card glass-panel elevation-subtle">
                <h2 className="text-headline-sm text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>edit_note</span>
                  Goal Details
                </h2>
                <div className="space-y-5">
                  {/* Goal Title */}
                  <div>
                    <label className="text-label-sm text-on-surface block mb-1.5" htmlFor="goalTitle">
                      Goal Title <span className="text-error">*</span>
                    </label>
                    <input
                      id="goalTitle"
                      type="text"
                      placeholder="e.g., Increase Q3 Enterprise Sales by 15%"
                      required
                      value={title}
                      maxLength={maxTitleLength}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field"
                    />
                    <div className="flex justify-between mt-1.5">
                      <span className="text-body-sm text-on-surface-variant">Keep it concise and action-oriented.</span>
                      <span className={`text-body-sm ${title.length >= maxTitleLength ? 'text-error' : 'text-on-surface-variant'}`}>
                        {title.length}/{maxTitleLength}
                      </span>
                    </div>
                  </div>

                  {/* Thrust Area & UoM — 2-col on md+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label-sm text-on-surface block mb-1.5" htmlFor="thrustArea">
                        Thrust Area <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="thrustArea"
                          value={thrustArea}
                          onChange={(e) => setThrustArea(e.target.value)}
                          className="input-field appearance-none pr-10"
                        >
                          <option value="">Select thrust area…</option>
                          {thrustAreas.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface block mb-1.5" htmlFor="uom">
                        Unit of Measurement <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="uom"
                          value={uom}
                          onChange={(e) => setUom(e.target.value)}
                          className="input-field appearance-none pr-10"
                        >
                          <option value="">Select UoM…</option>
                          {uomTypes.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Target & Weightage — 2-col on md+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label-sm text-on-surface block mb-1.5" htmlFor="target">
                        Target <span className="text-error">*</span>
                      </label>
                      <input
                        id="target"
                        type="text"
                        placeholder="e.g., 500000 or 95%"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface block mb-1.5" htmlFor="weightage">
                        Weightage (%) <span className="text-error">*</span>
                      </label>
                      <input
                        id="weightage"
                        type="number"
                        min={10}
                        max={100}
                        placeholder="Min 10%, Max 100%"
                        value={weightage}
                        onChange={(e) => setWeightage(e.target.value)}
                        className="input-field"
                      />
                      <span className="text-body-sm text-on-surface-variant mt-1 block">Min 10% per goal. Total must be 100%.</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-label-sm text-on-surface block mb-1.5" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      placeholder="Describe the strategic intent behind this goal…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Success Metrics Card */}
              <div className="card glass-panel elevation-subtle">
                <h2 className="text-headline-sm text-on-surface mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>monitoring</span>
                  Success Metrics (KPIs)
                </h2>

                <div className="space-y-3">
                  {kpis.map((kpi, index) => (
                    <div
                      key={kpi.id}
                      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg bg-surface-container-low/50 border border-outline-variant/50 animate-fade-in"
                    >
                      <span className="text-label-sm text-on-surface-variant w-6 shrink-0 hidden sm:block">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Metric name (e.g., Recurring Revenue)"
                        value={kpi.name}
                        onChange={(e) => updateKpi(kpi.id, 'name', e.target.value)}
                        className="input-field flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Target value"
                        value={kpi.target}
                        onChange={(e) => updateKpi(kpi.id, 'target', e.target.value)}
                        className="input-field sm:w-40"
                      />
                      <button
                        type="button"
                        onClick={() => removeKpi(kpi.id)}
                        disabled={kpis.length === 1}
                        className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addKpi}
                  className="mt-4 inline-flex items-center gap-1.5 text-secondary text-label-sm hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                  Add Another Metric
                </button>
              </div>

              {/* Mobile Actions (shown only on small screens) */}
              <div className="xl:hidden flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={() => handleSubmit('pending_approval')}
                  className="btn-primary flex-1 py-3"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                  Submit for Approval
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSubmit('draft')}
                  className="btn-secondary flex-1 py-3"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                  Save as Draft
                </button>
              </div>
            </div>

            {/* ─── Right: Sidebar Panels ─── */}
            <div className="xl:col-span-4 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {/* SMART Tips Card */}
              <div className="card glass-panel bg-surface-container-high border-none">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <h3 className="text-headline-sm text-on-surface">SMART Goal Tips</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { letter: 'S', title: 'Specific', desc: 'Clearly define what you want to accomplish.' },
                    { letter: 'M', title: 'Measurable', desc: 'Track progress with concrete metrics.' },
                    { letter: 'A', title: 'Achievable', desc: 'Set realistic goals within resources.' },
                    { letter: 'R', title: 'Relevant', desc: 'Align with organizational strategies.' },
                    { letter: 'T', title: 'Time-bound', desc: 'Set a clear deadline to create urgency.' },
                  ].map((item) => (
                    <li key={item.letter} className="flex gap-3">
                      <div className="w-7 h-7 rounded-md bg-secondary/15 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
                        {item.letter}
                      </div>
                      <div>
                        <strong className="text-label-sm text-on-surface block">{item.title}</strong>
                        <span className="text-body-sm text-on-surface-variant">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Validation Status Card */}
              <div className="card glass-panel">
                <h3 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>checklist</span>
                  Validation
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: 'Goal title filled', ok: title.length > 0 },
                    { label: 'Thrust area selected', ok: thrustArea.length > 0 },
                    { label: 'UoM selected', ok: uom.length > 0 },
                    { label: 'Target defined', ok: target.length > 0 },
                    { label: 'Weightage ≥ 10%', ok: Number(weightage) >= 10 },
                  ].map((v) => (
                    <li key={v.label} className="flex items-center gap-2.5">
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '18px',
                          fontVariationSettings: "'FILL' 1",
                          color: v.ok ? 'var(--color-success)' : 'var(--color-outline-variant)',
                        }}
                      >
                        {v.ok ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`text-body-md ${v.ok ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {v.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desktop Actions */}
              <div className="hidden xl:block card">
                <div className="flex flex-col gap-3">
                  <button 
                    type="button" 
                    onClick={() => handleSubmit('pending_approval')}
                    className="btn-primary w-full py-3"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                    Submit for Approval
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSubmit('draft')}
                    className="btn-secondary w-full py-3"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                    Save as Draft
                  </button>
                  <button 
                    type="button" 
                    onClick={() => router.push('/goals')}
                    className="w-full text-center text-error text-label-sm py-2 hover:underline transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

