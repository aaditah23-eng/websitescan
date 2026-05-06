import type { ScanResult } from './types';
import { buildRecommendations, buildRoadmap, scoreScan, cleanDomain } from './scan';

export function makeDemoScan(domainInput: string): ScanResult {
  const domain = cleanDomain(domainInput || 'example.com');
  const seed = domain.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const base = {
    domain,
    scannedAt: new Date().toISOString(),
    httpsAvailable: true,
    tlsProtocol: seed % 3 === 0 ? 'TLSv1.2' : 'TLSv1.3',
    cipher: seed % 2 === 0 ? 'TLS_AES_256_GCM_SHA384' : 'ECDHE-RSA-AES128-GCM-SHA256',
    certificateValid: seed % 5 !== 0,
    certificateIssuer: seed % 2 === 0 ? 'Google Trust Services' : 'DigiCert Global',
    certificateSubject: { CN: domain },
    validFrom: new Date(Date.now() - 40 * 86400000).toISOString(),
    validTo: new Date(Date.now() + (90 + seed % 150) * 86400000).toISOString(),
    daysUntilExpiry: 90 + seed % 150,
    headers: {
      hsts: seed % 2 === 0,
      csp: seed % 3 !== 0,
      xFrameOptions: seed % 4 !== 0,
      xContentTypeOptions: true,
      referrerPolicy: seed % 5 !== 0,
    },
    dns: {
      hasMX: true,
      hasSPF: seed % 3 !== 0,
      hasDMARC: seed % 4 !== 0,
      mxRecords: [{ exchange: `mail.${domain}`, priority: 10 }],
    },
    pqcDetected: seed % 11 === 0,
  };
  const scored = scoreScan(base);
  const almost = { ...base, ...scored };
  return { ...almost, recommendations: buildRecommendations(almost), roadmap: buildRoadmap() };
}
