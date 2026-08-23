import { useState, useEffect } from 'react';

export interface Filters {
  make: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

const EMPTY_FILTERS: Filters = { make: '', category: '', minPrice: '', maxPrice: '' };

interface Props {
  onSearch: (filters: Filters) => void;
  onReset: () => void;
}

export function SearchFilterBar({ onSearch, onReset }: Props) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  // Debounce search-as-you-type.
  useEffect(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    const timer = setTimeout(() => {
      if (hasFilters) onSearch(filters);
      else onReset();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const update = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));

  const clear = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="bg-white border border-charcoal/10 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Make</label>
        <input
          value={filters.make}
          onChange={(e) => update('make', e.target.value)}
          placeholder="Toyota…"
          className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none"
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Category</label>
        <input
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="Sedan, SUV…"
          className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none"
        />
      </div>
      <div className="w-28">
        <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Min $</label>
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => update('minPrice', e.target.value)}
          className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none font-mono"
        />
      </div>
      <div className="w-28">
        <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Max $</label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => update('maxPrice', e.target.value)}
          className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none font-mono"
        />
      </div>
      <button
        onClick={clear}
        className="px-4 py-2 text-sm font-medium border border-charcoal/20 rounded hover:bg-charcoal/5 transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
