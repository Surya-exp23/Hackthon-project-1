'use client';
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Upload, X, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Camera, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { PriorityGauge } from '@/components/ui/PriorityGauge';

// --- Step 1: Upload ---
function StepUpload({ onNext, imageFile, setImageFile, imageUrl, setImageUrl }: any) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('File must be under 8MB.');
      return;
    }
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>What did you find?</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Upload a photo of the civic issue. Our AI will analyze it automatically.</p>

      {!imageUrl ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '60px 32px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--accent-dim)' : 'var(--surface-2)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)' }}>
            <Upload size={28} />
          </div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Drag & drop or click to upload</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>JPEG, PNG, WebP • Max 8MB</p>
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: 320, objectFit: 'cover' }} />
          <button
            onClick={() => { setImageUrl(''); setImageFile(null); }}
            style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {error && <p style={{ color: 'var(--critical)', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Description (optional)</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Briefly describe what you see..."
          onChange={e => (window as any).__cl_desc = e.target.value}
          style={{ resize: 'vertical' }}
        />
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 20 }}
        disabled={!imageFile}
        onClick={() => onNext({ description: (window as any).__cl_desc || '' })}
      >
        Continue — Analyze with AI
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

// --- Step 2: AI Processing ---
const AI_STEPS = [
  'Analyzing image...',
  'Detecting civic issue...',
  'Assessing severity...',
  'Checking nearby reports...',
  'Calculating priority...',
];

function StepAIProcessing({ imageFile, description, onNext, onError }: any) {
  const [stepIndex, setStepIndex] = useState(0);
  const [started, setStarted] = useState(false);

  const runAnalysis = async () => {
    if (started) return;
    setStarted(true);

    // Animate steps while real request runs
    for (let i = 0; i < AI_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setStepIndex(i + 1);
    }

    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadData = await apiClient.upload('/upload', formData);

      // 2. AI analyze
      const aiResult = await apiClient.post('/reports/analyze', { imageUrl: uploadData.url, description });

      onNext({ imageUrl: uploadData.url, aiResult });
    } catch (e) {
      onError();
    }
  };

  // Auto-start on mount
  if (!started) runAnalysis();

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ width: 80, height: 80, margin: '0 auto 32px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--accent-dim)' }} />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--accent)' }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MapPin size={28} color="var(--accent)" />
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Analyzing your report...</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 36 }}>Our AI is classifying the issue and calculating priority.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto', textAlign: 'left' }}>
        {AI_STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < stepIndex ? 1 : 0.25, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {i < stepIndex
              ? <CheckCircle2 size={16} color="var(--low)" />
              : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--border)' }} />
            }
            <span style={{ fontSize: 13, fontWeight: 500, color: i < stepIndex ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Step 3: Review AI Result ---
const CATEGORIES = ['pothole', 'road_damage', 'garbage_waste', 'streetlight', 'water_leakage', 'drainage', 'sidewalk', 'traffic_hazard', 'public_infrastructure', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const SEVERITY_COLORS: Record<string, string> = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };

function StepReviewAI({ aiResult, imageUrl, onNext, onBack }: any) {
  const [category, setCategory] = useState(aiResult?.category || 'pothole');
  const [severity, setSeverity] = useState(aiResult?.severity || 'medium');

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>AI Analysis Results</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Review the AI classification and correct if needed.</p>

      {aiResult && (
        <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <CheckCircle2 size={14} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
              AI CONFIDENCE: {Math.round((aiResult.confidence || 0.8) * 100)}%
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{aiResult.summary}</p>
          {aiResult.riskFactors?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {aiResult.riskFactors.map((rf: string, i: number) => (
                <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'rgba(59,130,246,0.12)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.2)' }}>{rf}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Category</label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Severity</label>
          <select className="input" value={severity} onChange={e => setSeverity(e.target.value)}>
            {SEVERITIES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ flex: 1 }}><ArrowLeft size={16} />Back</button>
        <button className="btn btn-primary" onClick={() => onNext({ category, severity, confidence: aiResult?.confidence, aiResult })} style={{ flex: 2 }}>
          Confirm & Add Location <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// --- Step 4: Location ---
function StepLocation({ onNext, onBack }: any) {
  const [address, setAddress] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  const detect = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setDetecting(false);
      },
      () => {
        setError('Could not detect location. Please enter manually.');
        setDetecting(false);
      }
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Where is this issue?</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Provide the location so it can be routed to the right local authority.</p>

      <button
        className="btn btn-secondary"
        style={{ width: '100%', marginBottom: 16 }}
        onClick={detect}
        disabled={detecting}
      >
        {detecting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Detecting...</>
          : <><MapPin size={16} /> Use my current location</>
        }
      </button>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Or enter address / area name</label>
        <input className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. MG Road, Jodhpur" />
      </div>

      {error && <p style={{ color: 'var(--medium)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {coords && (
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--low-dim)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--low)', fontWeight: 600 }}>✓ Location detected: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ flex: 1 }}><ArrowLeft size={16} />Back</button>
        <button className="btn btn-primary" onClick={() => onNext({ coords: coords || { lat: 26.2389, lng: 73.0243 }, address })} style={{ flex: 2 }} disabled={!address}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

// --- Step 5: Confirm & Submit ---
function StepConfirm({ data, onSubmit, onBack, submitting }: any) {
  const severityColor: Record<string, string> = { critical: 'var(--critical)', high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };
  const sev = data.severity || 'medium';

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Confirm your report</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Review everything before submitting.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start', marginBottom: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            {data.imageUrl && <img src={data.imageUrl} alt="Issue" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
            <div>
              <span className={`badge badge-${sev}`} style={{ marginBottom: 8 }}>{sev}</span>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{(data.category || 'Issue').replace('_', ' ')}</p>
              {data.aiResult?.summary && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{data.aiResult.summary}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
            <MapPin size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{data.address || 'Location detected'}</span>
          </div>
        </div>

        <PriorityGauge score={data.aiResult ? Math.round((data.confidence || 0.8) * 100) : 50} size="sm" />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ flex: 1 }} disabled={submitting}><ArrowLeft size={16} />Back</button>
        <button className="btn btn-primary" onClick={onSubmit} style={{ flex: 2 }} disabled={submitting}>
          {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <>Submit Report <CheckCircle2 size={16} /></>}
        </button>
      </div>
    </div>
  );
}

// --- Success State ---
function SuccessState({ reportId }: { reportId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ textAlign: 'center', padding: '40px 0' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--low-dim)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
      >
        <CheckCircle2 size={40} color="var(--low)" />
      </motion.div>

      <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Report Submitted!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your report has been logged and is now in the priority queue.</p>
      <p style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: 'var(--accent)', padding: '8px 20px', background: 'var(--accent-dim)', borderRadius: 8, display: 'inline-block', marginBottom: 32 }}>
        #{reportId?.slice(-6)?.toUpperCase() || 'CL1042'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/dashboard" className="btn btn-primary">View My Reports</Link>
        <Link href="/report" className="btn btn-secondary" onClick={() => window.location.reload()}>Report Another</Link>
        <Link href="/explore" className="btn btn-ghost">See on Map</Link>
      </div>
    </motion.div>
  );
}

// --- Main Report Page ---
export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [reportData, setReportData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState('');
  const [aiError, setAiError] = useState(false);

  const STEPS = ['Capture', 'AI Analysis', 'Review', 'Location', 'Confirm'];

  const submitReport = async () => {
    setSubmitting(true);
    try {
      const payload = {
        imageUrl: reportData.imageUrl,
        description: reportData.description,
        location: { type: 'Point', coordinates: [reportData.coords?.lng ?? 73.0243, reportData.coords?.lat ?? 26.2389] },
        address: reportData.address,
        category: reportData.category,
        severity: reportData.severity,
        confidence: reportData.confidence,
        aiSummary: reportData.aiResult?.summary,
        recommendedDepartment: reportData.aiResult?.recommendedDepartment,
        riskFactors: reportData.aiResult?.riskFactors,
      };
      const res = await apiClient.post('/reports', payload);
      setSuccessId(res.report._id);
      setStep(6); // success
    } catch {
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 24px 40px' }}>
      {/* Navbar */}
      <nav className="md:px-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', background: 'rgba(11,13,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 28, height: 28 }} />
          <span style={{ fontWeight: 800, fontSize: 16 }}>CivicLens</span>
        </Link>
        {!user && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link href="/login" className="btn btn-ghost btn-sm">Log in to track your report</Link>
          </div>
        )}
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Step indicator */}
        {step < 6 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i + 1 <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s ease' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>STEP {step} OF {STEPS.length}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{STEPS[step - 1]}</span>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 32 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <StepUpload
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  onNext={(d: any) => { setReportData({ ...reportData, ...d }); setStep(2); }}
                />
              )}
              {step === 2 && (
                <StepAIProcessing
                  imageFile={imageFile}
                  description={reportData.description}
                  onNext={(d: any) => { setReportData({ ...reportData, ...d }); setStep(3); }}
                  onError={() => { setAiError(true); setStep(3); }}
                />
              )}
              {step === 3 && (
                <StepReviewAI
                  aiResult={reportData.aiResult}
                  imageUrl={reportData.imageUrl}
                  onNext={(d: any) => { setReportData({ ...reportData, ...d }); setStep(4); }}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 4 && (
                <StepLocation
                  onNext={(d: any) => { setReportData({ ...reportData, ...d }); setStep(5); }}
                  onBack={() => setStep(3)}
                />
              )}
              {step === 5 && (
                <StepConfirm
                  data={{ ...reportData, imageUrl: reportData.imageUrl }}
                  onSubmit={submitReport}
                  onBack={() => setStep(4)}
                  submitting={submitting}
                />
              )}
              {step === 6 && <SuccessState reportId={successId} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
