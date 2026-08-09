'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Bell, LogOut, Map, List, User, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { PriorityGauge } from '@/components/ui/PriorityGauge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';

const SEVERITY_COLOR: Record<string, string> = { critical: 'var(--critical)', high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };

function ReportCard({ report }: { report: any }) {
  const sev = report.severity || 'medium';
  return (
    <Link href={`/issues/${report._id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.12 }}
        className="card"
        style={{ padding: 16, minWidth: 220, cursor: 'pointer', transition: 'border-color 0.2s', borderColor: 'var(--border)' }}
      >
        {report.imageUrl && (
          <div style={{ height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
            <img src={report.imageUrl} alt={report.category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className={`badge badge-${sev}`}>{sev}</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: SEVERITY_COLOR[sev] }}>{report.priorityScore}</span>
        </div>
        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
          {(report.category || 'Issue').replace('_', ' ')}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={10} />
          {report.address || 'Location unknown'}
        </p>
        <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 6, background: 'var(--surface-2)' }}>
          <span className={`badge badge-${report.status}`} style={{ fontSize: 10 }}>{report.status?.replace('_', ' ')}</span>
        </div>
      </motion.div>
    </Link>
  );
}

function StatCard({ value, label, icon, color }: any) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const fetchData = async () => {
      try {
        const [rData, nData] = await Promise.all([
          apiClient.get('/reports'),
          apiClient.get('/notifications').catch(() => ({ notifications: [] })),
        ]);
        // Filter user's reports
        const myReports = rData.reports.filter((r: any) => r.userId?._id === user.id || r.userId === user.id);
        setReports(myReports);
        setNotifications(nData.notifications || []);
        setUnreadCount((nData.notifications || []).filter((n: any) => !n.read).length);
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const resolved = reports.filter(r => r.status === 'resolved').length;
  const pending = reports.filter(r => r.status !== 'resolved').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar navigation */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 30 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
            <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 30, height: 30 }} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>CivicLens</span>
          </Link>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {[
              { href: '/dashboard', icon: <List size={16} />, label: 'Dashboard', active: true },
              { href: '/explore', icon: <Map size={16} />, label: 'Explore Map' },
              { href: '/report', icon: <Plus size={16} />, label: 'Report Issue' },
              { href: '/profile', icon: <User size={16} />, label: 'Profile' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                  background: item.active ? 'var(--accent-dim)' : 'transparent',
                  color: item.active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: item.active ? 700 : 500, fontSize: 14,
                  transition: 'all 0.15s ease',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ padding: '12px', borderRadius: 10, background: 'var(--surface-2)', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 8, color: 'var(--text-muted)' }}>
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, marginLeft: 220, padding: '32px', overflowY: 'auto' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Here's an overview of your civic activity.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Notification bell */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowNotifs(!showNotifs)} className="btn btn-secondary btn-sm" style={{ position: 'relative' }}>
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--critical)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 320, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-elevated)', zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Notifications</div>
                    {notifications.length === 0
                      ? <p style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No notifications yet</p>
                      : notifications.slice(0, 5).map((n: any) => (
                        <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: n.read ? 'transparent' : 'var(--accent-dim)' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.title}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.message}</p>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              <Link href="/report" className="btn btn-primary btn-sm">
                <Plus size={16} />
                New Report
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <StatCard value={reports.length} label="Total Reports" icon={<AlertTriangle size={20} color="var(--accent)" />} color="var(--accent)" />
            <StatCard value={pending} label="In Progress" icon={<Clock size={20} color="var(--medium)" />} color="var(--medium)" />
            <StatCard value={resolved} label="Resolved" icon={<CheckCircle2 size={20} color="var(--low)" />} color="var(--low)" />
            <StatCard value={reports.length > 0 ? `${Math.round((resolved / reports.length) * 100)}%` : '—'} label="Resolution Rate" icon={<TrendingUp size={20} color="var(--accent-2)" />} color="var(--accent-2)" />
          </div>

          {/* My Reports */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Reports</h2>
              <Link href="/explore" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View all on map →</Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', gap: 16 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ width: 220, height: 200 }} />)}
              </div>
            ) : reports.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>You haven't reported anything yet.</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>See something? Report it in under 30 seconds.</p>
                <Link href="/report" className="btn btn-primary" style={{ display: 'inline-flex' }}>Report an Issue</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {reports.map(r => <ReportCard key={r._id} report={r} />)}
              </div>
            )}
          </section>

          {/* Impact strip */}
          {reports.length > 0 && (
            <div style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent-dim), var(--accent-2-dim))', border: '1px solid rgba(59,130,246,0.15)' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                🌱 Your {reports.length} report{reports.length !== 1 ? 's' : ''} have contributed to civic awareness in your area. {resolved > 0 ? `${resolved} issue${resolved !== 1 ? 's' : ''} got resolved!` : ''}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
