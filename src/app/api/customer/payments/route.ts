// src/app/api/customer/payments/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notifyPaymentConfirmation } from '@/lib/notifications';

// POST create payment for reservation
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'CUSTOMER' || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reservationId, amount, paymentMethod, ccpNumber } = await request.json();

    if (!reservationId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Reservation ID, amount, and payment method are required' }, { status: 400 });
    }

    if (paymentMethod === 'CCP' && !ccpNumber) {
      return NextResponse.json({ error: 'CCP number is required for CCP payments' }, { status: 400 });
    }

    // Verify the reservation belongs to the user
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
        userId: session.user.id,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { reservationId },
    });

    if (existingPayment) {
      return NextResponse.json({ error: 'Payment already exists for this reservation' }, { status: 409 });
    }

    // Create the payment record
    const payment = await prisma.payment.create({
      data: {
        reservationId,
        amount: parseFloat(amount),
        status: paymentMethod === 'CASH' ? 'PENDING' : 'PENDING', // Both start as PENDING
        // Note: For CCP, we could store additional info like CCP number in a separate field if needed
      },
    });

    // Update reservation status if needed
    if (reservation.status === 'PENDING') {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'CONFIRMED' },
      });
    }

    // Send payment confirmation notification
    try {
      await notifyPaymentConfirmation(session.user.id, parseFloat(amount));
    } catch (notificationError) {
      console.error('Failed to send payment notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
