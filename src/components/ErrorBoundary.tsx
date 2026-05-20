import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-red-950/20 border border-red-500/30 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
            <h1 className="text-2xl font-bold text-red-400 mb-4">🚨 Application Crash Caught</h1>
            <p className="text-sm text-red-200 mb-6 font-semibold">
              {this.state.error?.toString()}
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-left overflow-auto max-h-96 border border-white/5 font-mono text-[10px] text-zinc-400">
              <pre className="whitespace-pre-wrap">
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo && (
                <pre className="whitespace-pre-wrap mt-4 text-zinc-500">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all text-xs"
            >
              RELOAD PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
