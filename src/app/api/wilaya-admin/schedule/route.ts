// src/app/api/wilaya-admin/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notifyPickupReminder } from '@/lib/notifications';

// GET pickup schedules for wilaya
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'WILAYA_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.wilayaId) {
      return NextResponse.json({ error: 'Wilaya not assigned' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Get distributions with schedules for this wilaya
    const distributions = await prisma.distribution.findMany({
      where: {
        reservation: {
          wilayaAllocation: {
            wilayaId: session.user.wilayaId,
          },
        },
        pickedUpAt: date ? {
          gte: new Date(date + 'T00:00:00.000Z'),
          lt: new Date(date + 'T23:59:59.999Z'),
        } : undefined,
      },
      include: {
        reservation: {
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
          },
        },
      },
      orderBy: {
        pickedUpAt: 'asc',
      },
    });

    return NextResponse.json({ distributions });
  } catch (error) {
    console.error('Error fetching pickup schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// POST create bulk pickup schedule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'WILAYA_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.wilayaId) {
      return NextResponse.json({ error: 'Wilaya not assigned' }, { status: 400 });
    }

    const body = await request.json();
    const { pickupDate, pickupTime, location, reservationIds, sendReminders } = body;

    if (!pickupDate || !location || !reservationIds || reservationIds.length === 0) {
      return NextResponse.json({ 
        error: 'Pickup date, location, and reservation IDs are required' 
      }, { status: 400 });
    }

    // Verify reservations belong to this wilaya
    const reservations = await prisma.reservation.findMany({
      where: {
        id: { in: reservationIds },
        wilayaAllocation: {
          wilayaId: session.user.wilayaId,
        },
        status: 'CONFIRMED',
      },
      include: {
        user: true,
      },
    });

    if (reservations.length !== reservationIds.length) {
      return NextResponse.json({ 
        error: 'Some reservations not found or not eligible for scheduling' 
      }, { status: 400 });
    }

    // Create or update distributions for all reservations
    const distributions = await Promise.all(
      reservations.map(async (reservation) => {
        return await prisma.distribution.upsert({
          where: { reservationId: reservation.id },
          create: {
            reservationId: reservation.id,
            pickedUpAt: new Date(pickupDate + (pickupTime ? `T${pickupTime}:00.000Z` : 'T09:00:00.000Z')),
            confirmedBy: session.user.id,
          },
          update: {
            pickedUpAt: new Date(pickupDate + (pickupTime ? `T${pickupTime}:00.000Z` : 'T09:00:00.000Z')),
            confirmedBy: session.user.id,
          },
        });
      })
    );

    // Send pickup reminders if requested
    if (sendReminders) {
      await Promise.all(
        reservations.map(async (reservation) => {
          try {
            const pickupDateTime = new Date(pickupDate + (pickupTime ? `T${pickupTime}:00.000Z` : 'T09:00:00.000Z'));
            await notifyPickupReminder(
              reservation.user.id,
              pickupDateTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
              location
            );
          } catch (notificationError) {
            console.error(`Failed to send reminder to user ${reservation.user.id}:`, notificationError);
          }
        })
      );
    }

    return NextResponse.json({ 
      success: true, 
      scheduledCount: distributions.length,
      remindersSet: sendReminders 
    });
  } catch (error) {
    console.error('Error creating pickup schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
