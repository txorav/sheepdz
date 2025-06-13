
// src/app/admin/imports/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SheepImport {
  id: string;
  batchName?: string | null;
  importDate: string;
  totalQuantity: number;
  remainingQuantity: number;
  originCountry: string;
  status: string; // ImportStatus enum
  createdAt: string;
}

export default function ImportsPage() {
  const [imports, setImports] = useState<SheepImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImports() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/imports');
        if (!response.ok) {
          throw new Error(`Failed to fetch imports: ${response.statusText}`);
        }
        const data = await response.json();
        setImports(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchImports();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sheep Imports Management</h1>
        <Link href="/admin/imports/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Import Batch
        </Link>
      </div>

      {loading && <p>Loading import records...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Import Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View/Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {imports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No import records found.
                  </td>
                </tr>
              )}
              {imports.map((imp) => (
                <tr key={imp.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{imp.batchName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(imp.importDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.originCountry}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.remainingQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/imports/${imp.id}`} className="text-indigo-600 hover:text-indigo-900">
                      View/Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
