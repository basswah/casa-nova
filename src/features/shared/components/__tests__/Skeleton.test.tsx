import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonText } from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('bg-brand-surface-hover');
    expect(el).toHaveClass('rounded-lg');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-1/2" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('h-4');
    expect(el).toHaveClass('w-1/2');
  });
});

describe('SkeletonCard', () => {
  it('renders card skeleton with animate-pulse elements', () => {
    const { container } = render(<SkeletonCard />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThanOrEqual(1);
  });
});

describe('SkeletonTable', () => {
  it('renders default 4 rows', () => {
    const { container } = render(<SkeletonTable />);
    const rows = container.querySelectorAll('.border-t');
    expect(rows.length).toBe(4);
  });

  it('renders custom row count', () => {
    const { container } = render(<SkeletonTable rows={2} />);
    const rows = container.querySelectorAll('.border-t');
    expect(rows.length).toBe(2);
  });
});

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(3);
  });

  it('renders custom line count', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(5);
  });

  it('last line has shorter width', () => {
    const { container } = render(<SkeletonText lines={2} />);
    const lines = container.querySelectorAll('.animate-pulse');
    const lastLine = lines[lines.length - 1] as HTMLElement;
    expect(lastLine.className).toContain('w-3/4');
  });
});
