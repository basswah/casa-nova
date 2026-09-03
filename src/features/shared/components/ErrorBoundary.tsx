import { Component, type ErrorInfo, type ReactNode } from 'react';
import { withTranslation, type TFunction } from 'react-i18next';
import { WarningOctagon } from '@phosphor-icons/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  t: TFunction;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const { t } = this.props;

    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-brand-black p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-900/15 border border-red-800/25 flex items-center justify-center">
            <WarningOctagon size={30} weight="duotone" className="text-red-400/80" />
          </div>
          <h1 className="text-lg font-semibold text-brand-light mb-2">{t('errorBoundary.title')}</h1>
          <p className="text-sm text-brand-muted/60 mb-6">
            {t('errorBoundary.description')}
          </p>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-xl bg-brand-gold text-brand-black text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            {t('errorBoundary.reload')}
          </button>
        </div>
      </div>
    );
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  t: TFunction;
}

interface PageErrorBoundaryState {
  hasError: boolean;
}

class PageErrorBoundaryBase extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  state: PageErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[PageErrorBoundary:${this.props.pageName ?? 'page'}]`, error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    const { t } = this.props;

    return (
      <div className="min-h-[60dvh] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-900/15 border border-red-800/25 flex items-center justify-center">
            <WarningOctagon size={26} weight="duotone" className="text-red-400/80" />
          </div>
          <h2 className="text-base font-semibold text-brand-light mb-2">{t('errorBoundary.pageError')}</h2>
          <p className="text-sm text-brand-muted/60 mb-5">
            {t('errorBoundary.pageDescription')}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-brand-gold text-brand-black text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              {t('errorBoundary.tryAgain')}
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-4 py-2 rounded-xl border border-brand-border/30 text-brand-muted text-sm font-medium transition-all duration-300 hover:bg-brand-border/10"
            >
              {t('errorBoundary.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export const PageErrorBoundary = withTranslation()(PageErrorBoundaryBase);
