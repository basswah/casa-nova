import { useTranslation } from 'react-i18next';
import type { PosProduct } from '@/types/pos';

interface ProductGridProps {
  products: PosProduct[];
  onAddToCart: (product: PosProduct) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export const ProductGrid = ({ products, onAddToCart, search, onSearchChange }: ProductGridProps) => {
  const { t } = useTranslation();
  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  return (
    <>
      <label htmlFor="pg-search" className="sr-only">{t('pos.searchProducts')}</label>
      <input
        id="pg-search"
        type="text"
        placeholder={t('pos.searchProducts')}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2.5 mb-5 bg-brand-dark border border-brand-border rounded-lg text-brand-light placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
      />

      {filtered.length === 0 ? (
        <p className="text-brand-muted text-center py-12">{t('pos.noProducts')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => onAddToCart(product)}
              disabled={product.quantity <= 0}
              className="group p-5 bg-brand-dark border border-brand-border rounded-xl text-left transition-all duration-200 hover:shadow-[var(--shadow-hover)] hover:border-brand-gold/30 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-brand-border disabled:hover:-translate-y-0"
            >
              <h3 className="font-semibold text-brand-light truncate">{product.name}</h3>
              <p className="text-xs text-brand-muted mt-0.5 font-mono">{product.sku || t('pos.noSku')}</p>
              <div className="mt-3 pt-3 border-t border-brand-border space-y-1">
                <p className="text-brand-gold font-bold text-lg font-mono tracking-tight">${product.price_usd.toFixed(2)}</p>
                <p className="text-brand-muted text-xs font-mono">{product.price_syp.toLocaleString()} SYP</p>
                <p className="text-xs text-brand-muted">{t('pos.stock', { count: product.quantity })}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};