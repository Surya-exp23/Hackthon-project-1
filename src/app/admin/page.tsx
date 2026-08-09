'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, CheckCircle2, Clock, TrendingUp, List, Map, BarChart2, LogOut, ChevronRight, Zap, Users } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { PriorityGauge } from '@/components/ui/PriorityGauge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SEVERITY_COLORS: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E' };
const STATUS_COLORS: Record<string, string> = { open: '#3B82F6', assigned: '#7C6CF6', in_progress: '#EAB308', resolved: '#22C55E' };

function MetricCard({ value, label, sub, icon, color, animate = true }: any) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate || typeof value !== 'number') return;
    let start = 0;
    const end = value;
    const duration = 800;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, animate]);

  const displayValue = typeof value === 'number' && animate ? count : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
      style={{ padding: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{sub}</span>}
      </div>
      <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color, lineHeight: 1, marginBottom: 4 }}>
        {displayValue}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</p>
    </motion.div>
  );
}

function PriorityQueue({ reports }: { reports: any[] }) {
  const SEVERITY_DOT: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E' };
  const top10 = [...reports].filter(r => r.status !== 'resolved').sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 10);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="var(--medium)" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Priority Queue</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Top {top10.length} open issues</span>
      </div>
      <div>
        {top10.length === 0
          ? <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No open issues 🎉</p>
          : top10.map((r, i) => (
            <Link href={`/admin/issues/${r._id}`} key={r._id} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>#{i + 1}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_DOT[r.severity] || '#ccc', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {(r.category || 'Issue').replace('_', ' ')}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {r.relatedReports?.length > 0 ? `${r.relatedReports.length} duplicates · ` : ''}{r.address || 'Unknown location'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: SEVERITY_DOT[r.severity] || '#ccc' }}>{r.priorityScore}</p>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin' && user.role !== 'department') { router.push('/dashboard'); return; }
    const fetchData = async () => {
      try {
        const [rData, aData] = await Promise.all([
          apiClient.get('/reports'),
          apiClient.get('/analytics'),
        ]);
        setReports(rData.reports || []);
        setAnalytics(aData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => { await logout(); router.push('/'); };

  const totals = analytics?.totals || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 30 }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
            <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 28, height: 28 }} />
            <span style={{ fontWeight: 800, fontSize: 15 }}>CivicLens</span>
          </Link>
          <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: 'var(--critical-dim)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--critical)', letterSpacing: '0.05em' }}>ADMIN PANEL</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { href: '/admin', icon: <TrendingUp size={16} />, label: 'Overview', active: true },
            { href: '/admin/issues', icon: <List size={16} />, label: 'Issues Queue' },
            { href: '/admin/map', icon: <Map size={16} />, label: 'City Map' },
            { href: '/admin/analytics', icon: <BarChart2 size={16} />, label: 'Analytics' },
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
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time overview of all civic issues across the city.</p>
        </div>

        {/* Primary metric row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <MetricCard value={totals.total || 0} label="Total Reports" icon={<AlertTriangle size={18} color="var(--accent)" />} color="var(--accent)" />
          <MetricCard value={totals.critical || 0} label="Critical Issues" icon={<AlertTriangle size={18} color="var(--critical)" />} color="var(--critical)" />
          <MetricCard value={totals.pending || 0} label="Pending Action" icon={<Clock size={18} color="var(--medium)" />} color="var(--medium)" />
          <MetricCard value={totals.resolved || 0} label="Resolved" icon={<CheckCircle2 size={18} color="var(--low)" />} color="var(--low)" />
        </div>

        {/* Secondary metric row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>AVG RESOLUTION</p>
            <p style={{ fontSize: 22, fontWeight: 800 }}>{analytics?.avgResolutionHours || 0}h</p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>RESOLUTION RATE</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--low)' }}>{analytics?.resolutionRate ? `${Math.round(analytics.resolutionRate * 100)}%` : '—'}</p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>TOP CATEGORY</p>
            <p style={{ fontSize: 14, fontWeight: 700 }}>
              {analytics?.byCategory?.[0]?.category?.replace('_', ' ') || '—'}
            </p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>TOTAL CITIZENS</p>
            <p style={{ fontSize: 22, fontWeight: 800 }}>
              {new Set(reports.map(r => r.userId?._id || r.userId)).size}
            </p>
          </div>
        </div>

        {/* Main grid: Priority queue + charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20, marginBottom: 20 }}>
          <PriorityQueue reports={reports} />

          {/* Status donut */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Issues by Status</p>
            {analytics?.byStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {analytics.byStatus.map((entry: any, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || '#555'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                    formatter={(v: any, name: any) => [v, name?.replace('_', ' ')]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="skeleton" style={{ height: 220, borderRadius: 8 }} />}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {Object.entries(STATUS_COLORS).map(([s, c]) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category bar chart */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Issues by Category</p>
          {analytics?.byCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.byCategory} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => v?.replace('_', ' ')?.slice(0, 12)} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                  formatter={(v: any) => [v, 'Issues']}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />}
        </div>
      </main>
    </div>
  );
}
