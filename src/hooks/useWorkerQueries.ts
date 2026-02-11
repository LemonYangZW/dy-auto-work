import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as workerService from "@/services/worker-service";
import { useWorkerStore } from "@/stores/useWorkerStore";
import type { SubmitTaskInput } from "@/types/worker";

export const workerKeys = {
  status: ["worker", "status"] as const,
  tasks: ["worker", "tasks"] as const,
};

export function useWorkerStatus() {
  const setStatus = useWorkerStore((s) => s.setStatus);

  return useQuery({
    queryKey: workerKeys.status,
    queryFn: async () => {
      const status = await workerService.getWorkerStatus();
      setStatus(status);
      return status;
    },
    refetchInterval: 30_000,
  });
}

export function useTasks() {
  const mergeTasks = useWorkerStore((s) => s.mergeTasks);

  return useQuery({
    queryKey: workerKeys.tasks,
    queryFn: async () => {
      const tasks = await workerService.listTasks();
      mergeTasks(tasks);
      return tasks;
    },
    refetchInterval: 30_000,
  });
}

export function useSubmitTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitTaskInput) => workerService.submitTask(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workerKeys.tasks });
      qc.invalidateQueries({ queryKey: workerKeys.status });
    },
  });
}

export function useCancelTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => workerService.cancelTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workerKeys.tasks });
      qc.invalidateQueries({ queryKey: workerKeys.status });
    },
  });
}

export function useStartWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => workerService.startWorker(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workerKeys.status });
    },
  });
}

export function useStopWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => workerService.stopWorker(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workerKeys.status });
    },
  });
}
