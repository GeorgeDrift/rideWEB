import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
  info?: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error } as State;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console and keep info in state so the UI can show a helpful message
    console.error('Caught by ErrorBoundary:', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    // Allow user to reset app state and try again
    try { localStorage.removeItem('token'); } catch (e) { /* ignore */ }
    this.setState({ hasError: false, error: null, info: null });
    // reload to restore a clean state
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100 p-8 flex items-center justify-center">
          <div className="max-w-3xl w-full bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 shadow-xl p-8 space-y-4">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">An unexpected error occurred while rendering the page. The error has been logged to the console for debugging.</p>

            <div className="bg-gray-100 dark:bg-dark-700 rounded p-3 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-60">
              <strong>Error:</strong>
              <pre className="whitespace-pre-wrap text-[12px] mt-2">{this.state.error?.message}</pre>
              {this.state.info?.componentStack && (
                <>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-[11px] mt-2 text-gray-700 dark:text-gray-300">{this.state.info.componentStack}</pre>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={this.handleReset} className="px-4 py-2 bg-primary-500 text-black rounded font-bold">Reset & Reload</button>
              <button onClick={() => window.open('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error','_blank')} className="px-4 py-2 border rounded border-gray-200">Learn more</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
