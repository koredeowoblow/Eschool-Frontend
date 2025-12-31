
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors in child components.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log fatal crashes for diagnostic purposes
    console.error('Uncaught application error:', error, errorInfo);
  }

  // Handle resetting the error state
  private handleReset = () => {
    // Accessing setState from React.Component
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full card-premium p-10 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Encountered an Issue</h1>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                The application encountered an unexpected state. Your session is safe, please try reloading.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <RefreshCw size={18} /> Reload Application
              </button>
              <button 
                onClick={this.handleReset}
                className="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
              >
                <Home size={18} /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Accessing children from props inherited from React.Component
    return this.props.children;
  }
}
