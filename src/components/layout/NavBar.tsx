import Link from 'next/link';
import { MapPin, GitBranch } from 'lucide-react';

export function Navbar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      background: 'rgba(11, 13, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MapPin size={16} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
          CivicLens
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/explore" className="btn btn-ghost btn-sm">
          Explore City
        </Link>
        <Link href="/login" className="btn btn-ghost btn-sm">
          Log in
        </Link>
        <Link href="/report" className="btn btn-primary btn-sm">
          Report Issue
        </Link>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapPin size={14} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>CivicLens</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 8 }}>
            AI-Powered Civic Intelligence
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/explore" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Explore</Link>
          <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Admin</Link>
          <a href="https://github.com/Surya-exp23/Hackthon-project-1" target="_blank" rel="noopener" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <GitBranch size={14} />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
