import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkerStore } from "@/stores/useWorkerStore";
import type { WorkerState } from "@/types/worker";
import { cn } from "@/lib/utils";

const STATE_CONFIG: Record<
  WorkerState,
  { label: string; dotColor: string; variant: "success" | "warning" | "destructive" | "secondary" | "outline" }
> = {
  ready: { label: "就绪", dotColor: "bg-emerald-400", variant: "success" },
  busy: { label: "运行中", dotColor: "bg-blue-400 animate-pulse", variant: "secondary" },
  starting: { label: "启动中", dotColor: "bg-yellow-400 animate-pulse", variant: "warning" },
  unhealthy: { label: "异常", dotColor: "bg-orange-400", variant: "warning" },
  stopped: { label: "已停止", dotColor: "bg-zinc-400", variant: "outline" },
  circuit_broken: { label: "熔断", dotColor: "bg-red-500", variant: "destructive" },
};

export function WorkerStatusBadge({ className }: { className?: string }) {
  const status = useWorkerStore((s) => s.status);
  const config = STATE_CONFIG[status.state];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={config.variant} size="sm" className={cn("gap-1.5 cursor-default focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1", className)} tabIndex={0}>
          <span className={cn("size-1.5 rounded-full", config.dotColor)} />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p>Worker 状态: {config.label}</p>
        {status.in_flight_tasks > 0 && (
          <p>进行中任务: {status.in_flight_tasks}</p>
        )}
        {status.restart_count_10m > 0 && (
          <p>近10分钟重启: {status.restart_count_10m}次</p>
        )}
        {status.last_heartbeat && (
          <p>最近心跳: {new Date(status.last_heartbeat).toLocaleTimeString()}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
