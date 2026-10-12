import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StudyFlow caught an unhandled error:', error, errorInfo);
  }

  private handleResetData = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mx-auto">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-white">
                StudyFlow AI encountered an issue
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                An unexpected error occurred while rendering the page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-750 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleResetData}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-700 hover:bg-slate-650 text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Data & Recover</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
