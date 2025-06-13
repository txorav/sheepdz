// src/app/customer/reservations/[id]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ReservationDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string; paid?: string }>;
}) {
  const { id } = await params;
  const searchParamsData = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Error: User not found</div>;
  }

  // Fetch the reservation
  const reservation = await prisma.reservation.findUnique({
    where: { 
      id,
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
  });

  if (!reservation) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PICKED_UP': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportStatusColor = (status: string) => {
    switch (status) {
      case 'ARRIVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DISTRIBUTED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Messages */}
      {searchParamsData.payment === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Payment recorded successfully! </strong>
          Your payment has been confirmed and your reservation is now active.
        </div>
      )}
      
      {searchParamsData.paid === 'true' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Payment completed! </strong>
          Thank you for your payment. Your reservation is confirmed.
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/customer/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="text-gray-400">/</span>
              <Link href="/customer/reservations" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                Reservations
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="text-gray-400">/</span>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                Reservation Details
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Reservation Status Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Reservation Status</h2>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
            {reservation.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Reservation ID</dt>
            <dd className="text-sm font-medium text-gray-900">{reservation.id.slice(0, 8)}...</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Family Notebook Number</dt>
            <dd className="text-sm font-medium text-gray-900">{reservation.familyNotebookNumber}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Quantity</dt>
            <dd className="text-sm font-medium text-gray-900">{reservation.quantity} sheep</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Wilaya</dt>
            <dd className="text-sm font-medium text-gray-900">{reservation.wilayaAllocation.wilaya.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Import Batch</dt>
            <dd className="text-sm font-medium text-gray-900">
              {reservation.wilayaAllocation.sheepImport.batchName || `Batch ${reservation.wilayaAllocation.sheepImport.id.slice(0, 8)}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Origin Country</dt>
            <dd className="text-sm font-medium text-gray-900">
              {reservation.wilayaAllocation.sheepImport.originCountry}
            </dd>
          </div>
        </div>
      </div>

      {/* Import Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Import Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm text-gray-600">Import Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImportStatusColor(reservation.wilayaAllocation.sheepImport.status)}`}>
                {reservation.wilayaAllocation.sheepImport.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Import Date</dt>
            <dd className="text-sm font-medium text-gray-900">
              {new Date(reservation.wilayaAllocation.sheepImport.importDate).toLocaleDateString()}
            </dd>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
        
        {reservation.payment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm text-gray-600">Amount</dt>
                <dd className="text-sm font-medium text-gray-900">
                  ${reservation.payment.amount} DZD
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Payment Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    reservation.payment.status === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reservation.payment.status}
                  </span>
                </dd>
              </div>
              {reservation.payment.paidAt && (
                <div>
                  <dt className="text-sm text-gray-600">Paid On</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(reservation.payment.paidAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                {reservation.payment.status === 'PAID' 
                  ? 'Your payment has been received and confirmed.'
                  : 'Your payment has been received and confirmed.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Required</h3>
            <p className="text-sm text-gray-700 mb-4">
              Complete your payment to confirm your reservation.
            </p>
            <Link 
              href={`/customer/payment?reservationId=${reservation.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Make Payment
            </Link>
          </div>
        )}
      </div>

      {/* Distribution Information */}
      {reservation.distribution && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-gray-600">Pickup Status</dt>
              <dd className="text-sm font-medium text-gray-900">
                {reservation.distribution.pickedUpAt ? 'Completed' : 'Pending'}
              </dd>
            </div>
            {reservation.distribution.pickedUpAt && (
              <div>
                <dt className="text-sm text-gray-600">Picked Up On</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(reservation.distribution.pickedUpAt).toLocaleDateString()}
                </dd>
              </div>
            )}
          </div>
          
          {!reservation.distribution.pickedUpAt && (
            <div className="bg-green-50 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-green-800 mb-2">Pickup Instructions</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Bring your family notebook</li>
                <li>• Arrive during scheduled pickup hours</li>
                <li>• Bring valid identification</li>
                <li>• Contact the distribution center if you have questions</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
        <div className="space-y-3">
          <Link 
            href="/customer/reservations"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Reservations
          </Link>
          
          {reservation.status === 'PENDING' && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Need to cancel? Contact support for assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
