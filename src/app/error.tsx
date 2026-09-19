"use client";

import ErrorScreen, { errorSecondaryButton } from "@/components/error-screen";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorScreen
      code="500"
      title="Something went wrong"
      jp="エラーが発生しました"
      description="The page could not be loaded. Try again, or head back to the homepage."
      action={
        <button type="button" onClick={reset} style={errorSecondaryButton}>
          Try again
        </button>
      }
    />
  );
}
