// src/app/api/wilaya-admin/reservations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notifyUserReservationUpdate } from '@/lib/notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'WILAYA_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.wilayaId) {
      return NextResponse.json({ error: 'Wilaya not assigned' }, { status: 400 });
    }

    const body = await request.json();
    const { status, rejectionReason, pickupDate, pickupLocation, pickupTime } = body;

    // Verify reservation belongs to this wilaya
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        wilayaAllocation: {
          wilayaId: session.user.wilayaId,
        },
      },
      include: {
        wilayaAllocation: true,
        user: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Update reservation based on status
    const updateData: Record<string, unknown> = { status };

    if (status === 'CANCELLED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      // Return the quantity back to the allocation
      await prisma.wilayaAllocation.update({
        where: { id: reservation.wilayaAllocationId },
        data: {
          remainingQuantity: {
            increment: reservation.quantity,
          },
        },
      });
    }

    if (status === 'CONFIRMED' && (pickupDate || pickupLocation || pickupTime)) {
      // Create or update distribution record
      await prisma.distribution.upsert({
        where: { reservationId: reservation.id },
        create: {
          reservationId: reservation.id,
          pickedUpAt: pickupDate ? new Date(pickupDate) : null,
          confirmedBy: session.user.id,
        },
        update: {
          pickedUpAt: pickupDate ? new Date(pickupDate) : undefined,
          confirmedBy: session.user.id,
        },
      });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            familyNotebookNumber: true,
          },
        },
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

    // Send notification to user
    try {
      await notifyUserReservationUpdate(
        reservation.user.id,
        status,
        rejectionReason
      );
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}
