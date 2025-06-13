// src/app/api/customer/reservations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET user's reservations
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'CUSTOMER' || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

// POST create new reservation
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'CUSTOMER' || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { wilayaAllocationId, familyNotebookNumber } = await request.json();

    if (!wilayaAllocationId || !familyNotebookNumber) {
      return NextResponse.json({ error: 'Wilaya allocation and family notebook number are required' }, { status: 400 });
    }

    // Check if this family notebook number already has a reservation
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        familyNotebookNumber: familyNotebookNumber,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PICKED_UP'],
        },
      },
    });

    if (existingReservation) {
      return NextResponse.json({ 
        error: 'This family notebook number already has an active reservation. Each family can only reserve one sheep.' 
      }, { status: 409 });
    }

    // Check if the allocation has available sheep
    const allocation = await prisma.wilayaAllocation.findUnique({
      where: { id: wilayaAllocationId },
    });

    if (!allocation || allocation.remainingQuantity <= 0) {
      return NextResponse.json({ error: 'No sheep available in this allocation' }, { status: 400 });
    }

    // Create the reservation and update allocation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the reservation
      const reservation = await tx.reservation.create({
        data: {
          userId: session.user!.id,
          wilayaAllocationId,
          familyNotebookNumber,
          quantity: 1, // Always 1 sheep per family
          status: 'PENDING',
        },
        include: {
          wilayaAllocation: {
            include: {
              wilaya: true,
              sheepImport: true,
            },
          },
        },
      });

      // Update the allocation's remaining quantity
      await tx.wilayaAllocation.update({
        where: { id: wilayaAllocationId },
        data: {
          remainingQuantity: {
            decrement: 1,
          },
        },
      });

      return reservation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
