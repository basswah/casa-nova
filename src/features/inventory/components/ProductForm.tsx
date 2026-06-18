import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/features/inventory/validations/productSchema';
import type { Product, NewProduct, UpdateProduct } from '@/types/inventory';
import { useCategories } from '@/features/inventory/hooks/useCategories';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: NewProduct | UpdateProduct) => void;
  loading?: boolean;
  error?: string | null;
}

export const ProductForm = ({ open, onClose, product, onSubmit, loading, error }: ProductFormProps) => {
  const { t } = useTranslation();
  const isEdit = !!product;
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          category_id: product.category_id ?? '',
          price_usd: product.price_usd,
          price_syp: product.price_syp,
          cost_usd: product.cost_usd,
          cost_syp: product.cost_syp,
          quantity: product.quantity,
        }
      : {
          name: '',
          sku: null,
          category_id: '',
          price_usd: 0,
          price_syp: 0,
          cost_usd: 0,
          cost_syp: 0,
          quantity: 0,
        },
  });

  const handleFormSubmit = (data: ProductFormData) => {
    const payload = {
      ...data,
      sku: data.sku || null,
      category_id: data.category_id || null,
    };
    onSubmit(payload);
    if (!isEdit) reset();
  };

  if (!open) return null;

  const inputClass = 'w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-brand-dark rounded-xl p-6 w-full max-w-md relative shadow-[var(--shadow-floating)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-brand-muted hover:text-brand-gold transition-colors duration-150 text-lg leading-none"
        >
          ×
        </button>
        <h2 className="mb-5 text-center text-xl font-bold text-brand-gold tracking-tight">
          {t(isEdit ? 'productForm.editProduct' : 'productForm.newProduct')}
        </h2>

        {error && (
          <p className="mb-3 p-2.5 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="pf-name" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('productForm.productName')}</label>
            <input id="pf-name" {...register('name')} className={inputClass} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="pf-sku" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('inventory.sku')}</label>
            <input id="pf-sku" {...register('sku')} className={inputClass} />
          </div>

          <div>
            <label htmlFor="pf-category" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('inventory.category')}</label>
            <select id="pf-category" {...register('category_id')} className={inputClass + ' capitalize'} disabled={categoriesLoading}>
              <option value="">{t('productForm.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-price-usd" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('inventory.priceUsd')}</label>
              <input id="pf-price-usd" type="number" step="0.01" {...register('price_usd', { valueAsNumber: true })} className={inputClass} />
              {errors.price_usd && <p className="text-red-400 text-xs mt-1">{errors.price_usd.message}</p>}
            </div>
            <div>
              <label htmlFor="pf-price-syp" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('inventory.priceSyp')}</label>
              <input id="pf-price-syp" type="number" step="0.01" {...register('price_syp', { valueAsNumber: true })} className={inputClass} />
              {errors.price_syp && <p className="text-red-400 text-xs mt-1">{errors.price_syp.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-cost-usd" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('inventory.costUsd')}</label>
              <input id="pf-cost-usd" type="number" step="0.01" {...register('cost_usd', { valueAsNumber: true })} className={inputClass} />
              {errors.cost_usd && <p className="text-red-400 text-xs mt-1">{errors.cost_usd.message}</p>}
            </div>
            <div>
              <label htmlFor="pf-cost-syp" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('inventory.costSyp')}</label>
              <input id="pf-cost-syp" type="number" step="0.01" {...register('cost_syp', { valueAsNumber: true })} className={inputClass} />
              {errors.cost_syp && <p className="text-red-400 text-xs mt-1">{errors.cost_syp.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="pf-qty" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('productForm.quantity')}</label>
            <input id="pf-qty" type="number" {...register('quantity', { valueAsNumber: true })} className={inputClass} />
            {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
          >
            {loading || isSubmitting ? t('common.saving') : isEdit ? t('productForm.updateProduct') : t('productForm.addProduct')}
          </button>
        </form>
      </div>
    </div>
  );
};
