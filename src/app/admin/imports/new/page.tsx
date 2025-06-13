
// src/app/admin/imports/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { ImportStatus } from '@/generated/prisma';

export default function NewImportPage() {
  const router = useRouter();
  const [batchName, setBatchName] = useState('');
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [totalQuantity, setTotalQuantity] = useState('');
  const [originCountry, setOriginCountry] = useState('Romania'); // Default
  const [status, setStatus] = useState<ImportStatus>(ImportStatus.PENDING);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!importDate || !totalQuantity || !originCountry) {
      setError('Import Date, Total Quantity, and Origin Country are required.');
      setSubmitting(false);
      return;
    }

    const quantity = parseInt(totalQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Total Quantity must be a positive number.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/imports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchName: batchName || null,
          importDate,
          totalQuantity: quantity,
          originCountry,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create import record: ${response.statusText}`);
      }

      router.push('/admin/imports');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Sheep Import Batch</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="batchName" className="block text-gray-700 text-sm font-bold mb-2">
              Batch Name (Optional)
            </label>
            <input
              type="text"
              id="batchName"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="importDate" className="block text-gray-700 text-sm font-bold mb-2">
              Import Date
            </label>
            <input
              type="date"
              id="importDate"
              value={importDate}
              onChange={(e) => setImportDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="totalQuantity" className="block text-gray-700 text-sm font-bold mb-2">
              Total Quantity
            </label>
            <input
              type="number"
              id="totalQuantity"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="originCountry" className="block text-gray-700 text-sm font-bold mb-2">
              Origin Country
            </label>
            <input
              type="text"
              id="originCountry"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ImportStatus)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {Object.values(ImportStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Add Import Batch'}
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
  );
}
