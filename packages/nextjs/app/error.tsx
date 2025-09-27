"use client";

import React from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage: React.FC<ErrorProps> = ({ error, reset }) => {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Error Icon */}
        <div className="text-6xl mb-6">⚠️</div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-error mb-4">Something went wrong!</h1>

        {/* Error Message */}
        <p className="text-base-content/70 mb-6">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-base-200 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-error mb-2">Error Details:</h3>
            <code className="text-sm text-error break-all">{error.message}</code>
            {error.digest && <p className="text-xs text-base-content/50 mt-2">Error ID: {error.digest}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="btn btn-primary">
            Try Again
          </button>
          <Link href="/" className="btn btn-outline">
            Go Home
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-sm text-base-content/50 mt-6">
          If this problem persists, please{" "}
          <a href="mailto:support@wreckedlove.com" className="link link-primary">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
