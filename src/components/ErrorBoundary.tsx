import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">!</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Terjadi Kesalahan</h1>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{this.state.error?.message || 'Aplikasi mengalami masalah.'}</p>
              {this.state.error?.message?.includes('Supabase') && (
                <div className="text-left bg-secondary/50 p-3 rounded-lg mt-4">
                  <p className="font-medium mb-2">Kemungkinan penyebab:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Environment variables Supabase belum diset</li>
                    <li>URL atau key Supabase salah</li>
                    <li>Supabase project belum aktif</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}