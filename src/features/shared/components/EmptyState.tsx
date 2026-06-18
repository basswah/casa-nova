interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon = '📦', title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <span className="text-4xl mb-4 opacity-50">{icon}</span>
    <h3 className="text-lg font-semibold text-brand-muted mb-1">{title}</h3>
    {description && <p className="text-sm text-brand-muted/70 max-w-sm">{description}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 active:scale-[0.98]"
      >
        {action.label}
      </button>
    )}
  </div>
);
