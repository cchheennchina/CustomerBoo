import { NextResponse } from "next/server";
import {
  createTasksFromMeeting,
  processMeetingInput,
} from "@/lib/meetings/service";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    opportunityId?: string;
    title?: string;
    rawInput?: string;
  };

  if (!body.opportunityId || !body.rawInput) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const result = await processMeetingInput(
    body.opportunityId,
    body.title ?? "项目沟通会",
    body.rawInput
  );

  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    opportunityId?: string;
    actionItems?: Array<{
      title: string;
      assignee: "SALES" | "PRESALES" | "DELIVERY";
      dueDays: number;
    }>;
  };

  if (!body.opportunityId || !body.actionItems) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const tasks = await createTasksFromMeeting(
    body.opportunityId,
    body.actionItems
  );

  return NextResponse.json({ tasks, message: `已创建 ${tasks.length} 个任务` });
}
