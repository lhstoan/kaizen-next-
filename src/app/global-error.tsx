"use client";

import ErrorScreen, { errorSecondaryButton } from "@/components/error-screen";
import "./globals.css";

// Replaces the root layout when that layout itself throws, so it ships its own
// <html>/<body> and cannot rely on anything the layout would have rendered.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body>
        <ErrorScreen
          code="500"
          title="Something went wrong"
          jp="エラーが発生しました"
          description="The site hit an unexpected error. Try again, or head back to the homepage."
          action={
            <button type="button" onClick={reset} style={errorSecondaryButton}>
              Try again
            </button>
          }
        />
      </body>
    </html>
  );
}
