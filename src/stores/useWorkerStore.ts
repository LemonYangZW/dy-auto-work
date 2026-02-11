import { create } from "zustand";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { WorkerStatus, TaskInfo } from "@/types/worker";

interface WorkerStore {
  status: WorkerStatus;
  tasks: TaskInfo[];
  setStatus: (status: WorkerStatus) => void;
  upsertTask: (task: TaskInfo) => void;
  mergeTasks: (tasks: TaskInfo[]) => void;
}

const INITIAL_STATUS: WorkerStatus = {
  state: "stopped",
  last_heartbeat: null,
  restart_count_10m: 0,
  in_flight_tasks: 0,
};

/** Merge a single task into the list, keeping the newer version by updated_at */
function upsertTaskInList(list: TaskInfo[], task: TaskInfo): TaskInfo[] {
  const idx = list.findIndex((t) => t.task_id === task.task_id);
  if (idx === -1) return [task, ...list];

  const existing = list[idx];
  // Only update if incoming data is newer or same age
  if (existing.updated_at > task.updated_at) return list;

  const next = [...list];
  next[idx] = task;
  return next;
}

/** Merge a full task list from polling, preserving newer local state */
function mergeTaskLists(local: TaskInfo[], remote: TaskInfo[]): TaskInfo[] {
  const localMap = new Map(local.map((t) => [t.task_id, t]));

  for (const remoteTask of remote) {
    const localTask = localMap.get(remoteTask.task_id);
    // Only update if remote is newer or task is new
    if (!localTask || remoteTask.updated_at >= localTask.updated_at) {
      localMap.set(remoteTask.task_id, remoteTask);
    }
  }

  return Array.from(localMap.values()).sort(
    (a, b) => b.updated_at.localeCompare(a.updated_at),
  );
}

export const useWorkerStore = create<WorkerStore>()((set) => ({
  status: INITIAL_STATUS,
  tasks: [],

  setStatus: (status) => set({ status }),

  upsertTask: (task) =>
    set((state) => ({ tasks: upsertTaskInList(state.tasks, task) })),

  mergeTasks: (tasks) =>
    set((state) => ({ tasks: mergeTaskLists(state.tasks, tasks) })),
}));

let unlisteners: UnlistenFn[] = [];

export async function startWorkerEventListeners(): Promise<void> {
  await stopWorkerEventListeners();

  const { setStatus, upsertTask } = useWorkerStore.getState();

  const u1 = await listen<WorkerStatus>("worker:status", (event) => {
    setStatus(event.payload);
  });

  const u2 = await listen<TaskInfo>("task:progress", (event) => {
    upsertTask(event.payload);
  });

  const u3 = await listen<TaskInfo>("task:completed", (event) => {
    upsertTask(event.payload);
  });

  const u4 = await listen<TaskInfo>("task:failed", (event) => {
    upsertTask(event.payload);
  });

  unlisteners = [u1, u2, u3, u4];
}

export async function stopWorkerEventListeners(): Promise<void> {
  for (const unlisten of unlisteners) {
    unlisten();
  }
  unlisteners = [];
}
