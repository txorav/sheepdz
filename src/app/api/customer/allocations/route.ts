// src/app/api/customer/allocations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET available wilaya allocations for a specific wilaya
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const wilayaId = searchParams.get('wilayaId');

  if (!wilayaId) {
    return NextResponse.json({ error: 'Wilaya ID is required' }, { status: 400 });
  }

  try {
    const allocations = await prisma.wilayaAllocation.findMany({
      where: {
        wilayaId: wilayaId,
        remainingQuantity: {
          gt: 0, // Only get allocations with remaining sheep
        },
      },
      include: {
        wilaya: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        sheepImport: {
          select: {
            id: true,
            batchName: true,
            importDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(allocations);
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
  }
}
