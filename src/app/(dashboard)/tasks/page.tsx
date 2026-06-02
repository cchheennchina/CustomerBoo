import { TopBar } from "@/components/layout/TopBar";
import { GlassCard, SectionTitle } from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { opportunity: true },
    orderBy: [{ completed: "asc" }, { dueAt: "asc" }],
  });

  return (
    <>
      <TopBar title="任务中心" />
      <GlassCard>
        <SectionTitle title="待办与行动项" subtitle={`共 ${tasks.length} 项`} />
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <div>
                <p className={task.completed ? "line-through text-white/40" : ""}>
                  {task.title}
                </p>
                <p className="text-xs text-white/50">
                  {task.opportunity?.name ?? "未关联机会"} · {task.assignee} ·{" "}
                  {task.source}
                </p>
              </div>
              <span className="text-white/60">{formatDate(task.dueAt)}</span>
            </div>
          ))}
          {tasks.length === 0 ? (
            <p className="py-6 text-center text-white/50">暂无任务</p>
          ) : null}
        </div>
      </GlassCard>
    </>
  );
}
