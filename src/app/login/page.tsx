'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* ─── tiny inline spinner ─── */
function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
      style={{ display: 'inline-flex' }}
    >
      <Loader2 size={16} />
    </motion.span>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams?.get('mode') === 'register' ? 'register' : 'login'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'admin' | 'department'>('citizen');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const queryMode = searchParams?.get('mode') ?? null;
    if (queryMode === 'register' || queryMode === 'login') {
      setMode(queryMode);
      setError('');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let authenticatedUser;
      if (mode === 'login') {
        authenticatedUser = await login(email, password);
      } else {
        authenticatedUser = await register(name, email, password, role);
      }
      if (authenticatedUser.role === 'admin') {
        router.push('/admin');
      } else if (authenticatedUser.role === 'department') {
        router.push('/department');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || (mode === 'login' ? 'Invalid email or password' : 'Failed to create account'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    router.push(`/login?mode=${newMode}`, { scroll: false });
  };

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>

      {/* Wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/Untitled-2.svg" alt="CivicLens" style={{ width: 30, height: 30 }} />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            CivicLens
          </span>
        </Link>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 36px 32px',
        boxShadow: 'var(--shadow-elevated)',
      }}>

        {/* Mode toggle — minimal pill */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
          padding: 3,
          marginBottom: 28,
          position: 'relative',
        }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => toggleMode(m)}
              style={{
                padding: '8px 0',
                fontSize: 13,
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.2s ease',
                letterSpacing: '-0.01em',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
          <motion.div
            layout
            animate={{ x: mode === 'login' ? '0%' : '100%' }}
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            style={{
              position: 'absolute',
              top: 3, bottom: 3, left: 3,
              width: 'calc(50% - 3px)',
              background: 'var(--surface)',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 0,
            }}
          />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4, color: 'var(--text-primary)' }}>
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
                {mode === 'login'
                  ? 'Sign in to continue to CivicLens.'
                  : 'Start making a difference in your city.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && error !== 'User already exists' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', marginBottom: 16 }}
            >
              <div style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--critical-dim)',
                border: '1px solid rgba(220,38,38,0.18)',
              }}>
                <AlertCircle size={14} color="var(--critical)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12.5, color: 'var(--critical)', lineHeight: 1.5 }}>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Register-only fields */}
          <AnimatePresence mode="popLayout">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 4 }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                      Full Name
                    </label>
                    <input
                      className="input"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      required={mode === 'register'}
                    />
                  </div>
                  {/* Role */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                      Role
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['citizen', 'admin', 'department'] as const).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            letterSpacing: '-0.01em',
                            transition: 'all 0.15s ease',
                            background: role === r ? 'var(--text-primary)' : 'transparent',
                            borderColor: role === r ? 'var(--text-primary)' : 'var(--border)',
                            color: role === r ? 'var(--bg)' : 'var(--text-secondary)',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {mode === 'register' && error === 'User already exists' && (
              <span style={{ fontSize: 12, color: 'var(--critical)', marginTop: 4, display: 'block' }}>
                An account with this email already exists.
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                minLength={mode === 'register' ? 6 : undefined}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 0, display: 'flex',
                  transition: 'color 0.15s ease',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{ width: '100%', marginTop: 6, fontSize: 14, letterSpacing: '-0.01em', gap: 8 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Spinner />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

        </form>

        {/* Footer link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)', fontWeight: 700, fontSize: 13,
              textDecoration: 'underline', textUnderlineOffset: 3,
              padding: 0,
            }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function UnifiedAuthPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      {/* Subtle grain texture — no colour glows */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      {/* Back link */}
      <Link
        href="/"
        style={{
          position: 'absolute', top: 28, left: 28,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          textDecoration: 'none',
          color: 'var(--text-muted)', fontSize: 13, fontWeight: 500,
          transition: 'color 0.15s ease',
          zIndex: 10,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={15} />
        Home
      </Link>

      <Suspense fallback={<div style={{ width: 400, height: 480 }} />}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}
        >
          <AuthContent />
        </motion.div>
      </Suspense>
    </div>
  );
}
