import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ===================================================
// GET - Fetch single customer
// ===================================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        appointments: true,
        notes: true,
        services: { include: { pricingPlan: true } },
        progress: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// ===================================================
// PUT - Update customer
// ===================================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const params = await context.params;

    // Check if customer exists
    const exists = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check for duplicate email (if changing email)
    if (body.email && body.email !== exists.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: body.email },
      });

      if (emailExists && emailExists.id !== params.id) {
        return NextResponse.json(
          {
            success: false,
            error: `Customer with email "${body.email}" already exists`,
          },
          { status: 409 }
        );
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        fullName: body.fullName,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        country: body.country || null,
        state: body.state || null,
        city: body.city || null,
        address: body.address || null,
        pictureURL: body.pictureURL || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// ===================================================
// DELETE - Delete customer
// ===================================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    console.log({ params });
    // Check if customer exists
    const exists = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete customer (CASCADE deletes all related data)
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
