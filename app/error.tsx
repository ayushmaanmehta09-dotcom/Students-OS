"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel">
      <h2>Something went wrong</h2>
      <p className="error">{error.message}</p>
      <button type="button" onClick={() => reset()}>
        Retry
      </button>
    </div>
  );
}
