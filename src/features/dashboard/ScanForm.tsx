'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/libs/I18nNavigation';

export const ScanForm = (props: {
  allowed: boolean;
  labels: {
    placeholder: string;
    submit: string;
    quotaReached: string;
    upgradeCta: string;
  };
  upgradeHref: string;
}) => {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/seo/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(response.status === 402 ? props.labels.quotaReached : (data.error ?? 'Something went wrong'));
        return;
      }

      router.push(`/dashboard/reports/${data.reportId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        flex flex-col gap-3
        @sm:flex-row
      "
    >
      <input
        type="text"
        required
        disabled={!props.allowed || isSubmitting}
        value={domain}
        onChange={event => setDomain(event.target.value)}
        placeholder={props.labels.placeholder}
        className="
          flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm
          disabled:opacity-50
        "
      />

      <Button type="submit" disabled={!props.allowed || isSubmitting}>
        {props.labels.submit}
      </Button>

      {error && (
        <p className="
          text-sm text-destructive
          @sm:basis-full
        "
        >
          {error}
        </p>
      )}

      {!props.allowed && (
        <p className="
          text-sm text-muted-foreground
          @sm:basis-full
        "
        >
          {props.labels.quotaReached}
          {' '}
          <a
            href={props.upgradeHref}
            className="
              text-blue-500
              hover:text-blue-600
            "
          >
            {props.labels.upgradeCta}
          </a>
        </p>
      )}
    </form>
  );
};
