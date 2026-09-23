import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PurpleSync render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#fbfaff] p-6 text-center">
          <div>
            <p className="ps-mono text-[10px] text-[#8068a9]">PURPLESYNC</p>
            <h1 className="ps-display mt-3 text-4xl text-[#332840]">
              Something needs a second look.
            </h1>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-[#60438f] px-4 py-3 text-sm font-semibold text-white"
            >
              Reload the desk
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}