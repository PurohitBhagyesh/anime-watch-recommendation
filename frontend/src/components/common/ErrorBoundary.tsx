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
    window.location.hash = '#/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6 bg-[#151f2e] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-center">
              <AppLogo size={52} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Application Notice</span>
              </div>
              <h2 className="text-xl font-bold text-white">Something went unexpectedly</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                We encountered an unexpected rendering error. Your data and watchlists are safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3db4f2] hover:bg-[#2ba2e0] text-white text-xs font-bold transition shadow-lg shadow-[#3db4f2]/20 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
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
