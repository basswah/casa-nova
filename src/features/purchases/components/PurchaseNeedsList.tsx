import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, PencilSimple, Trash, CheckCircle, CircleDashed } from '@phosphor-icons/react';
import { usePurchaseNeeds, useDeletePurchaseNeed, useUpdatePurchaseNeed } from '@/features/purchases/hooks/usePurchaseNeeds';
import { EmptyState } from '@/features/shared/components/EmptyState';
import { useToastStore } from '@/features/shared/store/toastSlice';
import { PurchaseNeedForm } from '@/features/purchases/components/PurchaseNeedForm';
import type { PurchaseNeed } from '@/types/purchases';

type FilterStatus = 'all' | 'pending' | 'ordered';

export const PurchaseNeedsList = () => {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const { data: needs = [], isLoading, error } = usePurchaseNeeds();
  const deleteNeed = useDeletePurchaseNeed();
  const updateNeed = useUpdatePurchaseNeed();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<PurchaseNeed | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = needs.filter((n) => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return n.name.toLowerCase().includes(q) || (n.notes?.toLowerCase().includes(q) ?? false);
  });

  const handleToggleStatus = async (need: PurchaseNeed) => {
    const newStatus = need.status === 'pending' ? 'ordered' : 'pending';
    try {
      await updateNeed.mutateAsync({ id: need.id, payload: { status: newStatus } });
      addToast(
        newStatus === 'ordered' ? t('shortages.markedOrdered', 'Marked as ordered') : t('shortages.markedPending', 'Marked as pending'),
        'success',
      );
    } catch {
      addToast(t('common.error'), 'error');
    }
  };

  const handleDelete = async (need: PurchaseNeed) => {
    if (!confirm(t('shortages.deleteConfirm', 'Delete "{{name}}"?', { name: need.name }))) return;
    try {
      await deleteNeed.mutateAsync(need.id);
      addToast(t('shortages.deleted', 'Deleted'), 'success');
    } catch {
      addToast(t('common.error'), 'error');
    }
  };

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('purchases.filterAll') },
    { key: 'pending', label: t('shortages.pending', 'Pending') },
    { key: 'ordered', label: t('shortages.ordered', 'Ordered') },
  ];

  const pendingCount = needs.filter((n) => n.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="px-2.5 py-1 bg-brand-gold/10 text-brand-gold text-xs font-bold font-mono rounded-lg border border-brand-gold/20">
              {pendingCount} {t('shortages.pendingItems', 'pending')}
            </span>
          )}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/40">
            <MagnifyingGlass size={16} />
          </div>
          <label htmlFor="needs-search" className="sr-only">{t('common.search')}</label>
          <input
            id="needs-search"
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 transition-all duration-300 ease-out-expo"
          />
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-brand-dark rounded-xl border border-brand-border overflow-x-auto">
        {filterTabs.map((tab) => {
          const count = tab.key === 'all'
            ? needs.length
            : needs.filter((n) => n.status === tab.key).length;
          const isActive = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ease-out-expo active:scale-[0.97] flex items-center gap-1.5 ${
                isActive
                  ? 'bg-brand-gold text-brand-black shadow-sm'
                  : 'text-brand-muted hover:text-brand-light'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-mono ${isActive ? 'text-brand-black/60' : 'text-brand-muted/50'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gradient-to-r from-brand-surface-hover via-brand-dark to-brand-surface-hover rounded-xl bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-center gap-2.5"
        >
          <span>{error.message}</span>
        </motion.div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          title={search ? t('common.noResults') : t('shortages.noNeeds', 'No items in shortages list')}
          description={search ? t('common.tryDifferentSearch') : t('shortages.addFirstItem', 'Add items you need to purchase')}
        />
      )}

      <AnimatePresence mode="wait">
        {!isLoading && filtered.length > 0 && (
          <motion.div
            key={`${filterStatus}-${search}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2"
          >
            {filtered.map((need, index) => (
              <motion.div
                key={need.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={`group bg-brand-dark rounded-xl border p-4 flex items-center gap-4 transition-all duration-300 ease-out-expo hover:border-brand-gold/30 hover:shadow-[var(--shadow-hover)] ${
                  need.status === 'ordered' ? 'border-green-800/30 opacity-60' : 'border-brand-border/40'
                }`}
              >
                <button
                  onClick={() => handleToggleStatus(need)}
                  className="shrink-0 transition-all duration-200 active:scale-90"
                >
                  {need.status === 'ordered' ? (
                    <CheckCircle size={24} weight="fill" className="text-green-400" />
                  ) : (
                    <CircleDashed size={24} weight="duotone" className="text-brand-muted/40 hover:text-brand-gold" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${need.status === 'ordered' ? 'text-brand-muted line-through' : 'text-brand-light'}`}>
                    {need.name}
                  </p>
                  {need.notes && (
                    <p className="text-xs text-brand-muted/50 mt-0.5 truncate">{need.notes}</p>
                  )}
                </div>

                <span className="shrink-0 px-2.5 py-1 bg-brand-black/30 rounded-lg text-xs font-bold font-mono text-brand-light">
                  ×{need.quantity}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => { setEditItem(need); setShowForm(true); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all duration-200 active:scale-90"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(need)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 active:scale-90"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <PurchaseNeedForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        editItem={editItem}
      />
    </div>
  );
};
