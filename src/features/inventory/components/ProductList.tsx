import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PencilSimple, Trash, Tag, Cube } from '@phosphor-icons/react';
import type { Product } from '@/types/inventory';

const LOW_STOCK_THRESHOLD = 5;

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const ProductList = ({ products, onEdit, onDelete }: ProductListProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {products.map((product) => {
        const isLowStock = product.quantity <= LOW_STOCK_THRESHOLD;
        const isVeryLowStock = product.quantity === 0;

        return (
          <motion.div
            key={product.id}
            variants={fadeSlideUp}
            className="group relative bg-brand-dark/80 backdrop-blur-sm rounded-2xl border border-brand-border/30 overflow-hidden transition-all duration-300 hover:border-brand-gold/25 hover:shadow-[0_8px_40px_-12px_rgba(201,160,60,0.12)] hover:-translate-y-1"
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] z-10 ${
              isVeryLowStock ? 'bg-gradient-to-r from-red-500/60 via-red-400/40 to-transparent' :
              isLowStock ? 'bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-transparent' :
              'bg-gradient-to-r from-brand-gold/60 via-brand-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            }`} />

            {/* Image Section */}
            <div className="relative w-full aspect-[16/9] bg-brand-black/30 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-border/[0.06] to-brand-black/20">
                  <Cube size={36} weight="duotone" className="text-brand-muted/10" />
                </div>
              )}

              {/* Dark gradient at bottom of image */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-dark/90 to-transparent" />

              {/* Stock Badge — on image */}
              <div className="absolute top-3 right-3 z-10">
                <div className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono border backdrop-blur-md ${
                  isVeryLowStock
                    ? 'bg-red-900/50 text-red-300 border-red-700/30'
                    : isLowStock
                    ? 'bg-amber-900/50 text-amber-300 border-amber-700/30'
                    : 'bg-green-900/40 text-green-300 border-green-700/20'
                }`}>
                  {product.quantity}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-brand-light truncate leading-tight mb-1">{product.name}</h3>
                  <span className="text-[10px] font-mono text-brand-muted/40">{product.sku ?? '—'}</span>
                </div>
                <span className={`shrink-0 text-[9px] font-medium ${
                  isVeryLowStock ? 'text-red-400/60' :
                  isLowStock ? 'text-amber-400/60' :
                  'text-emerald-400/60'
                }`}>
                  {isVeryLowStock ? t('inventory.outOfStock', 'Out of stock') :
                   isLowStock ? t('inventory.lowStock', 'Low stock') :
                   t('inventory.inStock', 'In stock')}
                </span>
              </div>

              {/* Category & Consignment Badge */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {product.category?.name && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-border/10 text-brand-muted/60 text-[10px] font-medium border border-brand-border/20">
                    {product.category.name}
                  </span>
                )}
                {product.is_consignment && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-900/20 border border-amber-700/25">
                    <Tag size={9} weight="bold" className="text-amber-400/80" />
                    <span className="text-[9px] font-semibold text-amber-400/80 leading-none">
                      {t('inventory.consignment', 'برسم البيع')}
                    </span>
                  </span>
                )}
              </div>

              {/* Price Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-brand-black/30 border border-brand-border/20 mb-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-gold/60">
                    {t('inventory.priceUsd', 'Price')}
                  </span>
                  <p className="text-base font-bold font-mono text-brand-light tracking-tight">
                    ${product.price_usd.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted/50">
                    {t('inventory.priceSyp', 'SYP')}
                  </span>
                  <p className="text-sm font-mono text-brand-light/80 truncate">
                    {product.price_syp.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted/50">
                    {t('inventory.costUsd', 'Cost')}
                  </span>
                  <p className="text-sm font-mono text-brand-muted/70">
                    ${product.cost_usd.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted/50">
                    {t('inventory.costSyp', 'SYP Cost')}
                  </span>
                  <p className="text-sm font-mono text-brand-muted/70 truncate">
                    {product.cost_syp.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEdit(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-gold/90 bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 border border-brand-gold/25 rounded-xl hover:from-brand-gold/15 hover:to-brand-gold/10 hover:border-brand-gold/40 transition-all duration-200 cursor-pointer"
                >
                  <PencilSimple size={14} weight="bold" />
                  {t('common.edit', 'Edit')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDelete(product)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400/90 bg-red-400/5 border border-red-800/30 rounded-xl hover:bg-red-400/10 hover:border-red-700/40 transition-all duration-200 cursor-pointer"
                >
                  <Trash size={14} weight="bold" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
