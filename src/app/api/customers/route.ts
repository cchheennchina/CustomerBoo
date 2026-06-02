import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: {
      contacts: true,
      opportunities: { select: { id: true, name: true, healthScore: true, healthStatus: true } },
      _count: { select: { contacts: true, opportunities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    companyName?: string;
    industry?: string;
    keywords?: string;
    contactName?: string;
    contactTitle?: string;
    isDecisionMaker?: boolean;
  };

  if (!body.companyName?.trim()) {
    return NextResponse.json({ error: "公司名称必填" }, { status: 400 });
  }

  const keywords = (body.keywords ?? "")
    .split(/[;；,，]/)
    .map((k) => k.trim())
    .filter(Boolean);

  const customer = await prisma.customer.create({
    data: {
      companyName: body.companyName.trim(),
      industry: body.industry?.trim() || null,
      keywords: JSON.stringify(keywords),
      contacts: body.contactName
        ? {
            create: {
              name: body.contactName.trim(),
              title: body.contactTitle?.trim() || null,
              isDecisionMaker: body.isDecisionMaker ?? false,
            },
          }
        : undefined,
    },
    include: { contacts: true, opportunities: true },
  });

  return NextResponse.json({ success: true, customer });
}
