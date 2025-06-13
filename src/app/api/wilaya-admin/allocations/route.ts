// src/app/api/wilaya-admin/allocations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'WILAYA_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.wilayaId) {
      return NextResponse.json({ error: 'Wilaya not assigned' }, { status: 400 });
    }

    // Get allocations for this wilaya
    const allocations = await prisma.wilayaAllocation.findMany({
      where: {
        wilayaId: session.user.wilayaId,
      },
      include: {
        sheepImport: true,
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                familyNotebookNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ allocations });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
  }
}
