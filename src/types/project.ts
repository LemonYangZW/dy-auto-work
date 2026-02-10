export type ProjectStatus = "draft" | "rendering" | "completed" | "failed";

export interface Project {
  id: string;
  name: string;
  theme: string | null;
  target_platform: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  theme?: string | null;
  target_platform?: string | null;
}

export interface UpdateProjectInput {
  name?: string | null;
  theme?: string | null;
  target_platform?: string | null;
  status?: ProjectStatus | null;
}

export interface ScriptVersion {
  id: string;
  project_id: string;
  version_no: number;
  content: string;
  source: string | null;
  model: string | null;
  prompt_snapshot: string | null;
  created_at: string;
}

export interface CreateScriptVersionInput {
  project_id: string;
  content: string;
  source?: string | null;
  model?: string | null;
  prompt_snapshot?: string | null;
}

export interface StoryboardScene {
  id: string;
  project_id: string;
  script_version_id: string | null;
  scene_index: number;
  scene_text: string;
  visual_prompt: string | null;
  duration_ms: number;
  camera_hint: string | null;
}

export interface CreateSceneInput {
  project_id: string;
  script_version_id?: string | null;
  scene_text: string;
  visual_prompt?: string | null;
  duration_ms?: number | null;
  camera_hint?: string | null;
}

export interface UpdateSceneInput {
  script_version_id?: string | null;
  scene_text?: string | null;
  visual_prompt?: string | null;
  duration_ms?: number | null;
  camera_hint?: string | null;
}

export interface SceneReorderItem {
  id: string;
  scene_index: number;
}
