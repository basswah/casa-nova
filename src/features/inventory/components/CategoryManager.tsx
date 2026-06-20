import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion, type Easing } from 'framer-motion';
import { X, Plus, Tag, PencilSimple, Trash, Check, XCircle } from '@phosphor-icons/react';
import type { Category } from '@/types/inventory';

const categorySchema = z.object({ name: z.string().min(1).max(100) });
type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];
const easeOutBack: Easing = [0.34, 1.56, 0.64, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOutExpo } },
};

export const CategoryManager = ({ open, onClose, categories, onAdd, onUpdate, onDelete, loading }: CategoryManagerProps) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const handleAdd = (data: CategoryFormData) => {
    onAdd(data.name);
    reset();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    reset({ name: cat.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ name: '' });
  };

  const confirmEdit = (data: CategoryFormData) => {
    if (editingId) {
      onUpdate(editingId, data.name);
      setEditingId(null);
      reset({ name: '' });
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    onDelete(id);
  };

  const inputClass = 'w-full px-3 py-2.5 bg-brand-black/60 border border-brand-border/40 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.35, ease: easeOutBack }}
            className="relative w-full max-w-lg bg-brand-dark/95 backdrop-blur-sm rounded-xl md:rounded-2xl border border-brand-border/30 shadow-[var(--shadow-floating)] max-h-[90vh] overflow-y-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center justify-between p-5 pb-0">
              <h2 className="text-sm font-bold text-brand-gold tracking-tight">
                {t('categoryManager.manageCategories')}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted/40 hover:text-brand-light hover:bg-brand-black/40 transition-all duration-150 active:scale-[0.9]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={editingId ? handleSubmit(confirmEdit) : handleSubmit(handleAdd)}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <Tag size={16} weight="duotone" className="text-brand-muted/40 shrink-0" />
                      <input
                        {...register('name')}
                        className={inputClass}
                        placeholder={t('categoryManager.newCategoryPlaceholder')}
                      />
                    </div>
                    {errors.name && <p className="text-red-400/80 text-[11px] mt-1.5 ml-7">{errors.name.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="shrink-0 h-[42px] px-4 bg-brand-gold text-brand-black font-semibold rounded-xl text-sm hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_28px_-6px_rgba(212,175,55,0.3)] transition-all duration-300 ease-out-expo disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center gap-2"
                  >
                    {editingId ? (
                      <>
                        <Check size={16} weight="bold" />
                        <span>{t('common.save')}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} weight="bold" />
                        <span>{t('common.add')}</span>
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="shrink-0 h-[42px] px-3 bg-brand-black/60 border border-brand-border/40 text-brand-muted/60 rounded-xl text-sm hover:text-brand-light hover:border-brand-border/70 transition-all duration-200 ease-out-expo active:scale-[0.97] flex items-center gap-2"
                    >
                      <XCircle size={16} />
                      <span>{t('common.cancel')}</span>
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {categories.length === 0 && (
                    <motion.p
                      variants={fadeSlideUp}
                      initial="initial"
                      animate="animate"
                      className="text-sm text-brand-muted/40 text-center py-8"
                    >
                      {t('categoryManager.noCategories')}
                    </motion.p>
                  )}
                  {categories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: easeOutExpo }}
                      className="group flex items-center justify-between px-3.5 py-2.5 bg-brand-black/30 border border-brand-border/20 rounded-xl hover:bg-brand-black/50 hover:border-brand-border/40 transition-all duration-300 ease-out-expo shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    >
                      <div className="flex items-center gap-3">
                        <Tag size={14} weight="duotone" className="text-brand-muted/30 shrink-0" />
                        <span className="text-sm text-brand-light capitalize">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(cat)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-muted/30 hover:text-brand-gold hover:bg-brand-gold/10 transition-all duration-150 active:scale-[0.85]"
                          aria-label={t('common.edit')}
                        >
                          <PencilSimple size={14} weight="duotone" />
                        </button>
                        <button
                          onClick={() => confirmDelete(cat.id)}
                          disabled={loading && deletingId === cat.id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-muted/30 hover:text-red-400 hover:bg-red-900/20 transition-all duration-150 active:scale-[0.85] disabled:opacity-40"
                          aria-label={t('common.delete')}
                        >
                          <Trash size={14} weight="duotone" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
