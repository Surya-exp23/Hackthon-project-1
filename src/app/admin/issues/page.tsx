'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, TrendingUp, List, Map, BarChart2, LogOut, ChevronRight, Loader2, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

const SEVERITY_DOT: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E' };
const STATUS_COLORS: Record<string, string> = { open: '#3B82F6', assigned: '#7C6CF6', in_progress: '#EAB308', resolved: '#22C55E' };

export default function AdminIssuesPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin' && user.role !== 'department') { router.push('/dashboard'); return; }
    
    apiClient.get('/reports')
      .then(data => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading) return null;

  const handleLogout = async () => { await logout(); router.push('/'); };

  const filteredReports = reports.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = !search || (r.category?.toLowerCase() || '').includes(search.toLowerCase()) || (r.address?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            { href: '/admin/issues', icon: <List size={16} />, label: 'Issues Queue', active: true },
            { href: '/admin/map', icon: <Map size={16} />, label: 'City Map', active: false },
            { href: '/admin/analytics', icon: <BarChart2 size={16} />, label: 'Analytics', active: false },
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
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>Issues Queue</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage and track all reported civic issues.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search issues..." 
                className="input" 
                style={{ paddingLeft: 36, width: 240 }} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="input" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 140 }}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
          ) : filteredReports.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              No issues found matching your filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>ID / TYPE</th>
                  <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>LOCATION</th>
                  <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>DATE</th>
                  <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>PRIORITY</th>
                  <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.sort((a, b) => b.priorityScore - a.priorityScore).map((r, i) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{(r.category || 'Issue').replace('_', ' ')}</p>
                      <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{r._id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />
                        {r.address || 'Unknown'}
                      </p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[r.status] || '#ccc' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{r.status?.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_DOT[r.severity] || '#ccc' }} />
                        <span style={{ fontSize: 14, fontWeight: 800, color: SEVERITY_DOT[r.severity] || '#ccc' }}>{r.priorityScore}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link href={`/admin/issues/${r._id}`} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: 12 }}>
                        View
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
