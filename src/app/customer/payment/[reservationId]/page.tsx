// src/app/customer/payment/[reservationId]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import PaymentForm from '@/components/PaymentForm';

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch the reservation
  const reservation = await prisma.reservation.findUnique({
    where: {
      id: reservationId,
      userId: session.user.id, // Ensure user owns this reservation
    },
    include: {
      wilayaAllocation: {
        include: {
          wilaya: true,
          sheepImport: true,
        },
      },
      payment: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  // If payment already exists and is paid, redirect to reservation details
  if (reservation.payment?.status === 'PAID') {
    redirect(`/customer/reservations/${reservation.id}?paid=true`);
  }

  // Calculate payment amount (this could be dynamic based on import batch, but for now it's fixed)
  const paymentAmount = 15000; // 15,000 DZD for example

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment for Sheep Reservation</h1>
      
      {/* Reservation Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reservation Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Wilaya</p>
            <p className="font-medium">{reservation.wilayaAllocation.wilaya.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Family Notebook</p>
            <p className="font-medium">{reservation.familyNotebookNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Import Batch</p>
            <p className="font-medium">
              {reservation.wilayaAllocation.sheepImport.batchName || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quantity</p>
            <p className="font-medium">{reservation.quantity} sheep</p>
          </div>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-blue-900">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-900">{paymentAmount.toLocaleString()} DZD</span>
        </div>
      </div>

      {/* Payment Form Component */}
      <PaymentForm 
        reservationId={reservation.id}
        amount={paymentAmount}
        existingPayment={reservation.payment}
      />
    </div>
  );
}
