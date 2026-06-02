import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    companyName?: string;
    industry?: string;
    keywords?: string;
    contactName?: string;
    contactTitle?: string;
    isDecisionMaker?: boolean;
  };

  const existing = await prisma.customer.findUnique({
    where: { id },
    include: { contacts: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "客户不存在" }, { status: 404 });
  }

  const keywords = body.keywords
    ? body.keywords
        .split(/[;；,，]/)
        .map((k) => k.trim())
        .filter(Boolean)
    : JSON.parse(existing.keywords || "[]");

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      companyName: body.companyName?.trim() ?? existing.companyName,
      industry: body.industry?.trim() ?? existing.industry,
      keywords: JSON.stringify(keywords),
    },
    include: { contacts: true, opportunities: true },
  });

  if (body.contactName && existing.contacts[0]) {
    await prisma.contact.update({
      where: { id: existing.contacts[0].id },
      data: {
        name: body.contactName.trim(),
        title: body.contactTitle?.trim() || null,
        isDecisionMaker: body.isDecisionMaker ?? existing.contacts[0].isDecisionMaker,
      },
    });
  } else if (body.contactName) {
    await prisma.contact.create({
      data: {
        customerId: id,
        name: body.contactName.trim(),
        title: body.contactTitle?.trim() || null,
        isDecisionMaker: body.isDecisionMaker ?? false,
      },
    });
  }

  return NextResponse.json({ success: true, customer });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "客户不存在" }, { status: 404 });
  }

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "客户已删除" });
}
