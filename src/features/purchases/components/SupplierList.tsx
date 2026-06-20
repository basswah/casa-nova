import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MagnifyingGlass, Users, WarningCircle, PencilSimple, Trash } from '@phosphor-icons/react';
import { useSuppliers, useDeleteSupplier } from '@/features/purchases/hooks/useSuppliers';
import { SupplierForm } from '@/features/purchases/components/SupplierForm';
import { SupplierTable } from '@/features/purchases/components/suppliers/SupplierTable';
import { DeleteConfirmDialog } from '@/features/shared/components/DeleteConfirmDialog';
import { EmptyState } from '@/features/shared/components/EmptyState';
import type { Supplier } from '@/types/purchases';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export const SupplierList = () => {
  const { t } = useTranslation();
  const { data: suppliers = [], isLoading, error } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const [openForm, setOpenForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filteredSuppliers = search
    ? suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_info?.toLowerCase() || '').includes(search.toLowerCase())
      )
    : suppliers;

  const handleAdd = () => {
    setEditingSupplier(null);
    setOpenForm(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingSupplier(null);
  };

  const handleDeleteRequest = (supplier: Supplier) => {
    setDeleteTarget(supplier);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSupplier.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Split Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="max-w-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-gold tracking-tight">{t('suppliers.title')}</h1>
          <p className="text-sm text-brand-muted mt-1.5 leading-relaxed">
            {t('suppliers.subtitle', 'Manage your vendor partners and supplier information')}
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <button
            onClick={handleAdd}
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all duration-300 ease-out-expo active:scale-[0.97] shrink-0"
          >
            <Plus size={18} weight="bold" className="group-hover:rotate-90 transition-transform duration-300 ease-out-expo" />
            {t('suppliers.addSupplier')}
          </button>
        </motion.div>
      </motion.div>

      {/* Summary + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex w-full sm:inline-flex sm:w-auto items-center gap-3 px-4 py-2 bg-brand-dark rounded-xl border border-brand-border/60">
          <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
            <Users size={18} weight="duotone" />
          </div>
          <div>
            <p className="text-xs text-brand-muted/70 uppercase tracking-widest">{t('suppliers.title')}</p>
            <p className="text-lg font-bold font-mono text-brand-light leading-none mt-0.5">{suppliers.length}</p>
          </div>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/40">
            <MagnifyingGlass size={16} />
          </div>
          <label htmlFor="sup-search" className="sr-only">{t('common.search')}</label>
          <input
            id="sup-search"
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 transition-all duration-300 ease-out-expo"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gradient-to-r from-brand-surface-hover via-brand-dark to-brand-surface-hover rounded-xl bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-center gap-2.5"
        >
          <WarningCircle size={18} weight="fill" className="shrink-0" />
          {error.message}
        </motion.div>
      )}

      {/* Empty */}
      {!isLoading && !error && filteredSuppliers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <EmptyState
            title={search ? t('common.noResults') : t('suppliers.noSuppliers')}
            description={search ? t('common.tryDifferentSearch') : t('suppliers.emptyDescription', 'Start by adding your first supplier to begin tracking purchase orders')}
            action={!search ? { label: t('suppliers.addSupplier'), onClick: handleAdd } : undefined}
          />
        </motion.div>
      )}

      {/* Table */}
      <AnimatePresence mode="wait">
        {!isLoading && filteredSuppliers.length > 0 && (
          <motion.div
            key={`sup-${search}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <SupplierTable
              suppliers={filteredSuppliers}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile card list */}
      <AnimatePresence mode="wait">
        {!isLoading && filteredSuppliers.length > 0 && (
          <motion.div
            key={`sup-mobile-${search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden space-y-3"
          >
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
                className="bg-brand-dark rounded-xl border border-brand-border/60 p-4 hover:border-brand-gold/20 hover:shadow-[var(--shadow-hover)] transition-all duration-300 ease-out-expo"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-brand-surface-hover flex items-center justify-center text-sm font-semibold text-brand-muted shrink-0">
                      {supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-light truncate">{supplier.name}</p>
                      <p className="text-xs text-brand-muted/60 font-mono mt-0.5">{supplier.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-brand-muted mb-3">
                  {supplier.contact_info || '-'}
                </div>
                <div className="flex gap-2 pt-3 border-t border-brand-border/50">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10 rounded-lg transition-all duration-200 active:scale-[0.97]"
                  >
                    <PencilSimple size={14} />
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(supplier)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all duration-200 active:scale-[0.97]"
                  >
                    <Trash size={14} />
                    {t('common.delete')}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <SupplierForm
        open={openForm}
        onClose={handleCloseForm}
        supplier={editingSupplier}
      />

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={t('suppliers.deleteSupplier')}
        message={t('suppliers.deleteConfirm', { name: deleteTarget?.name })}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};
