import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-strong text-primary">
        <Compass className="size-6" />
      </div>
      <h1 className="font-display text-display-md font-semibold tracking-tight text-text">Not found</h1>
      <p className="text-balance text-sm text-text-muted">
        The requested record could not be found or is no longer indexed. Use the dashboard or Run Center to
        verify data source health.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="size-4" /> Marketing site
          </Link>
        </Button>
        <Button asChild>
          <Link href="/app">Open dashboard</Link>
        </Button>
      </div>
    </section>
  );
}
