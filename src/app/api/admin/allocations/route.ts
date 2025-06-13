// src/app/api/admin/allocations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST create new wilaya allocation
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sheepImportId, wilayaId, allocatedQuantity } = await request.json();

    if (!sheepImportId || !wilayaId || !allocatedQuantity) {
      return NextResponse.json({ 
        error: 'Sheep import ID, wilaya ID, and allocated quantity are required' 
      }, { status: 400 });
    }

    const quantity = parseInt(allocatedQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Allocated quantity must be a positive number' }, { status: 400 });
    }

    // Check if the sheep import exists
    const sheepImport = await prisma.sheepImport.findUnique({
      where: { id: sheepImportId },
      include: {
        wilayaAllocations: true,
      },
    });

    if (!sheepImport) {
      return NextResponse.json({ error: 'Sheep import not found' }, { status: 404 });
    }

    // Check if this wilaya already has an allocation for this import
    const existingAllocation = await prisma.wilayaAllocation.findFirst({
      where: {
        sheepImportId,
        wilayaId,
      },
    });

    if (existingAllocation) {
      return NextResponse.json({ 
        error: 'This wilaya already has an allocation for this import batch' 
      }, { status: 409 });
    }

    // Check if there are enough sheep remaining
    const totalAllocated = sheepImport.wilayaAllocations.reduce(
      (sum, allocation) => sum + allocation.allocatedQuantity, 0
    );
    const remainingToAllocate = sheepImport.totalQuantity - totalAllocated;

    if (quantity > remainingToAllocate) {
      return NextResponse.json({ 
        error: `Cannot allocate ${quantity} sheep. Only ${remainingToAllocate} sheep remaining.` 
      }, { status: 400 });
    }

    // Verify the wilaya exists
    const wilaya = await prisma.wilaya.findUnique({
      where: { id: wilayaId },
    });

    if (!wilaya) {
      return NextResponse.json({ error: 'Wilaya not found' }, { status: 404 });
    }

    // Create the allocation
    const allocation = await prisma.wilayaAllocation.create({
      data: {
        sheepImportId,
        wilayaId,
        allocatedQuantity: quantity,
        remainingQuantity: quantity, // Initially, all allocated sheep are available
      },
      include: {
        wilaya: true,
        sheepImport: true,
      },
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    console.error("Error creating allocation:", error);
    return NextResponse.json({ error: 'Failed to create allocation' }, { status: 500 });
  }
}
