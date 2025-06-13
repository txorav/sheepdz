// src/app/customer/reservations/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CustomerReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const searchParamsData = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Error: User not found</div>;
  }

  // Fetch user's reservations
  const reservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      wilayaAllocation: {
        include: {
          wilaya: true,
          sheepImport: true,
        },
      },
      payment: true,
      distribution: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Reservations</h1>
        <Link 
          href="/customer/reserve" 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Make New Reservation
        </Link>
      </div>

      {searchParamsData.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">Your reservation has been created successfully.</span>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🐏</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Reservations Yet</h2>
          <p className="text-gray-600 mb-6">You haven't made any sheep reservations yet.</p>
          <Link 
            href="/customer/reserve" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Make Your First Reservation
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservation Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wilaya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Family: {reservation.familyNotebookNumber}
                        </div>
                        <div className="text-gray-500">
                          Reserved: {new Date(reservation.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">
                          Batch: {reservation.wilayaAllocation.sheepImport.batchName || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.wilayaAllocation.wilaya.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Code: {reservation.wilayaAllocation.wilaya.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reservation.payment ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reservation.payment.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          reservation.payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reservation.payment.status}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">No payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/customer/reservations/${reservation.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </Link>
                        {!reservation.payment && reservation.status !== 'CANCELLED' && (
                          <Link
                            href={`/customer/payment/${reservation.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Pay Now
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
