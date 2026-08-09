'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'admin' | 'department'>('citizen');
  
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update mode if URL changes
  useEffect(() => {
    const queryMode = searchParams.get('mode');
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
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || (mode === 'login' ? 'Invalid email or password' : 'Failed to create account'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    // Update URL without refreshing page
    router.push(`/login?mode=${newMode}`);
  };

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/Untitled-2.svg" alt="CivicLens Logo" style={{ width: 36, height: 36 }} />
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>CivicLens</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '36px 36px' }}>
        
        {/* Toggle Switch */}
        <div style={{ display: 'flex', background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--radius-md)', marginBottom: 24, position: 'relative' }}>
          <button
            onClick={() => toggleMode('login')}
            style={{ flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)', position: 'relative', zIndex: 1, transition: 'color 0.2s' }}
          >
            Sign In
          </button>
          <button
            onClick={() => toggleMode('register')}
            style={{ flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)', position: 'relative', zIndex: 1, transition: 'color 0.2s' }}
          >
            Create Account
          </button>
          
          {/* Animated Background Pill */}
          <motion.div
            layout
            initial={false}
            animate={{ 
              x: mode === 'login' ? '0%' : '100%',
              width: '50%'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: 'absolute',
              top: 4, bottom: 4, left: 0,
              background: 'var(--surface)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 0
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Join CivicLens'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {mode === 'login' ? 'Sign in to your account to continue.' : 'Start reporting civic issues in your city.'}
          </p>
        </div>

        {error && error !== 'User already exists' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--critical-dim)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}
          >
            <AlertCircle size={14} color="var(--critical)" />
            <span style={{ fontSize: 13, color: 'var(--critical)' }}>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Registration Only Fields */}
          <AnimatePresence mode="popLayout">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 4 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Full Name</label>
                    <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ananya Sharma" required={mode === 'register'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Role Selection</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['citizen', 'admin', 'department'] as const).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          style={{
                            flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600, borderRadius: 'var(--radius-sm)',
                            border: '1px solid', cursor: 'pointer', textTransform: 'capitalize',
                            background: role === r ? 'var(--accent-dim)' : 'transparent',
                            borderColor: role === r ? 'var(--accent)' : 'var(--border)',
                            color: role === r ? 'var(--accent)' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
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

          {/* Common Fields */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Email</label>
            <input 
              className="input" 
              type="email" 
              value={email} 
              onChange={e => { setEmail(e.target.value); setError(''); }} 
              placeholder="you@example.com" 
              required 
            />
            {mode === 'register' && error === 'User already exists' && (
              <span style={{ fontSize: 12, color: 'var(--critical)', marginTop: 4, display: 'block' }}>* user exists</span>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'at least 6 characters' : '••••••••'}
                minLength={mode === 'register' ? 6 : undefined}
                required
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function UnifiedAuthPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <Suspense fallback={<div style={{ width: 420, height: 400 }} />}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <AuthContent />
        </motion.div>
      </Suspense>
    </div>
  );
}
