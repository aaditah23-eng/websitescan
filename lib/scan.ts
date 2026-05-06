import tls from 'tls';
import dns from 'dns/promises';
import type { ScanCheck, ScanResult } from './types';

export function cleanDomain(input: string): string {
  return String(input || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim()
    .toLowerCase();
}

export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (domain.includes('..')) return false;
  return /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i.test(domain);
}

function daysUntil(dateText: string | null): number | null {
  if (!dateText) return null;
  const time = new Date(dateText).getTime();
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / (1000 * 60 * 60 * 24));
}

export async function checkTLS(domain: string) {
  return new Promise<{
    httpsAvailable: boolean;
    tlsProtocol: string | null;
    cipher: string | null;
    certificateValid: boolean;
    certificateIssuer: string | null;
    certificateSubject: unknown;
    validFrom: string | null;
    validTo: string | null;
    daysUntilExpiry: number | null;
  }>((resolve) => {
    const socket = tls.connect(
      {
        host: domain,
        port: 443,
        servername: domain,
        timeout: 8000,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        socket.end();

        const validTo = cert?.valid_to || null;
        const expiryDays = daysUntil(validTo);
        const certLooksValid = Boolean(cert && cert.valid_to && expiryDays !== null && expiryDays > 0);

        resolve({
          httpsAvailable: true,
          tlsProtocol: protocol,
          cipher: cipher?.name || 'Unknown',
          certificateValid: certLooksValid,
          certificateIssuer: cert?.issuer?.O || cert?.issuer?.CN || 'Unknown',
          certificateSubject: cert?.subject || null,
          validFrom: cert?.valid_from || null,
          validTo,
          daysUntilExpiry: expiryDays,
        });
      }
    );

    socket.on('error', () => {
      resolve({
        httpsAvailable: false,
        tlsProtocol: null,
        cipher: null,
        certificateValid: false,
        certificateIssuer: null,
        certificateSubject: null,
        validFrom: null,
        validTo: null,
        daysUntilExpiry: null,
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        httpsAvailable: false,
        tlsProtocol: null,
        cipher: null,
        certificateValid: false,
        certificateIssuer: null,
        certificateSubject: null,
        validFrom: null,
        validTo: null,
        daysUntilExpiry: null,
      });
    });
  });
}

export async function checkSecurityHeaders(domain: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://${domain}`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const headers = res.headers;
    return {
      hsts: headers.has('strict-transport-security'),
      csp: headers.has('content-security-policy'),
      xFrameOptions: headers.has('x-frame-options'),
      xContentTypeOptions: headers.has('x-content-type-options'),
      referrerPolicy: headers.has('referrer-policy'),
    };
  } catch {
    return {
      hsts: false,
      csp: false,
      xFrameOptions: false,
      xContentTypeOptions: false,
      referrerPolicy: false,
    };
  }
}

export async function checkDNS(domain: string) {
  const result = {
    hasMX: false,
    hasSPF: false,
    hasDMARC: false,
    mxRecords: [] as unknown[],
  };

  try {
    const mx = await dns.resolveMx(domain);
    result.mxRecords = mx;
    result.hasMX = mx.length > 0;
  } catch {}

  try {
    const txt = await dns.resolveTxt(domain);
    result.hasSPF = txt.flat().some((record) => record.toLowerCase().includes('v=spf1'));
  } catch {}

  try {
    const dmarc = await dns.resolveTxt(`_dmarc.${domain}`);
    result.hasDMARC = dmarc.flat().some((record) => record.toUpperCase().includes('V=DMARC1'));
  } catch {}

  return result;
}

function detectPQCSignal(): boolean {
  // Conservative MVP: browsers/CDNs may support hybrid PQ TLS, but a simple Node TLS
  // handshake does not reliably prove the server's public PQC support. Keep this false
  // until you add an external probe with an OpenSSL/BoringSSL build that supports ML-KEM.
  return false;
}

export function scoreScan(input: Omit<ScanResult, 'score' | 'riskLevel' | 'quantumRiskScore' | 'quantumRiskLevel' | 'checks' | 'recommendations' | 'roadmap'>) {
  const checks: ScanCheck[] = [];
  const add = (name: string, passed: boolean, warning: boolean, description: string, maxPoints: number) => {
    const pointsAwarded = passed ? maxPoints : warning ? Math.floor(maxPoints / 2) : 0;
    checks.push({ name, status: passed ? 'pass' : warning ? 'warning' : 'fail', description, pointsAwarded, maxPoints });
    return pointsAwarded;
  };

  let score = 0;
  score += add('HTTPS available', input.httpsAvailable, false, input.httpsAvailable ? 'The domain responds on HTTPS port 443.' : 'HTTPS was not available on port 443.', 15);
  score += add('TLS 1.3 baseline', input.tlsProtocol === 'TLSv1.3', Boolean(input.tlsProtocol), input.tlsProtocol === 'TLSv1.3' ? 'TLS 1.3 is active.' : `Detected ${input.tlsProtocol || 'no TLS protocol'}.`, 20);
  score += add('Certificate validity', input.certificateValid, Boolean(input.validTo), input.certificateValid ? `Certificate is valid for about ${input.daysUntilExpiry} days.` : 'Certificate is missing, expired, or could not be validated.', 15);
  score += add('HSTS enabled', input.headers.hsts, false, input.headers.hsts ? 'Strict-Transport-Security header is present.' : 'HSTS header was not detected.', 10);

  const headerCount = [input.headers.csp, input.headers.xFrameOptions, input.headers.xContentTypeOptions, input.headers.referrerPolicy].filter(Boolean).length;
  score += add('Security headers', headerCount >= 3, headerCount > 0, `${headerCount}/4 supporting security headers detected.`, 10);

  score += add('Email DNS security', input.dns.hasSPF && input.dns.hasDMARC, input.dns.hasSPF || input.dns.hasDMARC, `SPF: ${input.dns.hasSPF ? 'yes' : 'no'}, DMARC: ${input.dns.hasDMARC ? 'yes' : 'no'}.`, 10);
  score += add('PQC public signal', input.pqcDetected, false, input.pqcDetected ? 'A public PQC signal was detected.' : 'No public post-quantum TLS signal was detected by this MVP scan.', 20);

  const finalScore = Math.min(score, 100);
  const riskLevel = finalScore >= 75 ? 'Low' : finalScore >= 50 ? 'Medium' : 'High';

  let quantumRiskScore = 80;
  if (input.tlsProtocol === 'TLSv1.3') quantumRiskScore -= 15;
  if (input.certificateValid) quantumRiskScore -= 5;
  if (input.headers.hsts) quantumRiskScore -= 5;
  if (input.dns.hasSPF && input.dns.hasDMARC) quantumRiskScore -= 5;
  if (input.pqcDetected) quantumRiskScore -= 35;
  quantumRiskScore = Math.max(0, Math.min(100, quantumRiskScore));
  const quantumRiskLevel = quantumRiskScore < 35 ? 'Low' : quantumRiskScore < 65 ? 'Medium' : 'High';

  return { score: finalScore, riskLevel, quantumRiskScore, quantumRiskLevel, checks } as const;
}

export function buildRecommendations(result: Pick<ScanResult, 'tlsProtocol' | 'certificateValid' | 'headers' | 'dns' | 'pqcDetected'>): string[] {
  const recommendations = new Set<string>();
  if (result.tlsProtocol !== 'TLSv1.3') recommendations.add('Enable TLS 1.3 on public websites, APIs, and load balancers.');
  if (!result.certificateValid) recommendations.add('Fix expired or invalid certificates and create an owner for certificate rotation.');
  if (!result.headers.hsts) recommendations.add('Enable HSTS to reduce downgrade and mixed-content risk.');
  if (!result.dns.hasSPF || !result.dns.hasDMARC) recommendations.add('Add SPF and DMARC to improve email-domain security posture.');
  if (!result.pqcDetected) recommendations.add('Evaluate a PQC-ready CDN, edge provider, or TLS termination layer.');
  recommendations.add('Inventory RSA/ECC certificates, SSH keys, VPNs, S/MIME, and code-signing keys.');
  recommendations.add('Prioritize long-lived sensitive data for harvest-now-decrypt-later risk review.');
  recommendations.add('Create a crypto-agility migration roadmap aligned to NIST-standardized PQC algorithms.');
  return Array.from(recommendations);
}

export function buildRoadmap() {
  return {
    days30: [
      'Create a public-domain and certificate inventory.',
      'Identify owners for TLS, VPN, SSH, email, and code-signing systems.',
      'Fix missing TLS 1.3, HSTS, SPF, and DMARC basics.',
    ],
    days60: [
      'Classify long-lived confidential data exposed to harvest-now-decrypt-later risk.',
      'Evaluate PQC-ready edge/CDN options and hybrid TLS support.',
      'Start vendor questionnaire for PQC migration readiness.',
    ],
    days90: [
      'Pilot hybrid PQC TLS on one non-critical service.',
      'Define crypto-agility policy for new systems and vendors.',
      'Prepare board-level migration budget and ownership plan.',
    ],
  };
}

export async function runDomainScan(domainInput: string): Promise<ScanResult> {
  const domain = cleanDomain(domainInput);
  if (!isValidDomain(domain)) throw new Error('Please enter a valid domain like example.com.');

  const [tlsResult, headers, dnsResult] = await Promise.all([
    checkTLS(domain),
    checkSecurityHeaders(domain),
    checkDNS(domain),
  ]);

  const base = {
    domain,
    scannedAt: new Date().toISOString(),
    ...tlsResult,
    headers,
    dns: dnsResult,
    pqcDetected: detectPQCSignal(),
  };

  const scored = scoreScan(base);
  const almost = { ...base, ...scored } as Omit<ScanResult, 'recommendations' | 'roadmap'>;

  return {
    ...almost,
    recommendations: buildRecommendations(almost),
    roadmap: buildRoadmap(),
  };
}
