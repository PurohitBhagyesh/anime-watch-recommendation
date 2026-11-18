import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertOctagon, Home } from 'lucide-react';
import { AppLogo } from './AppLogo';

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
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('animesenpai_home_data');
    } catch {}
    window.location.reload();
  };

  private handleGoHome = () => {
    try {
      localStorage.removeItem('animesenpai_home_data');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70dvh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6 bg-[#0b0b0d] border border-[#232329] rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center">
              <AppLogo size={44} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/25">
                <AlertOctagon aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Application Notice</span>
              </div>
              <h2 className="text-xl font-bold text-white">Something went unexpectedly</h2>
              <p className="text-xs text-[#9a9aa6] leading-relaxed">
                We encountered an unexpected rendering error. Your watchlist and preferences remain safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto anilist-btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
              >
                <RefreshCw aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto anilist-btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
              >
                <Home aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
