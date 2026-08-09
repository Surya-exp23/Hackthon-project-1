'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, X, ExternalLink, Filter } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

// Dynamic import for Leaflet (SSR disabled)
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

export default function ExplorePage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    apiClient.get('/map/issues')
      .then(data => setIssues(data.issues || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = issues.filter(i => {
    if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && i.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top nav */}
      <nav style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, background: 'var(--surface)', borderBottom: '1px solid var(--border)', zIndex: 40, flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 26, height: 26 }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>CivicLens</span>
        </Link>

        {/* Filter chips */}
        <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto', padding: '0 8px' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setSelectedCategory(c)}
              style={{
                position: 'relative',
                padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', border: '1px solid',
                color: selectedCategory === c ? 'white' : 'var(--text-secondary)',
                borderColor: selectedCategory === c ? 'transparent' : 'var(--border)',
                background: 'transparent',
                transition: 'color 0.2s ease',
              }}
            >
              {selectedCategory === c && (
                <motion.div
                  layoutId="activeCategory"
                  style={{ position: 'absolute', inset: 0, background: 'var(--accent)', borderRadius: 999, zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {c === 'all' ? 'All Categories' : c.replace('_', ' ')}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          {STATUSES.filter(s => s !== 'all').map(s => (
            <button key={s} onClick={() => setSelectedStatus(s === selectedStatus ? 'all' : s)}
              style={{
                position: 'relative',
                padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', border: '1px solid',
                color: selectedStatus === s ? 'var(--text-primary)' : 'var(--text-muted)',
                borderColor: selectedStatus === s ? 'var(--border)' : 'transparent',
                background: selectedStatus === s ? 'var(--surface-2)' : 'transparent',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--low)' }} />
            {filtered.length} issues
          </span>
          <Link href="/report" className="btn btn-primary btn-sm">+ Report</Link>
        </div>
      </nav>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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

        {/* Selected issue side panel */}
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            style={{
              position: 'absolute', right: 16, top: 16, bottom: 16,
              width: 'calc(100% - 32px)', maxWidth: 300,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-elevated)',
              overflow: 'auto',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span className={`badge badge-${selectedIssue.severity}`} style={{ marginBottom: 8, display: 'inline-flex' }}>{selectedIssue.severity}</span>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{(selectedIssue.category || 'Civic Issue').replace('_', ' ')}</p>
              </div>
              <button onClick={() => setSelectedIssue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{selectedIssue.priorityScore || '—'}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>PRIORITY</p>
              </div>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', textAlign: 'center' }}>
                <span className={`badge badge-${selectedIssue.status}`} style={{ fontSize: 10 }}>{selectedIssue.status?.replace('_', ' ')}</span>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>STATUS</p>
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)', marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>COORDINATES</p>
              <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {selectedIssue.lat?.toFixed(5)}, {selectedIssue.lng?.toFixed(5)}
              </p>
            </div>

            <Link href={`/issues/${selectedIssue.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <ExternalLink size={14} />
              View Full Report
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
