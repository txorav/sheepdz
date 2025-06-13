// src/app/tracking/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function TrackingPage() {
  // Get overall statistics
  const totalImports = await prisma.sheepImport.count();
  const totalSheepImported = await prisma.sheepImport.aggregate({
    _sum: {
      totalQuantity: true,
    },
  });
  
  const totalReserved = await prisma.reservation.count({
    where: {
      status: {
        in: ['PENDING', 'CONFIRMED', 'PICKED_UP'],
      },
    },
  });

  const totalPickedUp = await prisma.reservation.count({
    where: {
      status: 'PICKED_UP',
    },
  });

  // Get wilaya-wise breakdown
  const wilayaStats = await prisma.wilaya.findMany({
    include: {
      wilayaAllocations: {
        include: {
          reservations: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get recent imports
  const recentImports = await prisma.sheepImport.findMany({
    take: 5,
    orderBy: {
      importDate: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">🇩🇿 Sheep Distribution Tracking</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🐏 Algeria 2025 Sheep Distribution Tracking
          </h1>
          <p className="text-xl text-gray-600">
            Real-time tracking of sheep import and distribution across Algeria
          </p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {totalSheepImported._sum.totalQuantity || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Sheep Imported</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{totalReserved}</div>
            <div className="text-sm text-gray-600 mt-1">Total Reservations</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{totalPickedUp}</div>
            <div className="text-sm text-gray-600 mt-1">Successfully Picked Up</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalImports}</div>
            <div className="text-sm text-gray-600 mt-1">Import Batches</div>
          </div>
        </div>

        {/* Wilaya Breakdown */}
        <div className="bg-white shadow rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Distribution by Wilaya</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wilaya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wilayaStats.map((wilaya) => {
                  const totalAllocated = wilaya.wilayaAllocations.reduce(
                    (sum, allocation) => sum + allocation.allocatedQuantity, 0
                  );
                  const totalReservations = wilaya.wilayaAllocations.reduce(
                    (sum, allocation) => sum + allocation.reservations.length, 0
                  );
                  const remaining = wilaya.wilayaAllocations.reduce(
                    (sum, allocation) => sum + allocation.remainingQuantity, 0
                  );
                  const progressPercentage = totalAllocated > 0 
                    ? Math.round(((totalAllocated - remaining) / totalAllocated) * 100)
                    : 0;

                  return (
                    <tr key={wilaya.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{wilaya.name}</div>
                        <div className="text-sm text-gray-500">Code: {wilaya.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {totalAllocated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {totalReservations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {remaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{progressPercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Imports */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Imports</h2>
          <div className="space-y-4">
            {recentImports.map((import_) => (
              <div key={import_.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {import_.batchName || `Import Batch ${import_.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {import_.totalQuantity} sheep from {import_.originCountry}
                    </p>
                    <p className="text-sm text-gray-500">
                      Imported on {new Date(import_.importDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    import_.status === 'ARRIVED' ? 'bg-green-100 text-green-800' :
                    import_.status === 'DISTRIBUTED' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {import_.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
