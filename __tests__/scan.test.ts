import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanDomain, isValidDomain, scoreScan } from '../lib/scan';
import { makeDemoScan } from '../lib/demo';

test('cleanDomain removes protocol and path', () => {
  assert.equal(cleanDomain('https://Stripe.com/login'), 'stripe.com');
  assert.equal(cleanDomain('http://example.org/a/b'), 'example.org');
});

test('isValidDomain accepts common domains and rejects bad values', () => {
  assert.equal(isValidDomain('stripe.com'), true);
  assert.equal(isValidDomain('sub.example.co'), true);
  assert.equal(isValidDomain('localhost'), false);
  assert.equal(isValidDomain('bad domain.com'), false);
  assert.equal(isValidDomain('-bad.com'), false);
});

test('scoreScan returns bounded score and required checks', () => {
  const base = {
    domain: 'example.com',
    scannedAt: new Date().toISOString(),
    httpsAvailable: true,
    tlsProtocol: 'TLSv1.3',
    cipher: 'TLS_AES_256_GCM_SHA384',
    certificateValid: true,
    certificateIssuer: 'Test CA',
    certificateSubject: { CN: 'example.com' },
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 100 * 86400000).toISOString(),
    daysUntilExpiry: 100,
    headers: { hsts: true, csp: true, xFrameOptions: true, xContentTypeOptions: true, referrerPolicy: true },
    dns: { hasMX: true, hasSPF: true, hasDMARC: true, mxRecords: [] },
    pqcDetected: false,
  };
  const result = scoreScan(base);
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.checks.length >= 6);
  assert.equal(result.riskLevel, 'Low');
});

test('makeDemoScan produces a valid report-shaped object', () => {
  const demo = makeDemoScan('HTTPS://Hospital.sg/path');
  assert.equal(demo.domain, 'hospital.sg');
  assert.ok(demo.recommendations.length > 0);
  assert.ok(demo.roadmap.days30.length > 0);
});
