import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

function isChunkLoadError(error: Error): boolean {
  const msg = error.message;
  return (
    error.name === 'ChunkLoadError' ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Loading CSS chunk')
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback(error, this.reset)
        : this.props.fallback;
    }

    const isChunk = isChunkLoadError(error);

    return (
      <div className="flex-cc min-h-screen flex-col gap-4">
        <p className="text-lg text-gray-700">
          {isChunk ? '页面加载失败，请刷新重试' : '页面出现错误'}
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={isChunk ? () => window.location.reload() : this.reset}
        >
          {isChunk ? '刷新页面' : '重试'}
        </button>
      </div>
    );
  }
}
