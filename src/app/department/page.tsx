'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, CheckCircle2, Clock, List, Map, LogOut, ChevronRight, Briefcase, Menu, X } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { PriorityGauge } from '@/components/ui/PriorityGauge';

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
  const actionable = [...reports].filter(r => r.status !== 'resolved' && r.assignedDepartment).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 10);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase size={16} color="var(--medium)" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Department Active Queue</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Top {actionable.length} assigned issues</span>
      </div>
      <div>
        {actionable.length === 0
          ? <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No assigned issues 🎉</p>
          : actionable.map((r, i) => (
            <Link href={`/department/issues/${r._id}`} key={r._id} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_DOT[r.severity] || '#ccc', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {(r.category || 'Issue').replace('_', ' ')}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {r.assignedDepartment?.replace('_', ' ')} · {r.address || 'Unknown location'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`badge badge-${r.status}`} style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                    {r.status.replace('_', ' ')}
                  </span>
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

export default function DepartmentPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'department') {
      if (user.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
      return;
    }
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
  }, [user, authLoading, router]);

  if (authLoading) return null;

  const handleLogout = async () => { await logout(); router.push('/'); };

  const assignedReports = reports.filter(r => r.assignedDepartment);
  const inProgress = assignedReports.filter(r => r.status === 'in_progress').length;
  const resolved = assignedReports.filter(r => r.status === 'resolved').length;
  const critical = assignedReports.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:block" 
          style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Department Sidebar */}
      <aside className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Link href="/department" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
            <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 28, height: 28 }} />
            <span style={{ fontWeight: 800, fontSize: 15 }}>CivicLens</span>
          </Link>
          <button className="md:block" style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: 'var(--medium-dim)', border: '1px solid rgba(234,179,8,0.2)', marginBottom: 24, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--medium)', letterSpacing: '0.05em' }}>DEPARTMENT</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { href: '/department', icon: <Briefcase size={16} />, label: 'Overview', active: true },
            { href: '/department/issues', icon: <List size={16} />, label: 'Assigned Issues' },
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
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dept. Official</p>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 8, color: 'var(--text-muted)' }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="mobile-main" style={{ flex: 1, marginLeft: 220, padding: 32, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
          <button className="md:block" style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', marginTop: 4 }} onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>Department Portal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage issues routed to your department for execution.</p>
          </div>
        </div>

        {/* Metric row */}
        <div className="md:grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <MetricCard value={assignedReports.length} label="Total Assigned" icon={<AlertTriangle size={18} color="var(--accent)" />} color="var(--accent)" />
          <MetricCard value={critical} label="Critical Priority" icon={<AlertTriangle size={18} color="var(--critical)" />} color="var(--critical)" />
          <MetricCard value={inProgress} label="In Progress" icon={<Clock size={18} color="var(--medium)" />} color="var(--medium)" />
          <MetricCard value={resolved} label="Resolved" icon={<CheckCircle2 size={18} color="var(--low)" />} color="var(--low)" />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 20 }}>
          <PriorityQueue reports={reports} />
        </div>

      </main>
    </div>
  );
}
