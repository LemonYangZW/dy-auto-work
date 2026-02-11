export type WorkerState =
  | "starting"
  | "ready"
  | "busy"
  | "unhealthy"
  | "stopped"
  | "circuit_broken";

export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface WorkerStatus {
  state: WorkerState;
  last_heartbeat: string | null;
  restart_count_10m: number;
  in_flight_tasks: number;
}

export interface TaskInfo {
  task_id: string;
  task_type: string;
  project_id: string;
  status: TaskStatus;
  progress: number;
  message: string | null;
  output: unknown | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmitTaskInput {
  task_type: string;
  project_id: string;
  config?: Record<string, unknown>;
}
