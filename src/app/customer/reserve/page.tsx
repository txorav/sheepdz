// src/app/customer/reserve/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Wilaya {
  id: string;
  name: string;
  code: string;
}

interface WilayaAllocation {
  id: string;
  remainingQuantity: number;
  wilaya: Wilaya;
  sheepImport: {
    id: string;
    batchName: string | null;
    importDate: string;
  };
}

export default function ReservePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [selectedWilayaId, setSelectedWilayaId] = useState('');
  const [availableAllocations, setAvailableAllocations] = useState<WilayaAllocation[]>([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState('');
  const [familyNotebookNumber, setFamilyNotebookNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available wilayas on component mount
  useEffect(() => {
    async function fetchWilayas() {
      try {
        const response = await fetch('/api/customer/wilayas');
        if (response.ok) {
          const data = await response.json();
          setWilayas(data);
        }
      } catch (err) {
        console.error('Error fetching wilayas:', err);
      }
    }
    fetchWilayas();
  }, []);

  // Fetch available allocations when a wilaya is selected
  useEffect(() => {
    if (selectedWilayaId) {
      async function fetchAllocations() {
        try {
          const response = await fetch(`/api/customer/allocations?wilayaId=${selectedWilayaId}`);
          if (response.ok) {
            const data = await response.json();
            setAvailableAllocations(data);
            setSelectedAllocationId(''); // Reset allocation selection
          }
        } catch (err) {
          console.error('Error fetching allocations:', err);
        }
      }
      fetchAllocations();
    } else {
      setAvailableAllocations([]);
      setSelectedAllocationId('');
    }
  }, [selectedWilayaId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!selectedAllocationId || !familyNotebookNumber.trim()) {
      setError('Please select a wilaya allocation and provide your family notebook number.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/customer/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wilayaAllocationId: selectedAllocationId,
          familyNotebookNumber: familyNotebookNumber.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      // Redirect to reservations page on success
      router.push('/customer/reservations?success=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Make a Sheep Reservation</h1>
      
      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
          <p className="text-blue-700">
            <strong>Important:</strong> Each family can only make one reservation using their family notebook number.
            Make sure to provide the correct family notebook number.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="wilaya" className="block text-gray-700 text-sm font-bold mb-2">
              Select Your Wilaya
            </label>
            <select
              id="wilaya"
              value={selectedWilayaId}
              onChange={(e) => setSelectedWilayaId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Choose a wilaya...</option>
              {wilayas.map((wilaya) => (
                <option key={wilaya.id} value={wilaya.id}>
                  {wilaya.name} ({wilaya.code})
                </option>
              ))}
            </select>
          </div>

          {selectedWilayaId && (
            <div className="mb-6">
              <label htmlFor="allocation" className="block text-gray-700 text-sm font-bold mb-2">
                Available Sheep Batches
              </label>
              {availableAllocations.length === 0 ? (
                <p className="text-gray-500 italic">No sheep available in this wilaya currently.</p>
              ) : (
                <select
                  id="allocation"
                  value={selectedAllocationId}
                  onChange={(e) => setSelectedAllocationId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Choose a batch...</option>
                  {availableAllocations.map((allocation) => (
                    <option key={allocation.id} value={allocation.id}>
                      {allocation.sheepImport.batchName || `Batch ${allocation.sheepImport.id.slice(0, 8)}`} 
                      - {allocation.remainingQuantity} available 
                      (Imported: {new Date(allocation.sheepImport.importDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="familyNotebook" className="block text-gray-700 text-sm font-bold mb-2">
              Family Notebook Number (رقم دفتر العائلة)
            </label>
            <input
              type="text"
              id="familyNotebook"
              value={familyNotebookNumber}
              onChange={(e) => setFamilyNotebookNumber(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your family notebook number"
              required
            />
            <p className="text-gray-600 text-sm mt-1">
              This number is used to ensure one sheep per family. Please enter it accurately.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || !selectedAllocationId || !familyNotebookNumber.trim()}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            >
              {loading ? 'Creating Reservation...' : 'Reserve My Sheep'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
