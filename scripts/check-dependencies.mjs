import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const advisory = 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4';
const exception = {
  deepmerge: { version: '4.3.1', via: null, effects: ['@rollup/plugin-node-resolve'], direct: false },
  '@rollup/plugin-node-resolve': { version: '16.0.3', via: 'deepmerge', effects: ['workbox-build'], direct: false },
  'workbox-build': { version: '7.4.1', via: '@rollup/plugin-node-resolve', effects: ['vite-plugin-pwa'], direct: true },
  'vite-plugin-pwa': { version: '2.0.0', via: 'workbox-build', effects: [], direct: true },
};
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const sameItems = (actual, expected) => Array.isArray(actual)
  && actual.length === expected.length && expected.every((value) => actual.includes(value));

/** Evaluate a completed npm audit without running commands when this module is imported. */
export function checkAuditResult(result, lock) {
  const errors = [];
  const fail = (message) => ({ ok: false, accepted: false, errors: [message] });
  if (result.error || result.signal || ![0, 1].includes(result.status)) {
    return fail(`npm audit did not complete successfully: ${result.error?.message ?? result.signal ?? result.status}`);
  }
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    return fail('npm audit returned invalid JSON.');
  }
  if (!isObject(report) || report.error || report.auditReportVersion !== 2
      || !isObject(report.vulnerabilities) || !isObject(report.metadata?.vulnerabilities)) {
    return fail('npm audit returned an error or an unsupported report.');
  }
  const entries = Object.entries(report.vulnerabilities);
  const counts = report.metadata.vulnerabilities;
  if (counts.total !== entries.length
      || !['info', 'low', 'moderate', 'high', 'critical'].every((severity) => (
        counts[severity] === entries.filter(([, item]) => item?.severity === severity).length
      ))
      || entries.some(([, item]) => !['info', 'low', 'moderate', 'high', 'critical'].includes(item?.severity))) {
    return fail('npm audit returned inconsistent vulnerability counts.');
  }
  if (entries.length === 0) {
    return result.status === 0 ? { ok: true, accepted: false, errors: [] }
      : fail('npm audit exited unsuccessfully without a vulnerability report.');
  }

  if (!sameItems(entries.map(([name]) => name), Object.keys(exception))) {
    errors.push('The audit contains a new advisory or a changed dependency chain.');
  }
  for (const [name, item] of entries) {
    const allowed = Object.hasOwn(exception, name) ? exception[name] : null;
    if (!allowed || !isObject(item)) {
      errors.push(`Unreviewed dependency advisory: ${name}.`);
      continue;
    }
    if (item.name !== name || item.severity !== 'low' || item.isDirect !== allowed.direct
        || !sameItems(item.nodes, [`node_modules/${name}`])
        || !sameItems(item.effects, allowed.effects)) {
      errors.push(`The reviewed low-risk scope changed for ${name}.`);
    }
    if (allowed.via) {
      if (!sameItems(item.via, [allowed.via])) errors.push(`The advisory chain changed for ${name}.`);
    } else {
      const finding = Array.isArray(item.via) && item.via.length === 1 ? item.via[0] : null;
      if (!isObject(finding) || finding.url !== advisory || finding.name !== 'deepmerge'
          || finding.dependency !== 'deepmerge' || finding.severity !== 'low'
          || finding.range !== '>=4.2.0 <=4.3.1') {
        errors.push('Only the reviewed deepmerge GHSA-gcqx-w48m-w2h4 advisory is allowed.');
      }
    }
  }

  const packages = lock?.packages;
  if (!isObject(packages)) return fail('package-lock.json does not contain a package inventory.');
  for (const [name, allowed] of Object.entries(exception)) {
    const installed = packages[`node_modules/${name}`];
    if (installed?.version !== allowed.version || installed.dev !== true) {
      errors.push(`The exception requires build-only ${name}@${allowed.version}.`);
    }
  }
  for (const [parent, dependency, range] of [
    ['@rollup/plugin-node-resolve', 'deepmerge', '^4.2.2'],
    ['workbox-build', '@rollup/plugin-node-resolve', '^16.0.3'],
    ['vite-plugin-pwa', 'workbox-build', '^7.4.1'],
  ]) {
    if (packages[`node_modules/${parent}`]?.dependencies?.[dependency] !== range) {
      errors.push(`The reviewed dependency relationship changed: ${parent} → ${dependency}.`);
    }
  }
  for (const [location, installed] of Object.entries(packages)) {
    if (!isObject(installed)) continue;
    for (const type of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      if (Object.hasOwn(installed[type] ?? {}, 'deepmerge')
          && !(location === 'node_modules/@rollup/plugin-node-resolve' && type === 'dependencies')) {
        errors.push(`An unreviewed package now consumes deepmerge: ${location || '(root)'} (${type}).`);
      }
    }
    if (location.endsWith('/node_modules/deepmerge') && location !== 'node_modules/deepmerge') {
      errors.push(`An additional deepmerge installation needs review: ${location}.`);
    }
  }
  return { ok: errors.length === 0, accepted: errors.length === 0, errors };
}

export function main() {
  const cwd = fileURLToPath(new URL('../', import.meta.url));
  let lock;
  try {
    lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  } catch (error) {
    console.error(`Cannot read package-lock.json: ${error.message}`);
    return 1;
  }
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
    'audit', '--json', '--include=prod', '--include=dev', '--include=optional', '--include=peer',
  ], { cwd, encoding: 'utf8', timeout: 60_000, maxBuffer: 10 * 1024 * 1024 });
  // Keep the complete npm findings visible, including the accepted low-risk advisory.
  if (result.stdout) process.stdout.write(`${result.stdout.trimEnd()}\n`);
  if (result.stderr) process.stderr.write(result.stderr);
  const outcome = checkAuditResult(result, lock);
  if (!outcome.ok) {
    console.error(`Dependency security check failed:\n${outcome.errors.map((error) => `- ${error}`).join('\n')}`);
    return 1;
  }
  if (outcome.accepted) {
    console.warn('Accepted only GHSA-gcqx-w48m-w2h4 in the pinned build-time deepmerge → node-resolve → Workbox → PWA chain. Re-review any version or usage change.');
  } else {
    console.log('No dependency advisories found.');
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
