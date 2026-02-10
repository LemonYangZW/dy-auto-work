import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectService from "@/services/project-service";
import type { CreateProjectInput, UpdateProjectInput } from "@/types/project";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["project", id] as const,
  scripts: (projectId: string) => ["project", projectId, "scripts"] as const,
  scenes: (projectId: string) => ["project", projectId, "scenes"] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectService.listProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectService.createProject(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) =>
      projectService.updateProject(projectId, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useScenes(projectId: string) {
  return useQuery({
    queryKey: projectKeys.scenes(projectId),
    queryFn: () => projectService.listScenes(projectId),
    enabled: !!projectId,
  });
}

export function useScriptVersions(projectId: string) {
  return useQuery({
    queryKey: projectKeys.scripts(projectId),
    queryFn: () => projectService.listScriptVersions(projectId),
    enabled: !!projectId,
  });
}
