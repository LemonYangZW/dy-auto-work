import { create } from "zustand";

/**
 * 编辑器 UI 状态 Store
 *
 * 管理编辑器内的全局选中状态等非持久化 UI 状态。
 * 不存入 localStorage —— 每次进入编辑器时重置。
 *
 * 注意: leftTab 已从全局 store 移除，
 * 下沉为各侧边栏组件的本地状态（Slot 模式重构）。
 */

interface EditorState {
  /** 当前选中的场景 ID */
  selectedSceneId: string | null;

  // --- Actions ---
  selectScene: (sceneId: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedSceneId: null as string | null,
};

export const useEditorStore = create<EditorState>()((set) => ({
  ...initialState,

  selectScene: (sceneId) => set({ selectedSceneId: sceneId }),

  reset: () => set(initialState),
}));
