"use client";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorBanner({
  message,
  onRetry,
  retryLabel = "Попробовать снова",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      style={{
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        background: "#f8d7da",
        color: "#721c24",
        marginBottom: "1rem",
      }}
    >
      <p style={{ margin: 0, marginBottom: onRetry ? "0.5rem" : 0 }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: "0.35rem 0.75rem",
            cursor: "pointer",
            borderRadius: "4px",
            border: "1px solid #721c24",
            background: "transparent",
            color: "#721c24",
          }}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
