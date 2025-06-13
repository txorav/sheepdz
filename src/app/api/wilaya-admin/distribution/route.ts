// src/app/api/wilaya-admin/distribution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

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
    // Note: status and date filtering not implemented yet
    console.log('Search params received:', searchParams.toString()); // Use searchParams to avoid unused variable warning
    
    // Build filter conditions
    const whereConditions: Record<string, unknown> = {
      reservation: {
        wilayaAllocation: {
          wilayaId: session.user.wilayaId,
        },
      },
    };

    // Note: Removing date filtering since scheduledDate doesn't exist in schema
    // if (date) {
    //   const targetDate = new Date(date);
    //   const nextDate = new Date(targetDate);
    //   nextDate.setDate(nextDate.getDate() + 1);
    //   
    //   whereConditions.scheduledDate = {
    //     gte: targetDate,
    //     lt: nextDate,
    //   };
    // }

    // Get distributions for this wilaya
    const distributions = await prisma.distribution.findMany({
      where: whereConditions,
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
              },
            },
            payment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ distributions });
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return NextResponse.json({ error: 'Failed to fetch distributions' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'WILAYA_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: The current Distribution model is designed for individual reservation pickups,
    // not bulk distribution events. This functionality would require schema changes.
    return NextResponse.json({ 
      error: 'Distribution event creation not yet implemented. Use individual reservation management instead.' 
    }, { status: 501 });
  } catch (error) {
    console.error('Error creating distribution:', error);
    return NextResponse.json({ error: 'Failed to create distribution' }, { status: 500 });
  }
}
