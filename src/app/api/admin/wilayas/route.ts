
// src/app/api/admin/wilayas/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const prisma = new PrismaClient();

// GET all wilayas
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wilayas = await prisma.wilaya.findMany({
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

// POST a new wilaya
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, code } = await request.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    // Check if wilaya with the same code already exists
    const existingWilaya = await prisma.wilaya.findUnique({
      where: { code },
    });

    if (existingWilaya) {
      return NextResponse.json({ error: 'Wilaya with this code already exists' }, { status: 409 });
    }

    const newWilaya = await prisma.wilaya.create({
      data: {
        name,
        code,
      },
    });
    return NextResponse.json(newWilaya, { status: 201 });
  } catch (error) {
    console.error("Error creating wilaya:", error);
    return NextResponse.json({ error: 'Failed to create wilaya' }, { status: 500 });
  }
}
