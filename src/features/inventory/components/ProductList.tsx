import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types/inventory';

const LOW_STOCK_THRESHOLD = 5;

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductList = ({ products, onEdit, onDelete }: ProductListProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  });

  if (products.length === 0) {
    return <p className="text-brand-muted">{t('inventory.noProducts')}</p>;
  }

  return (
    <div className="w-full space-y-4">
      <label htmlFor="pl-search" className="sr-only">{t('common.search')}</label>
      <input
        id="pl-search"
        type="text"
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 bg-brand-dark border border-brand-border rounded-lg text-brand-light placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
      />

      {filtered.length === 0 && (
        <p className="text-brand-muted text-center py-8">{t('inventory.noProducts')}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-dark">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.name')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('inventory.sku')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('inventory.category')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('inventory.priceUsd')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('inventory.priceSyp')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('inventory.costUsd')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('inventory.costSyp')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.quantity')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-brand-black divide-y divide-brand-border">
            {filtered.map((product) => {
              const isLowStock = product.quantity <= LOW_STOCK_THRESHOLD;

              return (
                <tr
                  key={product.id}
                  className={`transition-colors duration-150 hover:bg-[var(--clr-surface-hover)] ${isLowStock ? 'bg-red-950/20' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-brand-light">
                    <span className="flex items-center gap-2">
                      {product.name}
                      {isLowStock && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400">
                          {t('inventory.lowStock')}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-brand-muted font-mono">{product.sku ?? '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-brand-muted">{product.category?.name ?? '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-brand-light font-mono">${product.price_usd.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-brand-light font-mono">{product.price_syp.toFixed(2)} SYP</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-brand-muted font-mono">${product.cost_usd.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-brand-muted font-mono">{product.cost_syp.toFixed(2)} SYP</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-mono ${isLowStock ? 'text-red-400' : 'text-brand-light'}`}>
                    {product.quantity}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-brand-gold hover:text-[var(--clr-gold-hover)] mr-3 transition-colors duration-150 text-xs font-medium"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="text-red-500 hover:text-red-400 transition-colors duration-150 text-xs font-medium"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
