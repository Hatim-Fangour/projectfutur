import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/customers
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 API called');
    
    const body = await request.json();
    console.log('📦 Body:', body);
    
    const customer = await prisma.customer.create({ data: body });
    console.log('✅ Created:', customer);
    
    return NextResponse.json({ success: true, data: customer });
    
  } catch (error: any) {
    console.error('❌ ERROR:', error.message); // ← Look for this in terminal!
    console.error('Error code:', error.code);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


// GET - Fetch all customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    console.log("GET route is executed")

    // Build where clause
    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    // Fetch customers
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          appointments: {
            take: 5,
            orderBy: { startTime: 'desc' },
          },
          notes: {
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}