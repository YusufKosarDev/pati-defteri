import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6">🐾</div>
            <h1 className="text-2xl font-bold text-gray-100 mb-3">
              Bir şeyler ters gitti!
            </h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Beklenmedik bir hata oluştu. Sayfayı yenileyerek tekrar deneyin.
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {this.state.error?.message || "Bilinmeyen hata"}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-sm"
              >
                🔄 Sayfayı Yenile
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-sm"
              >
                🏠 Ana Sayfaya Dön
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