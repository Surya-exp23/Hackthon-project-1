'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, ArrowLeft, AlertTriangle, Loader2, Users, Clock } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { PriorityGauge } from '@/components/ui/PriorityGauge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';

export default function IssueDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/reports/${id}`)
      .then(d => setReport(d.report))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <AlertTriangle size={48} color="var(--critical)" />
        <p style={{ fontSize: 20, fontWeight: 700 }}>Issue not found</p>
        <Link href="/explore" className="btn btn-primary">Explore City Map</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 24px 40px' }}>
      {/* Minimal navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', background: 'rgba(11,13,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={14} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>CivicLens</span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link href="/explore" className="btn btn-ghost btn-sm">← Back to Map</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 24 }}
        >
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-muted)', padding: '3px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>
                #{id.slice(-6).toUpperCase()}
              </span>
              <span className={`badge badge-${report.severity}`}>{report.severity}</span>
              <span className={`badge badge-${report.status}`}>{report.status?.replace('_', ' ')}</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
              {(report.category || 'Civic Issue').replace('_', ' ')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <MapPin size={13} />
              {report.address || 'Location on file'}
            </p>
          </div>
          <PriorityGauge score={report.priorityScore || 0} size="md" />
        </motion.div>

        {/* Status Timeline */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Issue Status</p>
          <StatusTimeline currentStatus={report.status} />
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Image */}
            {report.imageUrl && (
              <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                <img src={report.imageUrl} alt="Reported issue" style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
              </div>
            )}

            {/* AI Analysis */}
            {report.aiSummary && (
              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>AI Analysis</p>
                <div style={{ padding: '12px 16px', background: 'var(--accent-dim)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', marginBottom: 12 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)' }}>{report.aiSummary}</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {report.confidence && <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>CONFIDENCE</p>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{Math.round(report.confidence * 100)}%</p>
                  </div>}
                  {report.recommendedDepartment && <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>ROUTED TO</p>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{report.recommendedDepartment?.replace('_', ' ')}</p>
                  </div>}
                </div>
                {report.riskFactors?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                    {report.riskFactors.map((rf: string, i: number) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{rf}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {report.description && (
              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Citizen Description</p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{report.description}</p>
              </div>
            )}
          </div>

          {/* Right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Community Impact */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Community Impact</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} color="var(--accent)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 800 }}>{1 + (report.relatedReports?.length || 0)}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>citizen report{(1 + (report.relatedReports?.length || 0)) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--medium-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} color="var(--medium)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{new Date(report.createdAt).toLocaleDateString()}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>reported on</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick details */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Issue Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Category', value: (report.category || '—').replace('_', ' ') },
                  { label: 'Severity', value: report.severity || '—' },
                  { label: 'Priority Score', value: `${report.priorityScore || 0} / 100` },
                  { label: 'Status', value: (report.status || '—').replace('_', ' ') },
                  { label: 'Assigned To', value: (report.assignedDepartment || 'Unassigned').replace('_', ' ') },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/explore" className="btn btn-secondary" style={{ textAlign: 'center', justifyContent: 'center', display: 'flex' }}>
              View on City Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
