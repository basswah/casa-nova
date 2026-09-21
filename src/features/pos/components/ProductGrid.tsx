import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, Plus, Package, Tag, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { PosProduct } from '@/types/pos';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';

interface ProductGridProps {
  products: PosProduct[];
  onAddToCart: (product: PosProduct) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.03 } },
};

const cardVariant = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
} satisfies Variants;

export const ProductGrid = ({ products, onAddToCart, search, onSearchChange }: ProductGridProps) => {
  const { t } = useTranslation();

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="relative mb-6 md:mb-8">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-brand-muted/25">
          <MagnifyingGlass size={18} weight="bold" />
        </div>
        <label htmlFor="pg-search" className="sr-only">{t('pos.searchProducts')}</label>
        <input
          id="pg-search"
          type="text"
          placeholder={t('pos.searchProducts')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-13 pr-12 py-4 bg-brand-dark/50 backdrop-blur-xl border border-brand-border/25 rounded-2xl text-sm text-brand-light placeholder-brand-muted/25 hover:border-brand-gold/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_2px_12px_-4px_rgba(0,0,0,0.15)]"
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-brand-muted/30 hover:text-brand-light/60 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X size={14} weight="bold" />
          </button>
        )}
      </div>

      {/* Product count */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <p className="text-[11px] font-medium text-brand-muted/30 uppercase tracking-widest">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
        </div>
      )}

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex items-center justify-center py-20"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-dark/50 border border-brand-border/20 flex items-center justify-center">
                <Package size={32} weight="duotone" className="text-brand-muted/15" />
              </div>
              <p className="text-sm font-medium text-brand-muted/40 mb-1" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                {t('pos.noProducts')}
              </p>
              <p className="text-[11px] text-brand-muted/25">
                {search ? 'Try a different search term' : 'Add products to get started'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-y-auto py-1 pb-28 pr-1 scrollbar-thin"
          >
            {filtered.map((product) => {
              const isOutOfStock = product.quantity <= 0;
              const isLowStock = product.quantity > 0 && product.quantity <= LOW_STOCK_THRESHOLD;

              return (
                <motion.button
                  key={product.id}
                  variants={cardVariant}
                  whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock}
                  className="group relative flex flex-col aspect-[3/4] rounded-2xl text-left cursor-pointer
                    border border-brand-border/20
                    hover:border-brand-gold/20 hover:shadow-[0_12px_40px_-12px_rgba(201,160,60,0.12)]
                    disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-brand-border/20 disabled:hover:y-0 disabled:active:scale-100
                    shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)]"
                >
                  {/* Full Background Image */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-dark/80 to-brand-black flex items-center justify-center">
                        <Package size={40} weight="duotone" className="text-brand-muted/10" />
                      </div>
                    )}
                  </div>

                  {/* Dark gradient overlay — always visible, stronger at bottom */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between z-10">
                    {/* Consignment Badge */}
                    {product.is_consignment && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-900/50 border border-amber-700/30 backdrop-blur-md">
                        <Tag size={9} weight="bold" className="text-amber-300/80" />
                        <span className="text-[9px] font-semibold text-amber-300/80 leading-none">{t('pos.consignment', 'برسم البيع')}</span>
                      </div>
                    )}

                    {/* Stock Badge */}
                    <div className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium leading-none backdrop-blur-md border ${
                      isOutOfStock
                        ? 'bg-black/40 text-brand-muted/60 border-white/5'
                        : isLowStock
                          ? 'bg-red-900/50 text-red-300/90 border-red-700/30'
                          : 'bg-green-900/40 text-green-300/80 border-green-700/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isOutOfStock ? 'bg-brand-muted/40' :
                        isLowStock ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                      }`} />
                      {isOutOfStock ? '0' : product.quantity}
                    </div>
                  </div>

                  {/* Bottom content — overlaid on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    {/* Name */}
                    <h3 className="text-sm font-semibold text-white truncate leading-snug tracking-tight mb-1" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                      {product.name}
                    </h3>

                    {/* SKU */}
                    <p className="text-[10px] font-mono text-white/30 mb-2.5 tracking-tight truncate">
                      {product.sku || t('pos.noSku')}
                    </p>

                    {/* Price + Add button row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[var(--clr-gold)] font-bold text-lg font-mono tracking-tight leading-none">
                          ${product.price_usd.toFixed(2)}
                        </p>
                        <p className="text-white/30 text-[10px] font-mono leading-none tracking-tight mt-1">
                          {product.price_syp.toLocaleString()} SYP
                        </p>
                      </div>

                      {!isOutOfStock && (
                        <div className="w-10 h-10 rounded-xl bg-[var(--clr-gold)] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(201,160,60,0.5)]">
                          <Plus size={18} weight="bold" className="text-brand-black" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
