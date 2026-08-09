import { CheckCircle, Circle, Loader } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'open', label: 'Reported' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

const ORDER = ['open', 'assigned', 'in_progress', 'resolved'];

interface StatusTimelineProps {
  currentStatus: string;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = ORDER.indexOf(currentStatus);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STATUS_STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isUpcoming = i > currentIndex;
        const color = isDone ? 'var(--low)' : isCurrent ? 'var(--accent)' : 'var(--border)';

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `2px solid ${color}`,
                background: isDone ? 'var(--low-dim)' : isCurrent ? 'var(--accent-dim)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}>
                {isDone && <CheckCircle size={16} color="var(--low)" />}
                {isCurrent && <Loader size={16} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />}
                {isUpcoming && <Circle size={16} color="var(--border)" />}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: isCurrent ? 'var(--text-primary)' : isUpcoming ? 'var(--text-muted)' : 'var(--low)', whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 24,
                background: isDone ? 'var(--low)' : 'var(--border)',
                transition: 'background 0.4s ease',
              }} />
            )}
          </div>
        );
      })}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
