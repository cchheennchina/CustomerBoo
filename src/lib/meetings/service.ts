import { prisma } from "@/lib/db";
import { generateMeetingSummary } from "@/lib/ai/client";

export async function processMeetingInput(
  opportunityId: string,
  title: string,
  rawInput: string
) {
  const previous = await prisma.meetingSession.findFirst({
    where: { opportunityId },
    orderBy: { createdAt: "desc" },
  });

  let previousNeeds: string[] = [];
  if (previous) {
    const parsed = JSON.parse(previous.structuredOutput || "{}") as {
      needs?: string[];
    };
    previousNeeds = parsed.needs ?? [];
  }

  const summary = await generateMeetingSummary(rawInput, previousNeeds);

  const session = await prisma.meetingSession.create({
    data: {
      opportunityId,
      title,
      rawInput,
      structuredOutput: JSON.stringify(summary),
    },
  });

  return { session, summary };
}

export async function createTasksFromMeeting(
  opportunityId: string,
  actionItems: Array<{
    title: string;
    assignee: "SALES" | "PRESALES" | "DELIVERY";
    dueDays: number;
  }>
) {
  const tasks = [];
  for (const item of actionItems) {
    const task = await prisma.task.create({
      data: {
        opportunityId,
        title: item.title,
        assignee: item.assignee,
        source: "MEETING",
        dueAt: new Date(Date.now() + item.dueDays * 86400000),
      },
    });
    tasks.push(task);
  }
  return tasks;
}
