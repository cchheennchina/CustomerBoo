import { NextResponse } from "next/server";
import { generateChannelCopies } from "@/lib/ai/client";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    opportunityId?: string;
    title?: string;
    summary?: string;
    valuePoint?: string;
  };

  if (!body.opportunityId || !body.title) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const opp = await prisma.opportunity.findUnique({
    where: { id: body.opportunityId },
    include: { customer: { include: { contacts: true } } },
  });
  if (!opp) {
    return NextResponse.json({ error: "机会不存在" }, { status: 404 });
  }

  const contactName = opp.customer.contacts[0]?.name ?? "客户";
  const copies = await generateChannelCopies({
    title: body.title,
    summary: body.summary ?? "",
    contactName,
    valuePoint: body.valuePoint ?? "支持跨系统无缝迁移，效率提升 50%",
  });

  await prisma.contentItem.create({
    data: {
      opportunityId: body.opportunityId,
      title: body.title,
      summary: body.summary ?? "",
      valuePoint: copies.valuePoint,
      wechatCopy: copies.wechat,
      emailCopy: copies.email,
      linkedinCopy: copies.linkedin,
    },
  });

  return NextResponse.json({ success: true, message: "内容已生成并保存" });
}
