"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h1>Unexpected Application Error</h1>

        <button onClick={reset}>Retry</button>
      </body>
    </html>
  );
}
