import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkerStore } from "@/stores/useWorkerStore";
import { useCancelTask } from "@/hooks/useWorkerQueries";
import type { TaskInfo, TaskStatus } from "@/types/worker";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<
  TaskStatus,
  { label: string; variant: "secondary" | "success" | "destructive" | "warning" | "outline" }
> = {
  pending: { label: "排队", variant: "outline" },
  running: { label: "执行中", variant: "secondary" },
  completed: { label: "完成", variant: "success" },
  failed: { label: "失败", variant: "destructive" },
  cancelled: { label: "已取消", variant: "warning" },
};

const TASK_TYPE_LABELS: Record<string, string> = {
  "ai:script": "AI 脚本生成",
  "ai:storyboard": "AI 分镜生成",
  "ai:image": "AI 图片生成",
  "ai:video": "AI 视频生成",
  "ai:tts": "AI 语音合成",
  "export:video": "视频导出",
};

function formatTaskType(type: string): string {
  return TASK_TYPE_LABELS[type] ?? type;
}

function TaskItem({ task }: { task: TaskInfo }) {
  const cancelTask = useCancelTask();
  const badge = STATUS_BADGE[task.status];
  const isActive = task.status === "running" || task.status === "pending";

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-[var(--foreground)]">
          {formatTaskType(task.task_type)}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
          {isActive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => cancelTask.mutate(task.task_id)}
                  disabled={cancelTask.isPending}
                  aria-label={`取消任务: ${formatTaskType(task.task_type)}`}
                >
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>取消任务</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {task.status === "running" && (
        <div className="flex items-center gap-2">
          <Progress value={task.progress * 100} className="h-1.5 flex-1" />
          <span className="text-[10px] tabular-nums text-[var(--muted-foreground)] shrink-0">
            {Math.round(task.progress * 100)}%
          </span>
        </div>
      )}

      {task.message && (
        <p className="text-xs text-[var(--muted-foreground)] truncate">{task.message}</p>
      )}

      {task.error && (
        <p className="text-xs text-[var(--destructive)] truncate">{task.error}</p>
      )}
    </div>
  );
}

export function TaskQueuePanel({ className }: { className?: string }) {
  const tasks = useWorkerStore((s) => s.tasks);

  const { activeTasks, completedTasks } = useMemo(() => {
    const active = tasks.filter((t) => t.status === "running" || t.status === "pending");
    const completed = tasks.filter(
      (t) => t.status === "completed" || t.status === "failed" || t.status === "cancelled",
    );
    return { activeTasks: active, completedTasks: completed };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-8 text-sm text-[var(--muted-foreground)]", className)}>
        暂无任务
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="flex flex-col gap-2 p-2">
        {activeTasks.length > 0 && (
          <>
            <p className="px-1 text-xs font-medium text-[var(--muted-foreground)]">
              进行中 ({activeTasks.length})
            </p>
            {activeTasks.map((task) => (
              <TaskItem key={task.task_id} task={task} />
            ))}
          </>
        )}

        {completedTasks.length > 0 && (
          <>
            <p className="px-1 pt-2 text-xs font-medium text-[var(--muted-foreground)]">
              已完成 ({completedTasks.length})
            </p>
            {completedTasks.map((task) => (
              <TaskItem key={task.task_id} task={task} />
            ))}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
