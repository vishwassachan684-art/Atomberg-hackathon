'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Preset for Hackathon speed
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    } else {
      // Redirect to dashboard on success
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card glass-panel elevation-medium animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '24px' }}>target</span>
          </div>
          <h1 className="text-headline-lg text-gradient">GoalAlign</h1>
          <p className="text-body-md text-on-surface-variant mt-2">Sign in to your workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-md text-center animate-slide-in">
              {error}
            </div>
          )}
          
          <div>
            <label className="text-label-sm text-on-surface-variant uppercase mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="arjun@company.com"
              required
            />
          </div>
          
          <div>
            <label className="text-label-sm text-on-surface-variant uppercase mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 py-3">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
          <p className="text-label-sm text-on-surface-variant mb-3">Hackathon Demo Accounts</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-medium cursor-help" title="Employee Role">
              arjun@company.com
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-medium cursor-help" title="Manager Role">
              priya@company.com
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-medium cursor-help" title="Admin Role">
              neha@company.com
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-3 italic">Password is preset to password123</p>
        </div>
      </div>
    </div>
  );
}
