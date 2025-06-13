// src/components/AllocationManager.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Wilaya {
  id: string;
  name: string;
  code: string;
}

interface WilayaAllocation {
  id: string;
  wilayaId: string;
  allocatedQuantity: number;
  remainingQuantity: number;
  wilaya: Wilaya;
  reservations: any[];
}

interface SheepImport {
  id: string;
  batchName: string | null;
  totalQuantity: number;
  remainingQuantity: number;
  wilayaAllocations: WilayaAllocation[];
}

interface AllocationManagerProps {
  sheepImport: SheepImport;
  allWilayas: Wilaya[];
}

export default function AllocationManager({ sheepImport, allWilayas }: AllocationManagerProps) {
  const router = useRouter();
  const [selectedWilayaId, setSelectedWilayaId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAllocated = sheepImport.wilayaAllocations.reduce(
    (sum, allocation) => sum + allocation.allocatedQuantity, 0
  );
  const remainingToAllocate = sheepImport.totalQuantity - totalAllocated;

  // Get wilayas that don't have allocations yet
  const allocatedWilayaIds = sheepImport.wilayaAllocations.map(a => a.wilayaId);
  const availableWilayas = allWilayas.filter(w => !allocatedWilayaIds.includes(w.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!selectedWilayaId || !quantity) {
      setError('Please select a wilaya and enter a quantity');
      setLoading(false);
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a positive number');
      setLoading(false);
      return;
    }

    if (quantityNum > remainingToAllocate) {
      setError(`Cannot allocate more than ${remainingToAllocate} remaining sheep`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheepImportId: sheepImport.id,
          wilayaId: selectedWilayaId,
          allocatedQuantity: quantityNum,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create allocation');
      }

      // Reset form and refresh page
      setSelectedWilayaId('');
      setQuantity('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Allocate Sheep to Wilayas</h2>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">
          <strong>Available to allocate:</strong> {remainingToAllocate} sheep out of {sheepImport.totalQuantity} total
        </p>
      </div>

      {remainingToAllocate > 0 && availableWilayas.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="wilaya" className="block text-sm font-medium text-gray-700 mb-1">
                Select Wilaya
              </label>
              <select
                id="wilaya"
                value={selectedWilayaId}
                onChange={(e) => setSelectedWilayaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Choose a wilaya...</option>
                {availableWilayas.map((wilaya) => (
                  <option key={wilaya.id} value={wilaya.id}>
                    {wilaya.name} ({wilaya.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Allocate
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={remainingToAllocate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
              >
                {loading ? 'Allocating...' : 'Allocate Sheep'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-6">
          {remainingToAllocate === 0 ? (
            <div>
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-600">All sheep from this import have been allocated to wilayas.</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📍</div>
              <p className="text-gray-600">All available wilayas have been allocated sheep from this import.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick allocation suggestions */}
      {remainingToAllocate > 0 && availableWilayas.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Quick Allocation Suggestions</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Even distribution: {Math.floor(remainingToAllocate / availableWilayas.length)} sheep per remaining wilaya</p>
            <p>• Population-based: Allocate based on wilaya population size</p>
            <p>• Demand-based: Allocate based on historical reservation patterns</p>
          </div>
        </div>
      )}
    </div>
  );
}
