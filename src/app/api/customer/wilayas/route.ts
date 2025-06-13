// src/app/api/customer/wilayas/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET all wilayas for customer selection
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wilayas = await prisma.wilaya.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(wilayas);
  } catch (error) {
    console.error("Error fetching wilayas:", error);
    return NextResponse.json({ error: 'Failed to fetch wilayas' }, { status: 500 });
  }
}
