import { describe, expect, it } from 'vitest';
import { checkAuditResult } from '../scripts/check-dependencies.mjs';

function fixture() {
  const versions = {
    deepmerge: '4.3.1',
    '@rollup/plugin-node-resolve': '16.0.3',
    'workbox-build': '7.4.1',
    'vite-plugin-pwa': '2.0.0',
  };
  const dependencies = {
    deepmerge: {},
    '@rollup/plugin-node-resolve': { deepmerge: '^4.2.2' },
    'workbox-build': { '@rollup/plugin-node-resolve': '^16.0.3' },
    'vite-plugin-pwa': { 'workbox-build': '^7.4.1' },
  };
  const lock = { packages: Object.fromEntries(Object.entries(versions).map(([name, version]) => [
    `node_modules/${name}`, { version, dev: true, dependencies: dependencies[name as keyof typeof dependencies] },
  ])) };
  const names = Object.keys(versions);
  const report = {
    auditReportVersion: 2,
    vulnerabilities: Object.fromEntries(names.map((name, index) => [name, {
      name,
      severity: 'low',
      isDirect: index >= 2,
      via: index === 0 ? [{
        name: 'deepmerge',
        dependency: 'deepmerge',
        url: 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4',
        severity: 'low',
        range: '>=4.2.0 <=4.3.1',
      }] : [names[index - 1]],
      effects: index < names.length - 1 ? [names[index + 1]] : [],
      nodes: [`node_modules/${name}`],
    }])),
    metadata: { vulnerabilities: { info: 0, low: 4, moderate: 0, high: 0, critical: 0, total: 4 } },
  };
  return { lock, report };
}

function evaluate(report: unknown, lock = fixture().lock, status = 1) {
  return checkAuditResult({ stdout: JSON.stringify(report), status, signal: null }, lock);
}

describe('dependency advisory exceptions', () => {
  it('accepts only the reviewed advisory and complete pinned build-time chain', () => {
    const { lock, report } = fixture();
    expect(evaluate(report, lock)).toEqual({ ok: true, accepted: true, errors: [] });
  });

  it('passes a clean audit without requiring an obsolete exception', () => {
    const { report } = fixture();
    report.vulnerabilities = {};
    report.metadata.vulnerabilities.low = 0;
    report.metadata.vulnerabilities.total = 0;
    expect(evaluate(report, { packages: {} }, 0)).toEqual({ ok: true, accepted: false, errors: [] });
  });

  it('rejects an additional low-severity advisory', () => {
    const { report } = fixture();
    report.vulnerabilities.unreviewed = { ...report.vulnerabilities.deepmerge, name: 'unreviewed' };
    report.metadata.vulnerabilities.low += 1;
    report.metadata.vulnerabilities.total += 1;
    expect(evaluate(report).ok).toBe(false);
  });

  it('rejects a new advisory on the otherwise allowed deepmerge version', () => {
    const { report } = fixture();
    report.vulnerabilities.deepmerge.via = [{
      ...report.vulnerabilities.deepmerge.via[0] as object,
      url: 'https://github.com/advisories/GHSA-new-advisory',
    }];
    expect(evaluate(report).ok).toBe(false);
  });

  it.each(['moderate', 'high', 'critical'])('rejects severity changes to %s', (severity) => {
    const { report } = fixture();
    report.vulnerabilities.deepmerge.severity = severity;
    report.metadata.vulnerabilities.low -= 1;
    report.metadata.vulnerabilities[severity as 'moderate' | 'high' | 'critical'] += 1;
    expect(evaluate(report).ok).toBe(false);
  });

  it.each(['deepmerge', '@rollup/plugin-node-resolve', 'workbox-build', 'vite-plugin-pwa'])('requires re-review after changing %s version', (name) => {
    const { lock, report } = fixture();
    lock.packages[`node_modules/${name}`].version = '99.0.0';
    expect(evaluate(report, lock).ok).toBe(false);
  });

  it('rejects runtime exposure and new consumers of the vulnerable dependency', () => {
    const { lock, report } = fixture();
    lock.packages['node_modules/deepmerge'].dev = false;
    expect(evaluate(report, lock).ok).toBe(false);
    lock.packages['node_modules/deepmerge'].dev = true;
    lock.packages['node_modules/other'] = { version: '1.0.0', dev: true, dependencies: { deepmerge: '^4.3.1' } };
    expect(evaluate(report, lock).ok).toBe(false);
  });

  it('rejects changed dependency ranges or advisory relationships', () => {
    const { lock, report } = fixture();
    lock.packages['node_modules/@rollup/plugin-node-resolve'].dependencies = { deepmerge: '*' };
    expect(evaluate(report, lock).ok).toBe(false);
    report.vulnerabilities['workbox-build'].via = ['different-dependency'];
    expect(evaluate(report).ok).toBe(false);
  });

  it('rejects extra installations and incomplete audit chains', () => {
    const { lock, report } = fixture();
    lock.packages['node_modules/other/node_modules/deepmerge'] = { version: '4.3.1', dev: true, dependencies: {} };
    expect(evaluate(report, lock).ok).toBe(false);
    delete report.vulnerabilities['vite-plugin-pwa'];
    report.metadata.vulnerabilities.low -= 1;
    report.metadata.vulnerabilities.total -= 1;
    expect(evaluate(report).ok).toBe(false);
  });

  it('rejects missing or inconsistent scan results', () => {
    const { report } = fixture();
    report.metadata.vulnerabilities.low = 0;
    expect(evaluate(report).ok).toBe(false);
    expect(evaluate({ vulnerabilities: {} }).ok).toBe(false);
    expect(checkAuditResult({ status: 0, stdout: 'not JSON' }, {}).ok).toBe(false);
    expect(checkAuditResult({ status: 0, stdout: '{}' }, {}).ok).toBe(false);
  });

  it('rejects registry errors, process failures, and timeouts', () => {
    const { lock, report } = fixture();
    expect(evaluate({ ...report, error: { code: 'EAUDITNOLOCK' } }).ok).toBe(false);
    for (const failure of [
      { status: 2 },
      { status: null, signal: 'SIGTERM' },
      { status: null, error: new Error('network unavailable') },
    ]) {
      expect(checkAuditResult({ stdout: JSON.stringify(report), ...failure }, lock).ok).toBe(false);
    }
  });
});
