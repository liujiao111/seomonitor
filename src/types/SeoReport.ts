// Generic shape returned by the external SEO analysis backend.
// Adjust this once the real backend's response contract is known —
// `src/libs/SeoBackend.ts` is the only other place that needs to change alongside it.
export type SeoIssue = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
};

export type SeoCategory = {
  name: string;
  score: number; // 0-100
  issues: SeoIssue[];
};

export type SeoReportResult = {
  domain: string;
  score: number; // 0-100 overall
  categories: SeoCategory[];
  scannedAt: string; // ISO date string
};
