interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <svg className="w-14 h-14 text-brand-muted/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
    <h3 className="text-base font-semibold text-brand-muted mb-2">{title}</h3>
    {description && <p className="text-sm text-brand-muted/60 max-w-sm leading-relaxed mb-5">{description}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] transition-all duration-200 active:scale-[0.98]"
      >
        {action.label}
      </button>
    )}
  </div>
);
