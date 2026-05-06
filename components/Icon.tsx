import type { ReactNode } from 'react';

export default function Icon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  const icons: Record<string, ReactNode> = {
    shield: <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></svg>,
    radar: <svg {...common}><path d="M19.07 4.93A10 10 0 1 0 21 12" /><path d="M12 12 21 3" /><path d="M16 12a4 4 0 1 1-4-4" /><path d="M12 12h.01" /></svg>,
    check: <svg {...common}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-5" /></svg>,
    x: <svg {...common}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>,
    alert: <svg {...common}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
    file: <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h5" /></svg>,
    globe: <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /><path d="M12 2a15.3 15.3 0 0 0 0 20" /></svg>,
    arrow: <svg {...common}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
    loader: <svg {...common} className={`animate-spin ${className}`}><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>,
  };
  return icons[name] || icons.shield;
}
