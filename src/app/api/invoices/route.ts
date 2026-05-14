import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { clientId, amount } = await req.json();
    const clientExists = await prisma.client.findUnique({ where: { id: clientId } });

    if (!clientExists) {
      return NextResponse.json({ error: "Client ID not found" }, { status: 404 });
    }

    const parsedAmount = parseFloat(amount.toString());
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNo: `INV-${Date.now()}`,
        amount: parsedAmount,
        total: parsedAmount,
        status: "UNPAID",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 din baad
        client: { connect: { id: clientId } },
      },
    });
    return NextResponse.json(newInvoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}