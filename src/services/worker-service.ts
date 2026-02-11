import { invoke } from "@tauri-apps/api/core";
import type { WorkerStatus, TaskInfo, SubmitTaskInput } from "@/types/worker";

export async function getWorkerStatus(): Promise<WorkerStatus> {
  return invoke<WorkerStatus>("get_worker_status");
}

export async function submitTask(input: SubmitTaskInput): Promise<string> {
  return invoke<string>("submit_task", { input });
}

export async function cancelTask(taskId: string): Promise<boolean> {
  return invoke<boolean>("cancel_task", { taskId });
}

export async function listTasks(): Promise<TaskInfo[]> {
  return invoke<TaskInfo[]>("list_tasks");
}

export async function startWorker(): Promise<void> {
  return invoke<void>("start_worker");
}

export async function stopWorker(): Promise<void> {
  return invoke<void>("stop_worker");
}
