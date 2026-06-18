import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSalesOrders, useSalesOrderItems } from '@/features/sales/hooks/useSalesOrders';
import { useCreateReturn } from '@/features/sales/hooks/useCreateReturn';
import { EmptyState } from '@/features/shared/components/EmptyState';
import type { SalesOrder, SalesOrderItem } from '@/types/sales';

interface SelectedItem {
  itemId: string;
  productId: string;
  maxQty: number;
  priceUsd: number;
  priceSyp: number;
}

export const SalesHistoryPage = () => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading } = useSalesOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem[]>>({});
  const [batchTarget, setBatchTarget] = useState<{ soId: string } | null>(null);
  const [batchReason, setBatchReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      new Date(order.order_date).toLocaleDateString().includes(q) ||
      order.total_usd.toFixed(2).includes(q) ||
      order.total_syp.toLocaleString().includes(q)
    );
  });

  const createReturn = useCreateReturn();

  useEffect(() => { document.title = `${t('nav.title')} — ${t('sales.title')}`; }, [t]);

  const handleToggleItem = (orderId: string, item: SalesOrderItem) => {
    setSelectedItems((prev) => {
      const current = prev[orderId] ?? [];
      const exists = current.find((s) => s.itemId === item.id);
      if (exists) {
        const filtered = current.filter((s) => s.itemId !== item.id);
        if (filtered.length === 0) {
          const rest = { ...prev };
          delete rest[orderId];
          return rest;
        }
        return { ...prev, [orderId]: filtered };
      }
      return {
        ...prev,
        [orderId]: [
          ...current,
          {
            itemId: item.id,
            productId: item.product_id!,
            maxQty: item.quantity,
            priceUsd: item.unit_price_usd,
            priceSyp: item.unit_price_syp,
          },
        ],
      };
    });
  };

  const handleBatchReturn = () => {
    if (!batchTarget) return;
    const items = selectedItems[batchTarget.soId];
    if (!items || items.length === 0) return;

    createReturn.mutate({
      so_id: batchTarget.soId,
      reason: batchReason,
      items: items.map((s) => ({
        product_id: s.productId,
        quantity: s.maxQty,
        unit_price_usd: s.priceUsd,
        unit_price_syp: s.priceSyp,
      })),
    });
  };

  const handleSingleReturn = (soId: string, item: SelectedItem) => {
    createReturn.mutate({
      so_id: soId,
      reason: '',
      items: [{
        product_id: item.productId,
        quantity: item.maxQty,
        unit_price_usd: item.priceUsd,
        unit_price_syp: item.priceSyp,
      }],
    });
  };

  const clearBatch = () => {
    setBatchTarget(null);
    setBatchReason('');
  };

  const handleExpandedChange = (orderId: string | null) => {
    setExpandedId(orderId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-gold tracking-tight">{t('sales.title')}</h1>
        <label htmlFor="sales-search" className="sr-only">{t('common.search')}</label>
        <input
          id="sales-search"
          type="text"
          placeholder={t('common.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-brand-light placeholder-brand-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
        />
      </div>

      {isLoading && <p className="text-brand-muted text-center py-12">{t('common.loading')}</p>}

      {!isLoading && filteredOrders.length === 0 && (
        <EmptyState title={t('sales.noOrders')} icon="🧾" />
      )}

      {filteredOrders.length > 0 && (
        <div className="space-y-3">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            expanded={expandedId === order.id}
            onToggle={() => handleExpandedChange(expandedId === order.id ? null : order.id)}
            selectedItems={selectedItems[order.id] ?? []}
            onToggleItem={(item) => handleToggleItem(order.id, item)}
            onReturn={(item) => handleSingleReturn(order.id, item)}
            onBatchReturn={() => setBatchTarget({ soId: order.id })}
          />
        ))}
        </div>
      )}

      {batchTarget && selectedItems[batchTarget.soId]?.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-brand-dark rounded-xl p-6 w-full max-w-md relative shadow-[var(--shadow-floating)] max-h-[80vh] overflow-y-auto">
            <button
              onClick={clearBatch}
              className="absolute top-3 right-3 text-brand-muted hover:text-brand-gold transition-colors duration-150 text-lg leading-none"
            >
              ×
            </button>
            <h2 className="mb-5 text-lg font-bold text-brand-gold">{t('sales.returnTitle')}</h2>

            <div className="space-y-3 mb-4">
              {selectedItems[batchTarget.soId].map((s) => (
                <div key={s.itemId} className="flex justify-between items-center bg-brand-surface-hover rounded-lg p-3">
                  <div>
                    <p className="text-sm text-brand-light font-mono">{s.productId.slice(0, 8)}</p>
                    <p className="text-xs text-brand-muted">{t('common.quantity')}: {s.maxQty}</p>
                  </div>
                  <span className="text-sm text-brand-light font-mono">${s.priceUsd.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="batch-reason" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('sales.returnReason')}</label>
                <input
                  id="batch-reason"
                  type="text"
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
                />
              </div>
              <button
                onClick={() => {
                  handleBatchReturn();
                  clearBatch();
                  setSelectedItems((prev) => {
                    const rest = { ...prev };
                    delete rest[batchTarget.soId];
                    return rest;
                  });
                }}
                disabled={createReturn.isPending}
                className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
              >
                {createReturn.isPending ? t('common.saving') : t('sales.confirmReturn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderCardProps {
  order: SalesOrder;
  expanded: boolean;
  onToggle: () => void;
  selectedItems: SelectedItem[];
  onToggleItem: (item: SalesOrderItem) => void;
  onReturn: (item: SelectedItem) => void;
  onBatchReturn: () => void;
}

const OrderCard = ({ order, expanded, onToggle, selectedItems, onToggleItem, onReturn, onBatchReturn }: OrderCardProps) => {
  const { t } = useTranslation();
  const { data: items = [] } = useSalesOrderItems(order.id);

  return (
    <div className="bg-brand-dark border border-brand-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-sm)]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--clr-surface-hover)] transition-colors duration-150"
      >
        <div className="text-left">
          <p className="text-sm text-brand-muted">{new Date(order.order_date).toLocaleDateString()}</p>
          <p className="text-sm text-brand-muted mt-0.5">
            <span className="text-brand-light font-medium font-mono">${order.total_usd.toFixed(2)}</span>
            {' / '}
            <span className="text-brand-light font-mono">{order.total_syp.toLocaleString()} SYP</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            order.status === 'completed'
              ? 'bg-green-900/40 text-green-400 border border-green-800/50'
              : 'bg-red-900/40 text-red-400 border border-red-800/50'
          }`}>
            {order.status === 'completed' ? t('sales.completed') : t('sales.cancelled')}
          </span>
          <span className="text-brand-muted text-lg transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
      </button>

      {expanded && items.length > 0 && (
        <div className="border-t border-brand-border">
          <div className="flex items-center justify-between px-4 py-2 bg-brand-black/30">
            <span className="text-xs text-brand-muted">{t('common.selectItems')}</span>
            <button
              onClick={onBatchReturn}
              disabled={selectedItems.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-brand-black bg-brand-gold rounded-md hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-30"
            >
              {t('sales.returnSelected', { count: selectedItems.length })}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-black/50">
                <th className="px-2 py-2.5 text-center w-10">
                  <span className="sr-only">{t('common.select')}</span>
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.name')}</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.quantity')}</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.price')}</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {items.map((item) => {
                const isSelected = selectedItems.some((s) => s.itemId === item.id);
                return (
                  <tr key={item.id} className={`hover:bg-[var(--clr-surface-hover)] transition-colors duration-150 ${isSelected ? 'bg-brand-gold/5' : ''}`}>
                    <td className="px-2 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleItem(item)}
                        className="accent-brand-gold w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-brand-light text-sm">{item.product_id}</td>
                    <td className="px-4 py-2.5 text-center text-brand-light font-mono">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-brand-light font-mono text-sm">
                      ${item.unit_price_usd.toFixed(2)} / {item.unit_price_syp.toFixed(2)} SYP
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => onReturn({
                          itemId: item.id,
                          productId: item.product_id!,
                          maxQty: item.quantity,
                          priceUsd: item.unit_price_usd,
                          priceSyp: item.unit_price_syp,
                        })}
                        className="px-3 py-1 text-xs font-medium text-brand-gold bg-brand-gold/10 rounded-md hover:bg-brand-gold/20 transition-all duration-150"
                      >
                        {t('sales.return')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};