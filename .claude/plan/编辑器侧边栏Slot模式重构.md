# 编辑器侧边栏 Slot 模式重构计划

> **方案**: B - 组件注入 (Slot Pattern)
> **核心思路**: EditorLayout 提供插槽，各 Workspace 自行注册侧边栏内容

---

## 一、架构设计

### 1.1 SidebarContext + useSidebar Hook

```
EditorLayout (SidebarProvider)
  ├── [左侧 Panel] ← context.leftSidebar
  ├── [中间 Panel] ← <Outlet />
  │     └── ScriptWorkspace / StoryboardWorkspace / TimelineWorkspace
  │           └── useSidebar(<Left />, <Right />) ← 注册侧边栏
  └── [右侧 Panel] ← context.rightSidebar
```

- `SidebarContext`: React Context 存储 `leftSidebar` / `rightSidebar` (ReactNode)
- `useSidebar(left, right, deps)`: Hook 封装注册 + 卸载清理
- 使用 `useLayoutEffect` 避免切换闪烁

### 1.2 各 Tab 侧边栏内容规划

| Tab | 左侧 | 右侧 |
|-----|------|------|
| **剧本** | 剧本大纲（Markdown 标题树）+ 版本历史 | AI 写作助手 + 剧本统计 |
| **分镜** | 场景列表导航 + 素材库 Tab | 选中场景属性 + AI 图像生成 |
| **视频** | 素材库（图片/音频/字幕） | 导出设置 + 项目概览 |

---

## 二、文件变更清单

### 新建文件 (5 个)

| 文件 | 说明 |
|------|------|
| `src/features/editor/context/sidebar-context.tsx` | Context 定义 + SidebarProvider |
| `src/features/editor/hooks/use-sidebar.ts` | useSidebar Hook |
| `src/features/editor/script/components/ScriptSidebar.tsx` | 剧本左右侧边栏 |
| `src/features/editor/storyboard/components/StoryboardSidebar.tsx` | 分镜左右侧边栏（迁移原逻辑） |
| `src/features/editor/timeline/components/TimelineSidebar.tsx` | 视频左右侧边栏 |

### 修改文件 (4 个)

| 文件 | 变更 |
|------|------|
| `src/features/editor/layout.tsx` | 移除 LeftSidebar/RightSidebar/ResourceItem，接入 SidebarProvider + 插槽渲染 |
| `src/stores/useEditorStore.ts` | 移除 `leftTab`/`setLeftTab`（下沉到分镜侧边栏本地状态） |
| `src/features/editor/script/ScriptWorkspace.tsx` | 调用 `useSidebar` 注入剧本侧边栏 |
| `src/features/editor/storyboard/StoryboardWorkspace.tsx` | 调用 `useSidebar` 注入分镜侧边栏 |
| `src/features/editor/timeline/TimelineWorkspace.tsx` | 调用 `useSidebar` 注入视频侧边栏 |

---

## 三、实施步骤

### Step 1: 基础设施
1. 新建 `sidebar-context.tsx`（Context + Provider）
2. 新建 `use-sidebar.ts`（Hook）

### Step 2: 重构 EditorLayout
1. 包裹 `SidebarProvider`
2. 左右面板改为读取 context 插槽内容
3. 删除 `LeftSidebar`、`RightSidebar`、`ResourceItem` 组件
4. 保留 `PropertyRow` 组件（移到共用位置或内联）

### Step 3: 分镜侧边栏（迁移原有逻辑）
1. 将原 `LeftSidebar` 场景列表 + 素材库迁移到 `StoryboardSidebar.tsx`
2. 将原 `RightSidebar` 场景属性 + AI 占位迁移到 `StoryboardSidebar.tsx`
3. `leftTab` 状态下沉为组件本地 state
4. `StoryboardWorkspace` 调用 `useSidebar` 注入

### Step 4: 剧本侧边栏（新增内容）
1. 左侧：Markdown 标题大纲 + 版本历史列表
2. 右侧：AI 写作助手（迁移 ScriptWorkspace 中 AI 按钮）+ 统计信息
3. `ScriptWorkspace` 调用 `useSidebar` 注入

### Step 5: 视频侧边栏（新增内容）
1. 左侧：素材库（复用原素材 Tab 样式）
2. 右侧：导出预设 + 项目概览
3. `TimelineWorkspace` 调用 `useSidebar` 注入

### Step 6: 清理 useEditorStore
1. 移除 `leftTab` / `setLeftTab`
2. 保留 `selectedSceneId` / `selectScene` / `reset`

---

## 四、设计一致性约束

- 容器：`<Card variant="default" className="h-full flex flex-col overflow-hidden">`
- 标题：`<LabelIndustrial>`
- 滚动：`<ScrollArea className="flex-1">`
- 按钮：`ghost` / `secondary` variant
- 分割：`<Separator className="bg-black/5" />`
- 空状态：`<div className="h-full flex flex-col items-center justify-center">`+ fallback 骨架屏
