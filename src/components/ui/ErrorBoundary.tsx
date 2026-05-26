'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  digest?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, digest: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
          <div className="text-4xl">&#x26A0;&#xFE0F;</div>
          <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            This section encountered an unexpected error. The issue has been reported automatically.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
