import { invoke } from "@tauri-apps/api/core";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ScriptVersion,
  CreateScriptVersionInput,
  StoryboardScene,
  CreateSceneInput,
  UpdateSceneInput,
  SceneReorderItem,
} from "@/types/project";

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return invoke<Project>("create_project", { input });
}

export async function listProjects(): Promise<Project[]> {
  return invoke<Project[]>("list_projects");
}

export async function getProject(projectId: string): Promise<Project | null> {
  return invoke<Project | null>("get_project", { projectId });
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project | null> {
  return invoke<Project | null>("update_project", { projectId, input });
}

export async function deleteProject(projectId: string): Promise<boolean> {
  return invoke<boolean>("delete_project", { projectId });
}

export async function createScriptVersion(
  input: CreateScriptVersionInput,
): Promise<ScriptVersion> {
  return invoke<ScriptVersion>("create_script_version", { input });
}

export async function getLatestScript(projectId: string): Promise<ScriptVersion | null> {
  return invoke<ScriptVersion | null>("get_latest_script", { projectId });
}

export async function listScriptVersions(projectId: string): Promise<ScriptVersion[]> {
  return invoke<ScriptVersion[]>("list_script_versions", { projectId });
}

export async function createScene(input: CreateSceneInput): Promise<StoryboardScene> {
  return invoke<StoryboardScene>("create_scene", { input });
}

export async function listScenes(projectId: string): Promise<StoryboardScene[]> {
  return invoke<StoryboardScene[]>("list_scenes", { projectId });
}

export async function updateScene(
  sceneId: string,
  input: UpdateSceneInput,
): Promise<StoryboardScene | null> {
  return invoke<StoryboardScene | null>("update_scene", { sceneId, input });
}

export async function deleteScene(sceneId: string): Promise<boolean> {
  return invoke<boolean>("delete_scene", { sceneId });
}

export async function reorderScenes(
  projectId: string,
  items: SceneReorderItem[],
): Promise<StoryboardScene[]> {
  return invoke<StoryboardScene[]>("reorder_scenes", { projectId, items });
}
