import { useTranslation } from 'react-i18next';
import { MagnifyingGlass } from '@phosphor-icons/react';
import type { PosProduct } from '@/types/pos';

const LOW_STOCK_THRESHOLD = 5;

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
    <div className="flex flex-col h-full">
      <div className="relative mb-4 md:mb-5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted/30">
          <MagnifyingGlass size={16} weight="bold" />
        </div>
        <label htmlFor="pg-search" className="sr-only">{t('pos.searchProducts')}</label>
        <input
          id="pg-search"
          type="text"
          placeholder={t('pos.searchProducts')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-brand-dark/80 backdrop-blur-sm border border-brand-border/60 rounded-xl md:rounded-2xl text-sm text-brand-light placeholder-brand-muted/30 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all duration-300 ease-out-expo shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-xl md:rounded-2xl bg-brand-dark/60 border border-brand-border/30 flex items-center justify-center">
              <MagnifyingGlass size={24} weight="duotone" className="text-brand-muted/25" />
            </div>
            <p className="text-sm text-brand-muted/50">{t('pos.noProducts')}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-y-auto pb-2 pr-1 scrollbar-thin">
          {filtered.map((product, idx) => {
            const isOutOfStock = product.quantity <= 0;
            const isLowStock = product.quantity > 0 && product.quantity <= LOW_STOCK_THRESHOLD;

            return (
              <button
                key={product.id}
                onClick={() => onAddToCart(product)}
                disabled={isOutOfStock}
                className="group relative flex flex-col bg-brand-dark/60 backdrop-blur-sm border border-brand-border/40 rounded-xl md:rounded-2xl p-4 md:p-5 text-left transition-all duration-300 ease-out-expo
                  hover:border-brand-gold/30 hover:shadow-[0_0_24px_-8px_rgba(212,175,55,0.12),var(--shadow-hover)] hover:-translate-y-0.5
                  active:scale-[0.97]
                  disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-brand-border/40 disabled:hover:-translate-y-0 disabled:active:scale-100
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                style={{ animation: `fade-slide-up 0.4s ease-out ${idx * 0.04}s both` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-brand-light/90 truncate leading-snug tracking-tight">
                    {product.name}
                  </h3>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium leading-none ${
                    isOutOfStock
                      ? 'bg-brand-muted/8 text-brand-muted/50'
                      : isLowStock
                        ? 'bg-red-900/15 text-red-400/80'
                        : 'bg-green-900/12 text-green-400/70'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isOutOfStock ? 'bg-brand-muted/40' :
                      isLowStock ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                    }`} />
                    <span>{isOutOfStock ? '0' : product.quantity}</span>
                  </span>
                </div>

                <p className="text-[11px] font-mono text-brand-muted/40 mb-3 md:mb-4 leading-snug tracking-tight">
                  {product.sku || t('pos.noSku')}
                </p>

                <div className="mt-auto pt-3 md:pt-4 border-t border-brand-border/20 space-y-1.5">
                  <p className="text-brand-gold font-bold text-lg md:text-xl font-mono tracking-tight leading-none">
                    ${product.price_usd.toFixed(2)}
                  </p>
                  <p className="text-brand-muted/45 text-[10px] md:text-[11px] font-mono leading-none tracking-tight">
                    {product.price_syp.toLocaleString()} SYP
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
