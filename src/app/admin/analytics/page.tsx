'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, List, Map, BarChart2, LogOut, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = { open: '#3B82F6', assigned: '#7C6CF6', in_progress: '#EAB308', resolved: '#22C55E' };
const SEVERITY_COLORS: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E' };

export default function AdminAnalyticsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin' && user.role !== 'department') { router.push('/dashboard'); return; }
    
    apiClient.get('/analytics')
      .then(data => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading) return null;

  const handleLogout = async () => { await logout(); router.push('/'); };

  const totals = analytics?.totals || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 30 }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
            <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 28, height: 28 }} />
            <span style={{ fontWeight: 800, fontSize: 15 }}>CivicLens</span>
          </Link>
          <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: 'var(--critical-dim)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--critical)', letterSpacing: '0.05em' }}>ADMIN PANEL</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { href: '/admin', icon: <TrendingUp size={16} />, label: 'Overview', active: false },
            { href: '/admin/issues', icon: <List size={16} />, label: 'Issues Queue', active: false },
            { href: '/admin/map', icon: <Map size={16} />, label: 'City Map', active: false },
            { href: '/admin/analytics', icon: <BarChart2 size={16} />, label: 'Analytics', active: true },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                background: item.active ? 'var(--accent-dim)' : 'transparent',
                color: item.active ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: item.active ? 700 : 500, fontSize: 14, transition: 'all 0.15s ease',
              }}
            >{item.icon}{item.label}</Link>
          ))}
        </nav>

        <div>
          <div style={{ padding: 12, borderRadius: 10, background: 'var(--surface-2)', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrator</p>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 8, color: 'var(--text-muted)' }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, padding: 32, overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>Deep Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Comprehensive breakdown of civic performance metrics.</p>
        </div>

        {/* Primary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="var(--accent)" />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL VOLUME</p>
            </div>
            <p style={{ fontSize: 36, fontWeight: 900 }}>{totals.total || 0}</p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--low-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="var(--low)" />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>RESOLUTION RATE</p>
            </div>
            <p style={{ fontSize: 36, fontWeight: 900 }}>{analytics?.resolutionRate ? `${Math.round(analytics.resolutionRate * 100)}%` : '0%'}</p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--medium-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="var(--medium)" />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>AVG RESOLUTION TIME</p>
            </div>
            <p style={{ fontSize: 36, fontWeight: 900 }}>{analytics?.avgResolutionHours || 0}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>h</span></p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--critical-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="var(--critical)" />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>CRITICAL BACKLOG</p>
            </div>
            <p style={{ fontSize: 36, fontWeight: 900, color: 'var(--critical)' }}>{totals.critical || 0}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Status Breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Workflow Distribution</h3>
            {analytics?.byStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analytics.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2}>
                    {analytics.byStatus.map((entry: any, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || '#555'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v: any, name: any) => [v, name?.replace('_', ' ')]} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>{value.replace('_', ' ')}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="skeleton" style={{ height: 300, borderRadius: 8 }} />}
          </div>

          {/* Category Breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Category Volume Analysis</h3>
            {analytics?.byCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.byCategory} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }} tickFormatter={v => v?.replace('_', ' ')} width={120} />
                  <Tooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v: any) => [v, 'Reports']} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="skeleton" style={{ height: 300, borderRadius: 8 }} />}
          </div>
        </div>

      </main>
    </div>
  );
}
