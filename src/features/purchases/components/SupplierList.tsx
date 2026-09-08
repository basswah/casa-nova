import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MagnifyingGlass,
  Users,
  WarningCircle,
  PencilSimple,
  Trash,
  Package,
  Phone,
} from '@phosphor-icons/react';
import { useSuppliers, useDeleteSupplier } from '@/features/purchases/hooks/useSuppliers';
import { SupplierForm } from '@/features/purchases/components/SupplierForm';
import { DeleteConfirmDialog } from '@/features/shared/components/DeleteConfirmDialog';
import type { Supplier } from '@/types/purchases';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutExpo } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOutExpo } },
};

const cardVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const AVATAR_COLORS = [
  'from-amber-500/20 to-orange-500/10',
  'from-blue-500/20 to-cyan-500/10',
  'from-purple-500/20 to-pink-500/10',
  'from-emerald-500/20 to-teal-500/10',
  'from-rose-500/20 to-red-500/10',
  'from-indigo-500/20 to-violet-500/10',
];

export const SupplierList = () => {
  const { t } = useTranslation();
  const { data: suppliers = [], isLoading, error } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const [openForm, setOpenForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filteredSuppliers = useMemo(() => {
    if (!search) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.contact_info?.toLowerCase() || '').includes(q)
    );
  }, [suppliers, search]);

  const getAvatarColor = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length];

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
    <div className="space-y-8 md:space-y-10">
      {/* Bento Metrics + Search Bar */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end justify-between"
      >
        {/* Metrics */}
        <motion.div variants={fadeSlideUp} className="flex gap-3 md:gap-4 flex-1">
          {[
            {
              label: t('suppliers.title'),
              value: suppliers.length,
              icon: Users,
              gradient: 'from-amber-500/10 to-orange-500/5',
              iconColor: 'text-amber-400/80',
            },
            {
              label: t('suppliers.contactInfo'),
              value: suppliers.filter((s) => s.contact_info).length,
              icon: Phone,
              gradient: 'from-blue-500/10 to-cyan-500/5',
              iconColor: 'text-blue-400/80',
            },
            {
              label: t('common.active', { defaultValue: 'Active' }),
              value: suppliers.length,
              icon: Package,
              gradient: 'from-emerald-500/10 to-teal-500/5',
              iconColor: 'text-emerald-400/80',
            },
          ].map((m, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`flex-1 min-w-0 rounded-2xl bg-gradient-to-br ${m.gradient} border border-brand-border/20 p-4 md:p-5 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] md:text-[11px] font-medium text-brand-muted/60 uppercase tracking-wider truncate">
                  {m.label}
                </span>
                <div className={`w-8 h-8 rounded-xl bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center ${m.iconColor} shrink-0`}>
                  <m.icon size={14} weight="duotone" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-brand-light font-mono tracking-tight">
                {m.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search + Add Button */}
        <motion.div variants={fadeSlideUp} className="flex gap-3 items-stretch lg:items-center">
          <div className="relative flex-1 lg:flex-none lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted/30">
              <MagnifyingGlass size={16} weight="bold" />
            </div>
            <label htmlFor="sup-search" className="sr-only">{t('common.search')}</label>
            <input
              id="sup-search"
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-brand-dark/60 backdrop-blur-xl border border-brand-border/30 rounded-2xl text-sm text-brand-light placeholder-brand-muted/30 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 focus:border-brand-gold/40 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_8px_-2px_rgba(0,0,0,0.15)]"
              style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
            />
          </div>

          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-[var(--clr-gold)] text-brand-black font-semibold rounded-2xl hover:shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all duration-300 shrink-0"
            style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
          >
            <Plus size={18} weight="bold" />
            <span className="hidden sm:inline">{t('suppliers.addSupplier')}</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Loading Skeleton */}
      {isLoading && (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              variants={fadeSlideUp}
              className="h-44 rounded-2xl bg-brand-dark/60 border border-brand-border/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-border/20 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 rounded-lg bg-brand-border/20 animate-pulse" />
                  <div className="h-3 w-16 rounded-lg bg-brand-border/15 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-32 rounded-lg bg-brand-border/15 animate-pulse" />
                <div className="h-3 w-20 rounded-lg bg-brand-border/10 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-900/15 border border-red-800/20 rounded-2xl text-red-400/80 text-sm flex items-center gap-2.5"
        >
          <WarningCircle size={18} weight="fill" className="shrink-0" />
          {error.message}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredSuppliers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: easeOutExpo }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-dark/60 border border-brand-border/30 flex items-center justify-center">
            <Users size={36} weight="duotone" className="text-brand-muted/25" />
          </div>
          <h3 className="text-base font-semibold text-brand-muted/70 mb-2" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
            {search ? t('common.noResults') : t('suppliers.noSuppliers')}
          </h3>
          <p className="text-sm text-brand-muted/45 max-w-sm leading-relaxed mb-6">
            {search
              ? t('common.tryDifferentSearch')
              : t('suppliers.emptyDescription', 'Start by adding your first supplier to begin tracking purchase orders')}
          </p>
          {!search && (
            <motion.button
              onClick={handleAdd}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[var(--clr-gold)] text-brand-black font-semibold rounded-2xl hover:shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all duration-300"
              style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
            >
              <Plus size={18} weight="bold" />
              {t('suppliers.addSupplier')}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Supplier Cards Grid */}
      <AnimatePresence mode="wait">
        {!isLoading && filteredSuppliers.length > 0 && (
          <motion.div
            key={`sup-grid-${search}`}
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                variants={cardVariant}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-brand-dark/50 backdrop-blur-sm border border-brand-border/25 rounded-2xl p-5 transition-all duration-300 hover:border-brand-gold/25 hover:shadow-[0_8px_32px_-8px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.06)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(index)} border border-brand-border/15 flex items-center justify-center text-lg font-bold text-brand-light/80 shrink-0`} style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                      {supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-brand-light/90 truncate leading-snug" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                        {supplier.name}
                      </h3>
                      <p className="text-[10px] font-mono text-brand-muted/35 mt-0.5 tracking-tight">
                        {supplier.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-4 p-3 rounded-xl bg-brand-black/20 border border-brand-border/10">
                  <div className="flex items-center gap-2">
                    <Phone size={12} weight="duotone" className="text-brand-muted/40 shrink-0" />
                    <p className="text-xs text-brand-muted/60 truncate">
                      {supplier.contact_info || t('suppliers.contactInfo', { defaultValue: 'No contact info' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-brand-border/10">
                  <motion.button
                    onClick={() => handleEdit(supplier)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-brand-gold bg-brand-gold/8 hover:bg-brand-gold/15 rounded-xl transition-all duration-200 border border-brand-gold/10 hover:border-brand-gold/20"
                  >
                    <PencilSimple size={14} />
                    {t('common.edit')}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteRequest(supplier)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-red-400/80 bg-red-400/5 hover:bg-red-400/12 rounded-xl transition-all duration-200 border border-red-400/10 hover:border-red-400/20"
                  >
                    <Trash size={14} />
                    {t('common.delete')}
                  </motion.button>
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
