import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureException } from "../../lib/sentry";

function getLang() {
  try {
    return localStorage.getItem("language") || "tr";
  } catch {
    return "tr";
  }
}

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, { componentStack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      const isEN = getLang() === "en";
      const t = {
        title: isEN ? "Something went wrong!" : "Bir şeyler ters gitti!",
        desc: isEN
          ? "An unexpected error occurred. Please refresh the page and try again."
          : "Beklenmedik bir hata oluştu. Sayfayı yenileyerek tekrar deneyin.",
        unknown: isEN ? "Unknown error" : "Bilinmeyen hata",
        refresh: isEN ? "🔄 Refresh Page" : "🔄 Sayfayı Yenile",
        home: isEN ? "🏠 Back to Home" : "🏠 Ana Sayfaya Dön",
      };

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6">🐾</div>
            <h1 className="text-2xl font-bold text-gray-100 mb-3">{t.title}</h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{t.desc}</p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {this.state.error?.message || t.unknown}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-sm"
              >
                {t.refresh}
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-sm"
              >
                {t.home}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
