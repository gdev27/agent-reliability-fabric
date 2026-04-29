import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="page">
      <article className="card">
        <h3>Not found</h3>
        <p className="muted">
          The requested record could not be found or is no longer indexed. Use Run Center or Settings to
          verify data source health.
        </p>
        <p className="mb-0">
          <Link href="/">Back to dashboard</Link>
        </p>
        <p className="mb-0 mt-2">
          <Link href="/runs">Open Run Center</Link>
        </p>
      </article>
    </section>
  );
}
