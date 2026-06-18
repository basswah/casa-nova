import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/rootStore';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const signIn = useAppStore((s) => s.signIn);
  const loading = useAppStore((s) => s.loading);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('auth.login')}`; }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginError'));
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4" dir="auto">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-brand-dark rounded-xl p-6 border border-brand-border shadow-[var(--shadow-floating)]">
        <h1 className="text-2xl font-bold text-brand-gold text-center mb-6">{t('nav.title')}</h1>
        
        {error && (
          <div className="p-3 mb-4 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-brand-muted mb-1.5">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
              placeholder={t('auth.emailPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-brand-muted mb-1.5">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
              placeholder={t('auth.passwordPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
          >
            {loading ? t('common.saving') : t('auth.login')}
          </button>
        </div>

        <p className="text-xs text-brand-muted text-center mt-4">{t('auth.hint')}</p>
      </form>
    </div>
  );
};