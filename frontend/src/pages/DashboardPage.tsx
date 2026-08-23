import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { SearchFilterBar, type Filters } from '../components/SearchFilterBar';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Vehicle, VehicleInput } from '../types';

export function DashboardPage() {
  const { token, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | 'new' | null>(null);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setVehicles(await api.listVehicles(token));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSearch = async (filters: Filters) => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.make) params.make = filters.make;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      setVehicles(await api.searchVehicles(token, params));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (vehicle: Vehicle) => {
    if (!token) return;
    const updated = await api.purchaseVehicle(token, vehicle.id, 1);
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleRestock = async (vehicle: Vehicle) => {
    if (!token) return;
    const updated = await api.restockVehicle(token, vehicle.id, 5);
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!token) return;
    if (!confirm(`Delete ${vehicle.make} ${vehicle.model}? This can't be undone.`)) return;
    await api.deleteVehicle(token, vehicle.id);
    setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
  };

  const handleFormSubmit = async (input: VehicleInput) => {
    if (!token) return;
    if (modalVehicle && modalVehicle !== 'new') {
      const updated = await api.updateVehicle(token, modalVehicle.id, input);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } else {
      const created = await api.createVehicle(token, input);
      setVehicles((prev) => [...prev, created]);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl uppercase tracking-wide">Current Inventory</h2>
            <p className="text-slate text-sm font-mono">{vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} on the lot</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setModalVehicle('new')}
              className="px-4 py-2 rounded font-medium text-sm bg-racing-green text-paper hover:bg-racing-green-light transition-colors"
            >
              + Add Vehicle
            </button>
          )}
        </div>

        <SearchFilterBar onSearch={handleSearch} onReset={loadAll} />

        {error && (
          <p className="text-sm bg-signal-red/10 text-signal-red border border-signal-red/30 rounded px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-slate font-mono text-sm">Loading inventory…</p>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-charcoal/20 rounded-lg">
            <p className="font-display text-xl text-slate uppercase">No vehicles match</p>
            <p className="text-sm text-slate/70 mt-1">Try clearing filters, or add a vehicle to the lot.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                onPurchase={handlePurchase}
                onEdit={(v) => setModalVehicle(v)}
                onDelete={handleDelete}
                onRestock={handleRestock}
              />
            ))}
          </div>
        )}
      </main>

      {modalVehicle && (
        <VehicleFormModal
          vehicle={modalVehicle === 'new' ? null : modalVehicle}
          onSubmit={handleFormSubmit}
          onClose={() => setModalVehicle(null)}
        />
      )}
    </div>
  );
}
