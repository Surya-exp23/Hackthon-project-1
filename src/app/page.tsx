'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Camera, Brain, Zap, Shield, BarChart2, CheckCircle2, ChevronRight, Activity, Map, AlertTriangle, Clock, Users, TrendingUp } from 'lucide-react';

// Animated counter hook
function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

// Floating issue card component
function IssueCard({ title, category, priority, severity, delay, x, y }: any) {
  const severityColor: Record<string, string> = { critical: 'var(--critical)', high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{ delay, duration: 0.6, y: { repeat: Infinity, duration: 4 + delay, ease: 'easeInOut' } }}
      style={{
        position: 'absolute', left: x, top: y,
        background: 'var(--surface-alpha)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        width: 180,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          {category}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
          background: `${severityColor[severity]}20`,
          color: severityColor[severity],
          border: `1px solid ${severityColor[severity]}40`,
        }}>
          {severity.toUpperCase()}
        </span>
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Priority</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: severityColor[severity] }}>{priority}</span>
      </div>
    </motion.div>
  );
}

// Pulsing map dot component
function MapDot({ x, y, color, delay }: any) {
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ repeat: Infinity, duration: 2 + delay, delay }}
        style={{
          position: 'absolute', inset: -6,
          borderRadius: '50%',
          background: color,
          opacity: 0.3,
        }}
      />
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '2px solid rgba(255,255,255,0.3)' }} />
    </div>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('citizens');
  const [wordIndex, setWordIndex] = useState(0);
  const cycleWords = ['UNDERSTAND', 'INNOVATE', 'DESIGN'];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % cycleWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { target: 2840, suffix: '+', label: 'Issues Logged', icon: <AlertTriangle size={20} color="var(--critical)" /> },
    { target: 1920, suffix: '', label: 'Resolved This Month', icon: <CheckCircle2 size={20} color="var(--low)" /> },
    { target: 46, suffix: 'h', label: 'Avg Resolution Time', icon: <Clock size={20} color="var(--medium)" /> },
    { target: 12, suffix: ' wards', label: 'Areas Covered', icon: <Map size={20} color="var(--accent)" /> },
  ];

  const floatingCards = [
    { title: 'Deep pothole on MG Road', category: 'Pothole', priority: 87, severity: 'critical', delay: 0, x: '72%', y: '20%' },
    { title: 'Garbage overflow near market', category: 'Waste', priority: 64, severity: 'high', delay: 0.3, x: '60%', y: '55%' },
    { title: 'Broken streetlight cluster', category: 'Streetlight', priority: 42, severity: 'medium', delay: 0.6, x: '78%', y: '68%' },
  ];

  const mapDots = [
    { x: '20%', y: '35%', color: 'var(--critical)', delay: 0 },
    { x: '30%', y: '60%', color: 'var(--high)', delay: 0.4 },
    { x: '55%', y: '40%', color: 'var(--medium)', delay: 0.8 },
    { x: '45%', y: '70%', color: 'var(--critical)', delay: 1.2 },
    { x: '62%', y: '25%', color: 'var(--low)', delay: 0.2 },
    { x: '15%', y: '55%', color: 'var(--medium)', delay: 0.6 },
    { x: '38%', y: '28%', color: 'var(--high)', delay: 1.0 },
  ];

  const howItWorks = [
    { step: '01', icon: <Camera size={24} />, title: 'Capture & Report', desc: 'Upload a photo of the civic issue with a brief description. Takes under 30 seconds.' },
    { step: '02', icon: <Brain size={24} />, title: 'AI Analyzes', desc: 'Gemini AI instantly classifies the issue, assesses severity, and calculates a priority score.' },
    { step: '03', icon: <BarChart2 size={24} />, title: 'Prioritized & Routed', desc: 'Issues are ranked by impact, clustered to remove duplicates, and routed to the right department.' },
    { step: '04', icon: <CheckCircle2 size={24} />, title: 'Resolved & Tracked', desc: 'Citizens get status updates as field workers resolve the issue. Full transparency end-to-end.' },
  ];

  const features = [
    { icon: <Brain size={32} color="var(--accent)" />, title: 'AI-Powered Classification', desc: 'Gemini vision AI categorizes issues, estimates severity, and generates actionable summaries — not a basic chatbot.' },
    { icon: <Zap size={32} color="var(--medium)" />, title: 'Duplicate Intelligence', desc: 'Geospatial + text similarity instantly surfaces near-duplicate reports, preventing noise and inflating community impact.' },
    { icon: <Shield size={32} color="var(--accent-2)" />, title: 'Admin Command Center', desc: 'A priority queue answering "what needs attention right now" with department performance and resolution analytics.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 64,
        display: 'flex', alignItems: 'center', padding: '0 20px',
        background: 'var(--surface-alpha)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>CivicLens</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/explore" className="btn btn-ghost btn-sm md:hidden">Explore City</Link>
          <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
          <Link href="/report" className="btn btn-primary btn-sm">Report Issue</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64, position: 'relative', overflow: 'hidden' }}>
        {/* Gradient background orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="md:grid-cols-1 md:p-6 md:mt-16" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left: Headline */}
          <div className="md:text-center md:items-center md:flex-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: 24 }}
            >
              <Zap size={13} color="var(--accent)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.03em' }}>AI-Powered Civic Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:text-4xl md:text-center"
              style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24, textAlign: 'center' }}
            >
              <span>SEE THE PROBLEM.</span><br />
              <div style={{ position: 'relative', display: 'inline-block', height: '1.05em', overflow: 'hidden', width: '9.2em', verticalAlign: 'bottom' }}>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ color: 'var(--accent)', position: 'absolute', left: 0, width: '100%', textAlign: 'center' }}
                  >
                    {cycleWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div><br />
              <span>THE IMPACT.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480, textAlign: 'center' }}
            >
              One photo converts a pothole, broken streetlight, or leaking drain into structured, prioritized, geo-located civic intelligence — routed to the right department instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <Link href="/report" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                <Camera size={18} />
                Report an Issue
              </Link>
              <Link href="/explore" className="btn btn-secondary btn-lg" style={{ gap: 10 }}>
                <Map size={18} />
                Explore City Map
              </Link>
            </motion.div>
          </div>

          {/* Right: Abstract Map Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              position: 'relative', height: 480,
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            {/* Grid overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              opacity: 0.5,
            }} />
            {/* Dots */}
            {mapDots.map((d, i) => <MapDot key={i} {...d} />)}
            {/* Issue cards */}
            {floatingCards.map((c, i) => <IssueCard key={i} {...c} />)}
            {/* Center tag */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--low)', boxShadow: '0 0 8px var(--low)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Live — 7 active issues nearby</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '32px 40px' }}>
        <div className="md:grid-cols-1 md:p-6" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stats.map((s, i) => {
            const { count, ref } = useCounter(s.target);
            return (
              <div key={i} ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-playfair)' }}>
                    {count.toLocaleString()}{s.suffix}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="md:p-6" style={{ padding: '120px 40px', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient background glows */}
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header — fully centered */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: 80 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 999, padding: '5px 16px', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase' }}>How It Works</p>
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
              From photo to action<br />
              <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in 15 seconds</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
              A fully automated civic pipeline — from a single photo to a tracked resolution.
            </p>
          </motion.div>

          {/* Steps grid */}
          <div className="md:grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, position: 'relative' }}>

            {/* Connector line */}
            <div style={{
              position: 'absolute',
              top: 48,
              left: 'calc(12.5% + 2px)',
              right: 'calc(12.5% + 2px)',
              height: 2,
              background: 'linear-gradient(90deg, transparent, var(--accent) 20%, var(--accent-2) 80%, transparent)',
              zIndex: 0,
              opacity: 0.4,
            }} />

            {howItWorks.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
              >
                {/* Icon container with glow */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
                  <div style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
                  }} />
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(124,108,246,0.1) 100%)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)',
                    position: 'relative',
                    boxShadow: '0 0 24px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}>
                    {h.icon}
                  </div>
                  {/* Step badge */}
                  <div style={{
                    position: 'absolute',
                    top: -8, right: -8,
                    width: 22, height: 22,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 900, color: '#fff',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                  }}>{i + 1}</div>
                </div>

                {/* Card content */}
                <div style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 16px',
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.01em' }}>{h.title}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="md:p-6" style={{ padding: '120px 40px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="md:grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card card-hover"
              style={{ padding: 32 }}
            >
              <div style={{ marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '0 40px 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(124,108,246,0.08) 100%)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--radius-xl)',
              padding: '64px 80px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>
              See something broken?<br />
              <span style={{ color: 'var(--accent)' }}>Report it in 30 seconds.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 36 }}>
              No signup needed. Just a photo, a location, and a moment of your time.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link href="/report" className="btn btn-primary btn-lg">
                <Camera size={18} />
                Report an Issue
                <ArrowRight size={16} />
              </Link>
              <Link href="/admin" className="btn btn-secondary btn-lg">
                Admin Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 28, height: 28 }} />
            <span style={{ fontWeight: 700 }}>CivicLens</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>— Built to solve modern problems</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Explore', 'Admin', 'GitHub'].map(l => (
              <Link key={l} href={l === 'GitHub' ? 'https://github.com/Surya-exp23/Hackthon-project-1' : `/${l.toLowerCase()}`}
                style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
                target={l === 'GitHub' ? '_blank' : undefined}
              >{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
