import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectService from "@/services/project-service";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateScriptVersionInput,
  CreateSceneInput,
  UpdateSceneInput,
  SceneReorderItem,
} from "@/types/project";

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

// --- Script Mutations ---

export function useCreateScriptVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScriptVersionInput) =>
      projectService.createScriptVersion(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.scripts(variables.project_id) });
    },
  });
}

export function useLatestScript(projectId: string) {
  return useQuery({
    queryKey: [...projectKeys.scripts(projectId), "latest"] as const,
    queryFn: () => projectService.getLatestScript(projectId),
    enabled: !!projectId,
  });
}

// --- Scene Mutations ---

export function useCreateScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSceneInput) => projectService.createScene(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.scenes(variables.project_id) });
    },
  });
}

export function useUpdateScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, input, projectId: _projectId }: { sceneId: string; input: UpdateSceneInput; projectId: string }) =>
      projectService.updateScene(sceneId, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.scenes(variables.projectId) });
    },
  });
}

export function useDeleteScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId }: { sceneId: string; projectId: string }) =>
      projectService.deleteScene(sceneId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.scenes(variables.projectId) });
    },
  });
}

export function useReorderScenes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, items }: { projectId: string; items: SceneReorderItem[] }) =>
      projectService.reorderScenes(projectId, items),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.scenes(variables.projectId) });
    },
  });
}
