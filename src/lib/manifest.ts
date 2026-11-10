import { z } from 'zod';

/**
 * Shape of `.portfolio/manifest.json` in every side-project repo.
 * The Lab page reads these at build time; an invalid manifest hides that project instead of
 * breaking the build.
 */
export const projectManifestSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words joined by hyphens'),
  title: z.string().min(1).max(80),
  summary: z.string().min(1).max(200),
  lens: z.array(z.enum(['build', 'advise'])).min(1),
  status: z.enum(['live', 'beta', 'building', 'archived']),
  wave: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  stack: z.array(z.string().min(1)).min(1),
  demo: z.url({ protocol: /^https$/ }).optional(),
  repo: z.url({ protocol: /^https$/ }),
  caseStudy: z.string().startsWith('/').optional(),
  cover: z.string().min(1).optional(),
});

export type ProjectManifest = z.infer<typeof projectManifestSchema>;

export type ManifestResult =
  { ok: true; manifest: ProjectManifest } | { ok: false; source: string; issues: string[] };

export function parseManifest(source: string, input: unknown): ManifestResult {
  const result = projectManifestSchema.safeParse(input);
  if (result.success) {
    return { ok: true, manifest: result.data };
  }
  return {
    ok: false,
    source,
    issues: result.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    ),
  };
}

/** Keeps valid manifests and reports invalid ones. Never throws. */
export function collectManifests(entries: ReadonlyArray<{ source: string; data: unknown }>) {
  const valid: ProjectManifest[] = [];
  const rejected: Array<{ source: string; issues: string[] }> = [];
  for (const entry of entries) {
    const result = parseManifest(entry.source, entry.data);
    if (result.ok) {
      valid.push(result.manifest);
    } else {
      rejected.push({ source: result.source, issues: result.issues });
    }
  }
  return { valid, rejected };
}
