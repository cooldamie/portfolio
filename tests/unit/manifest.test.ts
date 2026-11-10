import { describe, expect, it } from 'vitest';
import { collectManifests, parseManifest } from '../../src/lib/manifest';

const valid = {
  slug: 'proxy-doctor',
  title: 'Proxy Doctor',
  summary: 'Finds what breaks when a web app moves behind a reverse proxy.',
  lens: ['build', 'advise'],
  status: 'live',
  wave: 1,
  stack: ['TypeScript', 'Node', 'Azure Functions'],
  demo: 'https://proxy-doctor.damiecodes.com',
  repo: 'https://github.com/example/proxy-doctor',
  caseStudy: '/work/proxy-doctor',
};

describe('parseManifest', () => {
  it('accepts a complete manifest', () => {
    const result = parseManifest('proxy-doctor', valid);
    expect(result.ok).toBe(true);
  });

  it('accepts a manifest without optional fields', () => {
    const { demo: _demo, caseStudy: _caseStudy, ...minimal } = valid;
    expect(parseManifest('minimal', minimal).ok).toBe(true);
  });

  it('rejects a slug that is not lowercase-hyphenated', () => {
    const result = parseManifest('bad-slug', { ...valid, slug: 'Proxy_Doctor' });
    expect(result.ok).toBe(false);
  });

  it('rejects a demo URL that is not https', () => {
    const result = parseManifest('http-demo', { ...valid, demo: 'http://proxy-doctor.example' });
    expect(result.ok).toBe(false);
  });

  it('rejects a wave outside 1 to 3', () => {
    expect(parseManifest('wave-4', { ...valid, wave: 4 }).ok).toBe(false);
  });

  it('names the field behind each problem', () => {
    const result = parseManifest('two-problems', { ...valid, title: '', lens: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.source).toBe('two-problems');
      expect(result.issues.some((issue) => issue.startsWith('title:'))).toBe(true);
      expect(result.issues.some((issue) => issue.startsWith('lens:'))).toBe(true);
    }
  });

  it('reports a non-object manifest at the root', () => {
    const result = parseManifest('not-json-object', 'hello');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]).toMatch(/^\(root\):/);
    }
  });
});

describe('collectManifests', () => {
  it('keeps valid manifests and reports invalid ones without throwing', () => {
    const { valid: kept, rejected } = collectManifests([
      { source: 'good', data: valid },
      { source: 'bad', data: { ...valid, status: 'unknown' } },
      { source: 'empty', data: null },
    ]);
    expect(kept.map((m) => m.slug)).toEqual(['proxy-doctor']);
    expect(rejected.map((r) => r.source)).toEqual(['bad', 'empty']);
  });
});
