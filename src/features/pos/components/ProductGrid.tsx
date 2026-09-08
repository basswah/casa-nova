import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, Plus, Package, Tag } from '@phosphor-icons/react';
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
  animate: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
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
      {/* Search Bar — Floating Glass */}
      <div className="relative mb-6 md:mb-8">
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-brand-muted/30">
          <MagnifyingGlass size={18} weight="bold" />
        </div>
        <label htmlFor="pg-search" className="sr-only">{t('pos.searchProducts')}</label>
        <input
          id="pg-search"
          type="text"
          placeholder={t('pos.searchProducts')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-brand-dark/60 backdrop-blur-xl border border-brand-border/30 rounded-2xl text-sm text-brand-light placeholder-brand-muted/30 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 focus:border-brand-gold/40 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_8px_-2px_rgba(0,0,0,0.15)]"
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-muted/40 hover:text-brand-light/70 transition-colors"
          >
            <span className="text-[10px] font-mono bg-brand-border/30 px-1.5 py-0.5 rounded-md">ESC</span>
          </button>
        )}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-dark/60 border border-brand-border/30 flex items-center justify-center">
                <Package size={28} weight="duotone" className="text-brand-muted/25" />
              </div>
              <p className="text-sm text-brand-muted/50">{t('pos.noProducts')}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-y-auto pb-24 pr-1 scrollbar-thin"
          >
            {filtered.map((product) => {
              const isOutOfStock = product.quantity <= 0;
              const isLowStock = product.quantity > 0 && product.quantity <= LOW_STOCK_THRESHOLD;

              return (
                <motion.button
                  key={product.id}
                  variants={cardVariant}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock}
                  className="group relative flex flex-col bg-brand-dark/50 backdrop-blur-sm border border-brand-border/25 rounded-2xl p-4 md:p-5 text-left transition-all duration-300
                    hover:border-brand-gold/25 hover:shadow-[0_8px_32px_-8px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-brand-border/25 disabled:hover:y-0 disabled:active:scale-100
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  {/* Consignment Badge */}
                  {product.is_consignment && (
                    <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-900/25 border border-amber-700/30">
                      <Tag size={9} weight="bold" className="text-amber-400/80" />
                      <span className="text-[8px] font-semibold text-amber-400/80 leading-none">{t('pos.consignment', 'برسم البيع')}</span>
                    </div>
                  )}

                  {/* Top Row: Name + Stock Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-brand-light/90 truncate leading-snug tracking-tight" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                      {product.name}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium leading-none ${
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
                      {isOutOfStock ? '0' : product.quantity}
                    </span>
                  </div>

                  {/* SKU */}
                  <p className="text-[11px] font-mono text-brand-muted/35 mb-3 md:mb-4 leading-snug tracking-tight">
                    {product.sku || t('pos.noSku')}
                  </p>

                  {/* Price + Add Button */}
                  <div className="mt-auto pt-3 md:pt-4 border-t border-brand-border/15 flex items-end justify-between">
                    <div>
                      <p className="text-brand-gold font-bold text-lg md:text-xl font-mono tracking-tight leading-none">
                        ${product.price_usd.toFixed(2)}
                      </p>
                      <p className="text-brand-muted/40 text-[10px] md:text-[11px] font-mono leading-none tracking-tight mt-1">
                        {product.price_syp.toLocaleString()} SYP
                      </p>
                    </div>

                    {!isOutOfStock && (
                      <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:bg-brand-gold/20">
                        <Plus size={16} weight="bold" className="text-brand-gold" />
                      </div>
                    )}
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
