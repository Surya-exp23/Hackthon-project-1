interface PriorityGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const getLabel = (score: number) => {
  if (score >= 85) return { label: 'CRITICAL', color: 'var(--critical)' };
  if (score >= 65) return { label: 'HIGH IMPACT', color: 'var(--high)' };
  if (score >= 40) return { label: 'MODERATE', color: 'var(--medium)' };
  return { label: 'LOW IMPACT', color: 'var(--low)' };
};

export function PriorityGauge({ score, size = 'md', showLabel = true }: PriorityGaugeProps) {
  const { label, color } = getLabel(score);
  const clampedScore = Math.min(100, Math.max(0, score));

  const sizes = {
    sm: { diameter: 72, stroke: 6, fontSize: 18 },
    md: { diameter: 120, stroke: 9, fontSize: 28 },
    lg: { diameter: 160, stroke: 12, fontSize: 40 },
  };
  const { diameter, stroke, fontSize } = sizes[size];
  const r = (diameter - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: diameter, height: diameter }}>
        <svg width={diameter} height={diameter} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={r}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize, fontWeight: 800, color, lineHeight: 1 }}>{clampedScore}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
        </div>
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color, textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
    </div>
  );
}
