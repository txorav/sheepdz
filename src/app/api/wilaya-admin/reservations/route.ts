// src/app/api/wilaya-admin/reservations/route.ts
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build filter conditions
    const whereConditions: Record<string, unknown> = {
      wilayaAllocation: {
        wilayaId: session.user.wilayaId,
      },
    };

    if (status && status !== 'ALL') {
      whereConditions.status = status;
    }

    // Get reservations for this wilaya
    const reservations = await prisma.reservation.findMany({
      where: whereConditions,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.reservation.count({
      where: whereConditions,
    });

    return NextResponse.json({
      reservations,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}
