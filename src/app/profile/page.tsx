'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Navbar, Footer } from '@/components/layout/NavBar';
import Link from 'next/link';
import { User, MapPin, Activity, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiClient.get(`/reports?userId=${user.id}`)
        .then(data => setReports(data.reports || []))
        .catch(err => console.error('Failed to fetch user reports:', err))
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)' }}>You must be logged in to view your profile.</p>
          <Link href="/login" className="btn btn-primary">Log In</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '100px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          
          {/* User Info Card */}
          <div className="card" style={{ padding: 32, flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={32} color="var(--text-secondary)" />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>{user.name}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
            <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>CIVIC SCORE</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{user.civicScore || 0}</p>
            </div>
          </div>

          {/* User Reports List */}
          <div style={{ flex: '2 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={20} color="var(--accent)" />
                My Submitted Issues
              </h2>
              <Link href="/report" className="btn btn-primary btn-sm">+ New Report</Link>
            </div>

            {loading ? (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center', background: 'var(--surface)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MapPin size={24} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No reports yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Start improving your city by reporting your first civic issue.</p>
                <Link href="/report" className="btn btn-primary">Report an Issue</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reports.map((report) => (
                  <div key={report._id || report.id} className="card card-hover" style={{ padding: 20, display: 'flex', gap: 20 }}>
                    <div style={{ 
                      width: 100, height: 100, borderRadius: 8, 
                      backgroundImage: `url(${report.imageUrl})`, 
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, textTransform: 'capitalize' }}>
                          {(report.category || 'Issue').replace('_', ' ')}
                        </h3>
                        <span className={`badge badge-${report.status}`}>
                          {report.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {report.description || report.aiSummary || 'No description provided.'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={14} />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--${report.severity || 'medium'})` }} />
                          {report.severity} severity
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
