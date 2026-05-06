import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QuantumShield | Post-Quantum Readiness Scanner',
  description: 'Scan domains for cryptographic posture, TLS readiness, DNS security, and post-quantum migration gaps.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
