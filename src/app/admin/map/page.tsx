'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, TrendingUp, List, Map, BarChart2, LogOut, ExternalLink, X } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

const MapComponent = dynamic(() => import('@/components/map/LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading map...</p>
    </div>
  )
});

const CATEGORIES = ['all', 'pothole', 'garbage_waste', 'streetlight', 'water_leakage', 'drainage', 'sidewalk', 'traffic_hazard'];
const STATUSES = ['all', 'open', 'assigned', 'in_progress', 'resolved'];

export default function AdminMapPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin' && user.role !== 'department') { router.push('/dashboard'); return; }
    
    apiClient.get('/map/issues')
      .then(data => setIssues(data.issues || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading) return null;

  const handleLogout = async () => { await logout(); router.push('/'); };

  const filtered = issues.filter(i => {
    if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && i.status !== selectedStatus) return false;
    return true;
  });

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
            { href: '/admin', icon: <TrendingUp size={16} />, label: 'Overview', active: false },
            { href: '/admin/issues', icon: <List size={16} />, label: 'Issues Queue', active: false },
            { href: '/admin/map', icon: <Map size={16} />, label: 'City Map', active: true },
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
      <main style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Filters Top Bar */}
        <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setSelectedCategory(c)}
                style={{
                  position: 'relative', padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', border: '1px solid', color: selectedCategory === c ? 'white' : 'var(--text-secondary)',
                  borderColor: selectedCategory === c ? 'transparent' : 'var(--border)', background: 'transparent',
                  transition: 'color 0.2s ease',
                }}
              >
                {selectedCategory === c && (
                  <motion.div layoutId="activeCategoryMap" style={{ position: 'absolute', inset: 0, background: 'var(--accent)', borderRadius: 999, zIndex: -1 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                {c === 'all' ? 'All Categories' : c.replace('_', ' ')}
              </button>
            ))}
            <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
            {STATUSES.filter(s => s !== 'all').map(s => (
              <button key={s} onClick={() => setSelectedStatus(s === selectedStatus ? 'all' : s)}
                style={{
                  padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                  color: selectedStatus === s ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderColor: selectedStatus === s ? 'var(--border)' : 'transparent',
                  background: selectedStatus === s ? 'var(--surface-2)' : 'transparent',
                }}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
            {filtered.length} issues mapped
          </span>
        </div>

        {/* Map Area */}
        <div style={{ flex: 1, padding: 16, background: 'var(--bg)', overflow: 'hidden' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Loading city intelligence map...</p>
                </div>
              </div>
            ) : (
              <MapComponent issues={filtered} onIssueSelect={setSelectedIssue} />
            )}
          </div>
          
          {/* Issue Panel Overlay */}
          {selectedIssue && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              style={{
                position: 'absolute', right: 16, top: 16, bottom: 16, width: 320, background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-elevated)', overflow: 'auto', zIndex: 1000, padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span className={`badge badge-${selectedIssue.severity}`} style={{ marginBottom: 8, display: 'inline-flex' }}>{selectedIssue.severity}</span>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{(selectedIssue.category || 'Civic Issue').replace('_', ' ')}</p>
                </div>
                <button onClick={() => setSelectedIssue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{selectedIssue.priorityScore || '—'}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>PRIORITY</p>
                </div>
                <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', textAlign: 'center' }}>
                  <span className={`badge badge-${selectedIssue.status}`} style={{ fontSize: 10 }}>{selectedIssue.status?.replace('_', ' ')}</span>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>STATUS</p>
                </div>
              </div>

              <Link href={`/admin/issues/${selectedIssue.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <ExternalLink size={14} /> View in Command Center
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
