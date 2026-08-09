'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { PriorityGauge } from '@/components/ui/PriorityGauge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';

const DEPARTMENTS = ['public_works', 'water_authority', 'electricity_board', 'municipal_health', 'traffic_police', 'urban_development'];
const STATUSES = ['open', 'assigned', 'in_progress', 'resolved'] as const;

export default function AdminIssueDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [deptValue, setDeptValue] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/reports/${id}`)
      .then(data => {
        setReport(data.report);
        setStatusValue(data.report?.status || 'open');
        setDeptValue(data.report?.assignedDepartment || '');
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      const res = await apiClient.patch(`/admin/reports/${id}/status`, { status: statusValue, note });
      setReport(res.report);
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!deptValue) return;
    setSaving(true);
    try {
      const res = await apiClient.patch(`/admin/reports/${id}/assign`, { department: deptValue });
      setReport(res.report);
      setSuccess('Department assigned!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <AlertTriangle size={48} color="var(--critical)" />
        <p style={{ fontSize: 18, fontWeight: 700 }}>Issue not found</p>
        <Link href="/admin" className="btn btn-primary">← Back to Admin</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Back */}
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          <ArrowLeft size={14} />
          Back to Command Center
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-muted)' }}>#{id.slice(-6).toUpperCase()}</span>
              <span className={`badge badge-${report.severity}`}>{report.severity}</span>
              <span className={`badge badge-${report.status}`}>{report.status?.replace('_', ' ')}</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {(report.category || 'Civic Issue').replace('_', ' ')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} />
              {report.address || `${report.location?.coordinates?.[1]?.toFixed(4)}, ${report.location?.coordinates?.[0]?.toFixed(4)}`}
            </p>
          </div>
          <PriorityGauge score={report.priorityScore || 0} size="md" />
        </div>

        {/* Status Timeline */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Issue Progress</p>
          <StatusTimeline currentStatus={report.status} />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Image */}
            {report.imageUrl && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={report.imageUrl} alt="Issue" style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }} />
              </div>
            )}

            {/* AI Analysis */}
            {report.aiSummary && (
              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>AI Analysis</p>
                <div style={{ padding: '12px 16px', background: 'var(--accent-dim)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', marginBottom: 12 }}>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{report.aiSummary}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>CONFIDENCE</p>
                    <p style={{ fontWeight: 700 }}>{report.confidence ? `${Math.round(report.confidence * 100)}%` : '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>DEPT. SUGGESTED</p>
                    <p style={{ fontWeight: 700 }}>{report.recommendedDepartment?.replace('_', ' ') || '—'}</p>
                  </div>
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
          </div>

          {/* Admin Action Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--low-dim)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', gap: 8, alignItems: 'center' }}
              >
                <CheckCircle2 size={14} color="var(--low)" />
                <span style={{ fontSize: 13, color: 'var(--low)', fontWeight: 600 }}>{success}</span>
              </motion.div>
            )}

            {/* Status update */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Update Status</p>
              <select className="input" value={statusValue} onChange={e => setStatusValue(e.target.value)} style={{ marginBottom: 10 }}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <textarea
                className="input"
                placeholder="Add a note (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                style={{ resize: 'none', marginBottom: 12 }}
              />
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleStatusUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Update Status'}
              </button>
            </div>

            {/* Assign department */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Assign Department</p>
              <select className="input" value={deptValue} onChange={e => setDeptValue(e.target.value)} style={{ marginBottom: 12 }}>
                <option value="">— Select department —</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
              </select>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleAssign} disabled={!deptValue || saving}>
                Assign
              </button>
            </div>

            {/* Quick facts */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Created', value: new Date(report.createdAt).toLocaleDateString() },
                  { label: 'Priority Score', value: `${report.priorityScore} / 100` },
                  { label: 'Duplicates', value: `${report.relatedReports?.length || 0}` },
                  { label: 'Status', value: report.status?.replace('_', ' ') },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
