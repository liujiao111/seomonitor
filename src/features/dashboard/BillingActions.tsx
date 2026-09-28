'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const redirectToUrl = async (endpoint: string, body?: object) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

  const data = await response.json();

  if (response.ok && data.url) {
    window.location.href = data.url;
  }
};

export const BillingActions = (props: {
  hasActiveSubscription: boolean;
  labels: {
    upgradeMonthly: string;
    upgradeYearly: string;
    manageSubscription: string;
  };
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = (action: () => Promise<void>) => async () => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  if (props.hasActiveSubscription) {
    return (
      <Button
        disabled={isLoading}
        onClick={withLoading(() => redirectToUrl('/api/stripe/portal'))}
      >
        {props.labels.manageSubscription}
      </Button>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        disabled={isLoading}
        onClick={withLoading(() => redirectToUrl('/api/stripe/checkout', { interval: 'month' }))}
      >
        {props.labels.upgradeMonthly}
      </Button>

      <Button
        variant="outline"
        disabled={isLoading}
        onClick={withLoading(() => redirectToUrl('/api/stripe/checkout', { interval: 'year' }))}
      >
        {props.labels.upgradeYearly}
      </Button>
    </div>
  );
};
