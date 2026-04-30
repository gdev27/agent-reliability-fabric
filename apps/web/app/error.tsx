"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-warn-soft text-warn">
              <AlertTriangle className="size-5" />
            </span>
            <CardTitle>Unable to load this view</CardTitle>
          </div>
          <CardDescription>
            The app failed closed to avoid showing unreliable state. Retry, then validate readiness if the
            issue continues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error.digest ? (
            <p className="text-xs text-text-muted">
              Reference: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button onClick={() => reset()}>Retry</Button>
            <Button asChild variant="outline">
              <a href="/app/onboarding">Open readiness checks</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
