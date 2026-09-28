import type { SeoReportResult } from '@/types/SeoReport';
import { Env } from './Env';

// Thin wrapper around the external SEO analysis backend.
// Swapping the real backend's contract later should only require changes in this file.
export const scanDomain = async (domain: string): Promise<SeoReportResult> => {
  const response = await fetch(Env.SEO_BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(Env.SEO_BACKEND_API_KEY && { Authorization: `Bearer ${Env.SEO_BACKEND_API_KEY}` }),
    },
    body: JSON.stringify({ domain }),
  });

  if (!response.ok) {
    throw new Error(`SEO backend request failed with status ${response.status}`);
  }

  return response.json() as Promise<SeoReportResult>;
};
