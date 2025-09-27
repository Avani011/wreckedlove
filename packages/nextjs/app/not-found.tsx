import React from "react";
import Link from "next/link";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* 404 Icon */}
        <div className="text-8xl mb-6">🔍</div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>

        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-base-content mb-4">Page Not Found</h2>

        {/* Error Message */}
        <p className="text-base-content/70 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-outline">
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="bg-base-200 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Popular Pages</h3>
          <div className="space-y-2">
            <Link href="/" className="block link link-primary hover:link-hover">
              Home Page
            </Link>
            <Link href="/about" className="block link link-primary hover:link-hover">
              About Us
            </Link>
            <Link href="/contact" className="block link link-primary hover:link-hover">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
