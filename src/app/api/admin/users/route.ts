// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const whereConditions: Record<string, unknown> = {};
    if (role && role !== 'ALL') {
      whereConditions.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        wilaya: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, wilayaId, familyNotebookNumber } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Check family notebook number for customers
    if (role === 'CUSTOMER' && familyNotebookNumber) {
      const existingNotebook = await prisma.user.findUnique({
        where: { familyNotebookNumber },
      });

      if (existingNotebook) {
        return NextResponse.json({ error: 'Family notebook number already registered' }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let userData;
    
    if (role === 'WILAYA_ADMIN' && wilayaId) {
      userData = {
        name,
        email,
        password: hashedPassword,
        role,
        wilayaId,
      };
    } else if (role === 'CUSTOMER' && familyNotebookNumber) {
      userData = {
        name,
        email,
        password: hashedPassword,
        role,
        familyNotebookNumber,
      };
    } else {
      userData = {
        name,
        email,
        password: hashedPassword,
        role,
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        wilaya: true,
      },
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
