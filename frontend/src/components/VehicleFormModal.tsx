import { useState, type FormEvent } from 'react';
import type { Vehicle, VehicleInput } from '../types';

interface Props {
  vehicle?: Vehicle | null;
  onSubmit: (input: VehicleInput) => Promise<void>;
  onClose: () => void;
}

export function VehicleFormModal({ vehicle, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<VehicleInput>({
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    category: vehicle?.category ?? '',
    price: vehicle?.price ?? 0,
    quantity: vehicle?.quantity ?? 0
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 flex items-center justify-center p-4 z-50">
      <div className="bg-paper rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-charcoal text-paper px-5 py-4 rounded-t-lg border-b-4 border-amber flex items-center justify-between">
          <h2 className="font-display text-xl uppercase tracking-wide">
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>
          <button onClick={onClose} className="text-paper/70 hover:text-paper" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <p className="text-sm bg-signal-red/10 text-signal-red border border-signal-red/30 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Make</label>
              <input
                required
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Model</label>
              <input
                required
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Category</label>
            <input
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Sedan, SUV, Truck, Coupe…"
              className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Price ($)</label>
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-slate mb-1">Quantity</label>
              <input
                required
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-charcoal/15 rounded text-sm focus:border-amber outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded font-medium text-sm border border-charcoal/20 hover:bg-charcoal/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded font-medium text-sm bg-amber text-charcoal hover:bg-amber-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : vehicle ? 'Save changes' : 'Add vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
