import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'warning' | 'danger' | 'success' | 'dark';
  action?: {
    label: string;
    onClick: () => void;
  };
  badge?: string;
  progress?: {
    value: number;
    max: number;
  };
}

const variantStyles: Record<string, { card: React.CSSProperties; icon: React.CSSProperties; title: React.CSSProperties; value: React.CSSProperties; subtitle: React.CSSProperties }> = {
  default: {
    card: { background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)' },
    icon: { background: '#eff6ff', color: '#2563eb' },
    title: { color: 'var(--color-text-secondary)' },
    value: { color: 'var(--color-text-primary)' },
    subtitle: { color: 'var(--color-text-secondary)' },
  },
  warning: {
    card: { background: '#fffbeb', border: '1px solid #fde68a' },
    icon: { background: '#fef3c7', color: '#d97706' },
    title: { color: '#92400e' },
    value: { color: '#92400e' },
    subtitle: { color: '#92400e' },
  },
  danger: {
    card: { background: '#fff1f2', border: '1px solid #fecdd3' },
    icon: { background: '#ffe4e6', color: '#dc2626' },
    title: { color: '#991b1b' },
    value: { color: '#991b1b' },
    subtitle: { color: '#991b1b' },
  },
  success: {
    card: { background: '#f0fdf4', border: '1px solid #bbf7d0' },
    icon: { background: '#dcfce7', color: '#16a34a' },
    title: { color: '#166534' },
    value: { color: '#166534' },
    subtitle: { color: '#166534' },
  },
  dark: {
    card: { background: '#0f172a', border: 'none' },
    icon: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
    title: { color: 'rgba(255,255,255,0.6)' },
    value: { color: '#fff' },
    subtitle: { color: 'rgba(255,255,255,0.5)' },
  },
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  action,
  badge,
  progress,
}) => {
  const styles = variantStyles[variant];
  const iconAccent = typeof styles.icon.color === 'string' ? styles.icon.color : 'currentColor';

  return (
    <div style={{
      ...styles.card,
      borderRadius: 'var(--border-radius-lg)',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {variant === 'dark' && (
        <>
          <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: '-20px', right: '30px', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          borderRadius: '10px',
          ...styles.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} />
        </div>
        {badge && (
          <span style={{
            fontSize: '11px', fontWeight: 600,
            padding: '3px 9px', borderRadius: '999px',
            background: variant === 'dark' ? 'rgba(255,255,255,0.12)' : styles.icon.background,
            color: variant === 'dark' ? '#fff' : styles.icon.color as string,
          }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', ...styles.title }}>
        {title}
      </div>

      <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1, marginBottom: '6px', ...styles.value }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '12px', marginBottom: '10px', ...styles.subtitle }}>
          {subtitle}
        </div>
      )}

      {progress && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ height: '4px', background: variant === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (progress.value / Math.max(progress.max, 1)) * 100)}%`,
              background: variant === 'dark' ? '#fff' : iconAccent,
              borderRadius: '2px',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', ...styles.subtitle }}>
            <span>{progress.value} used</span>
            <span>{progress.max} total</span>
          </div>
        </div>
      )}

      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {trend.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span style={{
            fontSize: '12px', fontWeight: 500,
            color: variant === 'dark'
              ? (trend.isPositive ? '#4ade80' : '#f87171')
              : (trend.isPositive ? '#16a34a' : '#dc2626'),
            background: variant === 'dark'
              ? (trend.isPositive ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)')
              : (trend.isPositive ? '#f0fdf4' : '#fff1f2'),
            padding: '2px 8px', borderRadius: '999px',
          }}>
            {trend.isPositive ? '+' : ''}{trend.value}% {trend.label || 'vs yesterday'}
          </span>
        </div>
      )}

      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: '10px',
            fontSize: '12px', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
            color: variant === 'dark' ? 'rgba(255,255,255,0.7)' : iconAccent,
            padding: 0,
          }}
        >
          {action.label} {'->'}
        </button>
      )}
    </div>
  );
};

export default StatsCard;
