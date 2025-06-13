// src/app/admin/imports/[id]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AllocationManager from '@/components/AllocationManager';

export default async function ImportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  // Fetch the import with allocations
  const sheepImport = await prisma.sheepImport.findUnique({
    where: { id },
    include: {
      wilayaAllocations: {
        include: {
          wilaya: true,
          reservations: true,
        },
        orderBy: {
          wilaya: {
            name: 'asc',
          },
        },
      },
    },
  });

  if (!sheepImport) {
    notFound();
  }

  // Get all wilayas for allocation
  const allWilayas = await prisma.wilaya.findMany({
    orderBy: { name: 'asc' },
  });

  const totalAllocated = sheepImport.wilayaAllocations.reduce(
    (sum, allocation) => sum + allocation.allocatedQuantity, 0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Import Batch Details</h1>
        <Link
          href="/admin/imports"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Imports
        </Link>
      </div>

      {/* Import Overview */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Import Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Batch Name</p>
            <p className="font-medium">{sheepImport.batchName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Import Date</p>
            <p className="font-medium">{new Date(sheepImport.importDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Origin Country</p>
            <p className="font-medium">{sheepImport.originCountry}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              sheepImport.status === 'ARRIVED' ? 'bg-green-100 text-green-800' :
              sheepImport.status === 'DISTRIBUTED' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {sheepImport.status}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Imported</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{sheepImport.totalQuantity}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Allocated</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{totalAllocated}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700">Remaining Unallocated</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{sheepImport.totalQuantity - totalAllocated}</p>
        </div>
      </div>

      {/* Allocation Manager */}
      <AllocationManager 
        sheepImport={sheepImport}
        allWilayas={allWilayas}
      />

      {/* Current Allocations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Allocations</h2>
        {sheepImport.wilayaAllocations.length === 0 ? (
          <p className="text-gray-500">No allocations created yet. Use the allocation manager above to distribute sheep to wilayas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wilaya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocated Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sheepImport.wilayaAllocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{allocation.wilaya.name}</div>
                      <div className="text-sm text-gray-500">Code: {allocation.wilaya.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allocation.allocatedQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allocation.reservations.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allocation.remainingQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(allocation.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
