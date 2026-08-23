import { useState } from 'react';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (vehicle: Vehicle) => Promise<void>;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => Promise<void>;
  onRestock: (vehicle: Vehicle) => Promise<void>;
}

const GAUGE_SEGMENTS = 5;
const GAUGE_MAX = 10; // quantities above this still show a full gauge

function stockLevel(quantity: number): 'empty' | 'low' | 'good' {
  if (quantity === 0) return 'empty';
  if (quantity <= 2) return 'low';
  return 'good';
}

const LEVEL_COLOR: Record<string, string> = {
  empty: 'bg-signal-red',
  low: 'bg-amber',
  good: 'bg-racing-green'
};

function StockGauge({ quantity }: { quantity: number }) {
  const level = stockLevel(quantity);
  const filled = Math.min(GAUGE_SEGMENTS, Math.ceil((quantity / GAUGE_MAX) * GAUGE_SEGMENTS) || (quantity > 0 ? 1 : 0));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate">Stock</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate">
          {quantity === 0 ? 'E' : quantity >= GAUGE_MAX ? 'F' : `${quantity} left`}
        </span>
      </div>
      <div className="flex gap-1" aria-label={`${quantity} in stock`}>
        {Array.from({ length: GAUGE_SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-sm ${i < filled ? LEVEL_COLOR[level] : 'bg-charcoal/10'}`}
          />
        ))}
      </div>
    </div>
  );
}

export function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const [busy, setBusy] = useState<'purchase' | 'delete' | 'restock' | null>(null);
  const outOfStock = vehicle.quantity === 0;

  const wrap = async (kind: 'purchase' | 'delete' | 'restock', fn: () => Promise<void>) => {
    setBusy(kind);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="relative bg-white border border-charcoal/10 rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Window-sticker price tag */}
      <div className="absolute top-3 right-3 bg-charcoal text-paper rounded px-2.5 py-1.5 shadow-md">
        <p className="text-[9px] font-mono uppercase tracking-widest text-amber leading-none mb-0.5">MSRP</p>
        <p className="font-mono font-semibold text-sm leading-none">${vehicle.price.toLocaleString()}</p>
      </div>

      <div className="p-5 pb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest text-slate mb-1">{vehicle.category}</p>
        <h3 className="font-display text-2xl leading-tight pr-20">
          {vehicle.make} <span className="text-slate">{vehicle.model}</span>
        </h3>
      </div>

      <div className="px-5 pb-4">
        <StockGauge quantity={vehicle.quantity} />
      </div>

      <div className="mt-auto px-5 py-4 border-t border-charcoal/10 flex flex-col gap-2">
        <button
          disabled={outOfStock || busy !== null}
          onClick={() => wrap('purchase', () => onPurchase(vehicle))}
          className="w-full py-2 rounded font-medium text-sm transition-colors
            bg-amber text-charcoal hover:bg-amber-dark
            disabled:bg-charcoal/10 disabled:text-slate disabled:cursor-not-allowed"
        >
          {outOfStock ? 'Out of stock' : busy === 'purchase' ? 'Purchasing…' : 'Purchase'}
        </button>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(vehicle)}
              className="flex-1 py-1.5 rounded text-xs font-medium border border-charcoal/20 hover:bg-charcoal/5 transition-colors"
            >
              Edit
            </button>
            <button
              disabled={busy !== null}
              onClick={() => wrap('restock', () => onRestock(vehicle))}
              className="flex-1 py-1.5 rounded text-xs font-medium border border-racing-green/40 text-racing-green hover:bg-racing-green/5 transition-colors disabled:opacity-50"
            >
              {busy === 'restock' ? 'Restocking…' : 'Restock +5'}
            </button>
            <button
              disabled={busy !== null}
              onClick={() => wrap('delete', () => onDelete(vehicle))}
              className="flex-1 py-1.5 rounded text-xs font-medium border border-signal-red/40 text-signal-red hover:bg-signal-red/5 transition-colors disabled:opacity-50"
            >
              {busy === 'delete' ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
