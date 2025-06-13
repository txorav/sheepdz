
// src/app/admin/wilayas/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Wilaya {
  id: string;
  name: string;
  code: string;
  // Add other relevant fields from your Prisma schema
  createdAt: string;
  updatedAt: string;
}

export default function WilayasPage() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWilayas() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/wilayas');
        if (!response.ok) {
          throw new Error(`Failed to fetch wilayas: ${response.statusText}`);
        }
        const data = await response.json();
        setWilayas(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchWilayas();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Wilayas Management</h1>
        <Link href="/admin/wilayas/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Wilaya
        </Link>
      </div>

      {loading && <p>Loading wilayas...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wilayas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No wilayas found.
                  </td>
                </tr>
              )}
              {wilayas.map((wilaya) => (
                <tr key={wilaya.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wilaya.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wilaya.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(wilaya.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/wilayas/${wilaya.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Edit
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
