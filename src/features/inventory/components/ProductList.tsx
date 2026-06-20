import { useTranslation } from 'react-i18next';
import { motion, type Easing } from 'framer-motion';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import type { Product } from '@/types/inventory';

const LOW_STOCK_THRESHOLD = 5;

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
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

        return (
          <motion.div
            key={product.id}
            variants={fadeSlideUp}
            className="group flex flex-col bg-brand-dark rounded-xl border border-brand-border/40 p-5 transition-all duration-300 ease-out-expo hover:border-brand-gold/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(212,175,55,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-brand-light truncate">{product.name}</h3>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="font-mono text-brand-muted/50">{product.sku ?? '—'}</span>
                  {product.category?.name && (
                    <>
                      <span className="text-brand-border/30">&middot;</span>
                      <span className="text-brand-muted/60 truncate">{product.category.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono whitespace-nowrap border ${
                isLowStock
                  ? 'bg-red-900/15 text-red-400/90 border-red-800/30'
                  : 'bg-green-900/12 text-green-400/80 border-green-800/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isLowStock ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                }`} />
                {product.quantity}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs pt-3 border-t border-brand-border/20 mt-auto">
              <div>
                <span className="text-brand-muted/40">{t('inventory.priceUsd')}</span>
                <p className="text-sm font-mono text-brand-light mt-0.5">${product.price_usd.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-brand-muted/40">{t('inventory.priceSyp')}</span>
                <p className="text-sm font-mono text-brand-light mt-0.5 truncate">{product.price_syp.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-brand-muted/40">{t('inventory.costUsd')}</span>
                <p className="text-sm font-mono text-brand-muted/70 mt-0.5">${product.cost_usd.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-brand-muted/40">{t('inventory.costSyp')}</span>
                <p className="text-sm font-mono text-brand-muted/70 mt-0.5 truncate">{product.cost_syp.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-brand-border/20">
              <button
                onClick={() => onEdit(product)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-gold/80 bg-brand-gold/5 hover:bg-brand-gold/12 rounded-lg transition-all duration-200 active:scale-[0.95]"
              >
                <PencilSimple size={12} weight="bold" />
                {t('common.edit')}
              </button>
              <button
                onClick={() => onDelete(product)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400/80 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
              >
                <Trash size={12} weight="bold" />
                {t('common.delete')}
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
