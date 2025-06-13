
// src/app/api/admin/imports/route.ts
import { NextResponse } from 'next/server';
import { ImportStatus } from '@/generated/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET all sheep imports
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const imports = await prisma.sheepImport.findMany({
      orderBy: {
        importDate: 'desc',
      },
    });
    return NextResponse.json(imports);
  } catch (error) {
    console.error("Error fetching sheep imports:", error);
    return NextResponse.json({ error: 'Failed to fetch sheep imports' }, { status: 500 });
  }
}

// POST a new sheep import batch
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { batchName, importDate, totalQuantity, originCountry, status } = await request.json();

    if (!importDate || !totalQuantity || !originCountry || !status) {
      return NextResponse.json({ error: 'Import Date, Total Quantity, Origin Country, and Status are required' }, { status: 400 });
    }

    if (isNaN(parseInt(totalQuantity)) || parseInt(totalQuantity) <= 0) {
      return NextResponse.json({ error: 'Total Quantity must be a positive number' }, { status: 400 });
    }

    if (!Object.values(ImportStatus).includes(status as ImportStatus)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const newImport = await prisma.sheepImport.create({
      data: {
        batchName,
        importDate: new Date(importDate),
        totalQuantity: parseInt(totalQuantity),
        remainingQuantity: parseInt(totalQuantity), // Initially, remaining is same as total
        originCountry,
        status: status as ImportStatus,
        // distributions and wilayaAllocations will be handled separately
      },
    });
    return NextResponse.json(newImport, { status: 201 });
  } catch (error) {
    console.error("Error creating sheep import:", error);
    // Consider more specific error messages based on Prisma errors if needed
    return NextResponse.json({ error: 'Failed to create sheep import' }, { status: 500 });
  }
}
