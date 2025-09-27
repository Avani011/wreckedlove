import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="loading loading-spinner loading-lg text-primary"></div>

        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-base-content">Loading WreckedLove</h2>
          <p className="text-base-content/70 mt-2">Please wait while we prepare your experience...</p>
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <progress className="progress progress-primary w-full"></progress>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
